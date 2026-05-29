<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormTemplate;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\FormTemplateStructure;

class FormController extends Controller
{
    /**
     * Passo 1: Guardar o Template (Configuração do Admin)
     */
    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'structure' => 'required|array', // Recebido do frontend antigo
            'validation_sequence' => 'sometimes|array',
            'allowed_roles' => 'required|array',
        ]);

        if (!isset($validated['validation_sequence'])) {
            $validated['validation_sequence'] = [];
        }

        // Usamos uma Transaction para garantir que se um falhar, nenhum é guardado
        $template = DB::transaction(function () use ($validated) {
            $templatePayload = [
                'name' => $validated['name'],
                'validation_sequence' => $validated['validation_sequence'],
                'allowed_roles' => $validated['allowed_roles'],
                'created_by' => auth()->id() ?? 1,
            ];

            // Compatibilidade com bases de dados antigas que ainda têm a coluna structure em form_templates.
            if (Schema::hasColumn('form_templates', 'structure')) {
                $templatePayload['structure'] = $validated['structure'];
            }

            // 1. Cria o template pai
            $template = FormTemplate::create($templatePayload);

            // 2. Cria a primeira estrutura na tabela filha
            $template->structures()->create([
                'structure' => $validated['structure'],
                'version' => 1,
                'is_active' => true
            ]);

            return $template;
        });

        // O log continua a receber o $template, que agora inclui o 'structure' via accessor
        $this->appendSaveTemplateEventChainLog($request, $validated, $template);

        return response()->json([
            'message' => 'Template criado com sucesso!',
            'data' => $template // Vai com o formato id, name, validation_sequence, allowed_roles, structure
        ], 201);
    }

    /**
     * Passo 2: Mostrar o Template para o utilizador preencher
     */
    public function showTemplate($id)
    {
        // O with('latestStructure') otimiza a BD. O accessor trata do resto.
        $template = FormTemplate::with('latestStructure')->findOrFail($id);
        return response()->json($template);
    }

    /**
     * Listar todos os templates
     */
    public function indexTemplates()
    {
        // Trazemos o criador e a estrutura mais recente de cada um
        $templates = FormTemplate::with(['creator', 'latestStructure'])->get();
        return response()->json($templates);
    }

    /**
     * Atualizar um template existente (Cria uma NOVA versão da estrutura)
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = FormTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'structure' => 'sometimes|required|array', // Nova estrutura vinda do builder
            'validation_sequence' => 'sometimes|array',
            'allowed_roles' => 'sometimes|required|array',
        ]);

        DB::transaction(function () use ($template, $validated) {
            $payload = array_filter([
                'name' => $validated['name'] ?? null,
                'validation_sequence' => $validated['validation_sequence'] ?? null,
                'allowed_roles' => $validated['allowed_roles'] ?? null,
            ]);

            // Compatibilidade com schema legado: mantém a coluna antiga alinhada quando existir.
            if (isset($validated['structure']) && Schema::hasColumn('form_templates', 'structure')) {
                $payload['structure'] = $validated['structure'];
            }

            // Atualiza os dados do pai (se enviados)
            $template->update($payload);

            // Se o frontend enviou uma nova estrutura, criamos uma nova versão na BD
            if (isset($validated['structure'])) {
                // Descobre o último número de versão existente
                $lastVersion = $template->structures()->max('version') ?? 0;

                // Desativa as versões antigas (opcional, bom para controle)
                $template->structures()->update(['is_active' => false]);

                // Cria o novo registo com a versão incrementada
                $template->structures()->create([
                    'structure' => $validated['structure'],
                    'version' => $lastVersion + 1,
                    'is_active' => true
                ]);
            }
        });

        // Recarrega o template com a nova estrutura para responder ao frontend
        $template->load('latestStructure');

        return response()->json([
            'message' => 'Template atualizado com sucesso!',
            'data' => $template
        ]);
    }

    /**
     * Eliminar um template
     */
    public function destroyTemplate($id)
    {
        $template = FormTemplate::findOrFail($id);
        
        // Graças ao cascadeOnDelete() na migração, as estruturas apagam-se sozinhas
        $template->delete();

        return response()->json([
            'message' => 'Template eliminado com sucesso!'
        ]);
    }
    /**
     * Listar todas as versões de estrutura de um template específico (id, version, is_active)
     */
    public function indexStructures($id)
    {
        // 1. Garante que o template existe
        $template = FormTemplate::findOrFail($id);

        // 2. Procura as estruturas associadas, selecionando apenas as colunas necessárias
        $structures = $template->structures()
            ->select(['id', 'form_template_id', 'version', 'is_active', 'created_at'])
            ->orderBy('version', 'desc') // Mostra a mais recente primeiro
            ->get();

        // 3. Retorna a lista para o frontend
        return response()->json([
            'template_id' => $template->id,
            'template_name' => $template->name,
            'versions' => $structures
        ]);
    }
    /**
 * Ativa ou desativa uma estrutura específica com base no status enviado.
 * Garante que apenas UMA estrutura do mesmo template fica ativa.
 */
public function toggleStructureActive(Request $request, $structureId)
{
    // 1. Valida o payload para saber se o utilizador quer ativar (true) ou desativar (false)
    $validated = $request->validate([
        'is_active' => 'required|boolean'
    ]);

    // 2. Procura a estrutura alvo
    $structure = FormTemplateStructure::findOrFail($structureId);
    $templateId = $structure->form_template_id;
    $shouldActivate = $validated['is_active'];

    // 3. Executa a operação dentro de uma Transaction para segurança
    DB::transaction(function () use ($structure, $templateId, $shouldActivate) {
        if ($shouldActivate) {
            // REGRA: Se vai ativar esta, desativa TODAS as outras do mesmo template primeiro
            FormTemplateStructure::where('form_template_id', $templateId)
                ->where('id', '!=', $structure->id)
                ->update(['is_active' => false]);

            // Ativa a estrutura atual
            $structure->update(['is_active' => true]);
        } else {
            // Se o objetivo é desativar, apenas muda para false (permitindo que o template fique sem nenhuma ativa)
            $structure->update(['is_active' => false]);
        }
    });

    // 4. Retorna a resposta de sucesso com o estado atualizado
    return response()->json([
        'message' => $shouldActivate 
            ? 'Estrutura ativada com sucesso. Todas as outras foram desativadas.' 
            : 'Estrutura desativada com sucesso. O template não possui nenhuma estrutura ativa de momento.',
        'data' => [
            'structure_id' => $structure->id,
            'form_template_id' => $templateId,
            'version' => $structure->version,
            'is_active' => (bool)$structure->is_active
        ]
    ]);
}
    // Função de log mantida intacta
    protected function appendSaveTemplateEventChainLog(Request $request, array $validated, FormTemplate $template): void
    {
        $logPath = storage_path('logs/save-template-event-chain.txt');

        $lines = [
            str_repeat('=', 100),
            'Save template action',
            'Timestamp: ' . now()->format('Y-m-d H:i:s.u'),
            'Action: save button clicked in builder UI',
            'Event: form builder collected template state from the store',
            'Variable: formName => ' . $validated['name'],
            'Variable: fields => ' . json_encode($validated['structure'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            'Action: payload assembled for API call',
            'Variable: validation_sequence => ' . json_encode($validated['validation_sequence']),
            'Variable: allowed_roles => ' . json_encode($validated['allowed_roles']),
            'Action: browser sends POST request to /api/templates with same-origin credentials',
            'Action: Laravel matches request to route api/templates',
            'Action: middleware auth:sanctum validates authenticated user',
            'Action: FormController@storeTemplate is invoked',
            'Variable: request payload => ' . json_encode($validated, JSON_UNESCAPED_UNICODE),
            'Action: request data validated according to controller rules',
            'Variable: validated data => ' . json_encode($validated, JSON_UNESCAPED_UNICODE),
            'Action: FormTemplate model created in database',
            'Variable: created_template_id => ' . $template->id,
            'Variable: created_by => ' . $template->created_by,
            'Action: API returns JSON response to frontend',
            'Variable: response status => 201',
            'Variable: response body => ' . json_encode($template->toArray(), JSON_UNESCAPED_UNICODE),
            str_repeat('-', 100),
        ];

        File::append($logPath, implode(PHP_EOL, $lines) . PHP_EOL);
    }
}
