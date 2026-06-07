<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\FormTemplateFolder;
use App\Models\FormTemplateStructure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class FormController extends Controller
{
    protected function supportsTemplateFolders(): bool
    {
        return Schema::hasTable('form_template_folders')
            && Schema::hasColumn('form_templates', 'folder_id');
    }

    /**
     * Passo 1: Guardar o Template (Configuração do Admin)
     */
    public function storeTemplate(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'structure' => 'required|array', // Recebido do frontend antigo
            'validation_sequence' => 'sometimes|array',
            'allowed_roles' => 'required|array',
        ];

        if ($this->supportsTemplateFolders()) {
            $rules['folder_id'] = 'nullable|exists:form_template_folders,id';
        }

        $validated = $request->validate($rules);

        if (! isset($validated['validation_sequence'])) {
            $validated['validation_sequence'] = [];
        }

        // Usamos uma Transaction para garantir que se um falhar, nenhum é guardado
        $template = DB::transaction(function () use ($validated) {
            $templatePayload = [
                'name' => $validated['name'],
                'validation_sequence' => $validated['validation_sequence'],
                'allowed_roles' => $validated['allowed_roles'],
                'created_by' => auth()->id() ?? 1,
                'folder_id' => $validated['folder_id'] ?? null,
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
                'is_active' => true,
            ]);

            return $template;
        });

        // O log continua a receber o $template, que agora inclui o 'structure' via accessor
        $this->appendSaveTemplateEventChainLog($request, $validated, $template);

        return response()->json([
            'message' => 'Template criado com sucesso!',
            'data' => $template, // Vai com o formato id, name, validation_sequence, allowed_roles, structure
        ], 201);
    }

    /**
     * Passo 2: Mostrar o Template para o utilizador preencher
     */
    public function showTemplate($id)
    {
        // Carrega a estrutura ativa e mantém a mais recente como fallback.
        $relations = ['activeStructure', 'latestStructure'];

        if ($this->supportsTemplateFolders()) {
            $relations[] = 'folder';
        }

        $template = FormTemplate::with($relations)->findOrFail($id);

        return response()->json($template);
    }

    /**
     * Listar todos os templates
     */
    public function indexTemplates()
    {
        // Trazemos o criador, a estrutura ativa e a mais recente como fallback.
        $relations = ['creator', 'activeStructure', 'latestStructure'];

        if ($this->supportsTemplateFolders()) {
            $relations[] = 'folder';
        }

        $templates = FormTemplate::with($relations)->get();

        return response()->json($templates);
    }

    /**
     * Atualizar um template existente (Cria uma NOVA versão da estrutura)
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = FormTemplate::findOrFail($id);

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'structure' => 'sometimes|required|array', // Nova estrutura vinda do builder
            'validation_sequence' => 'sometimes|array',
            'allowed_roles' => 'sometimes|required|array',
        ];

        if ($this->supportsTemplateFolders()) {
            $rules['folder_id'] = 'sometimes|nullable|exists:form_template_folders,id';
        }

        $validated = $request->validate($rules);

        DB::transaction(function () use ($template, $validated) {
            $payload = [];

            if (array_key_exists('name', $validated)) {
                $payload['name'] = $validated['name'];
            }

            if (array_key_exists('validation_sequence', $validated)) {
                $payload['validation_sequence'] = $validated['validation_sequence'];
            }

            if (array_key_exists('allowed_roles', $validated)) {
                $payload['allowed_roles'] = $validated['allowed_roles'];
            }

            if (array_key_exists('folder_id', $validated)) {
                $payload['folder_id'] = $validated['folder_id'];
            }

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
                    'is_active' => true,
                ]);
            }
        });

        // Recarrega o template com a nova estrutura para responder ao frontend
        $relations = ['activeStructure', 'latestStructure'];

        if ($this->supportsTemplateFolders()) {
            $relations[] = 'folder';
        }

        $template->load($relations);

        return response()->json([
            'message' => 'Template atualizado com sucesso!',
            'data' => $template,
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
            'message' => 'Template eliminado com sucesso!',
        ]);
    }

    public function indexFolders()
    {
        if (! $this->supportsTemplateFolders()) {
            return response()->json([]);
        }

        $folders = FormTemplateFolder::with('creator')
            ->withCount('templates')
            ->orderBy('name')
            ->get();

        return response()->json($folders);
    }

    public function storeFolder(Request $request)
    {
        if (! $this->supportsTemplateFolders()) {
            return response()->json([
                'message' => 'A funcionalidade de pastas ainda não está disponível neste ambiente.',
            ], 503);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:form_template_folders,name',
        ]);

        $folder = FormTemplateFolder::create([
            'name' => $validated['name'],
            'created_by' => auth()->id() ?? 1,
        ])->load('creator');

        return response()->json([
            'message' => 'Pasta criada com sucesso!',
            'data' => $folder,
        ], 201);
    }

    public function destroyFolder($folderId)
    {
        if (! $this->supportsTemplateFolders()) {
            return response()->json([
                'message' => 'A funcionalidade de pastas ainda não está disponível neste ambiente.',
            ], 503);
        }

        $folder = FormTemplateFolder::findOrFail($folderId);
        $folder->delete();

        return response()->json([
            'message' => 'Pasta eliminada com sucesso!',
        ]);
    }

    public function assignFolder(Request $request, $templateId)
    {
        if (! $this->supportsTemplateFolders()) {
            return response()->json([
                'message' => 'A funcionalidade de pastas ainda não está disponível neste ambiente.',
            ], 503);
        }

        $validated = $request->validate([
            'folder_id' => 'nullable|exists:form_template_folders,id',
        ]);

        $template = FormTemplate::findOrFail($templateId);
        $template->update([
            'folder_id' => $validated['folder_id'] ?? null,
        ]);
        $template->load(['creator', 'activeStructure', 'latestStructure', 'folder']);

        return response()->json([
            'message' => 'Pasta do template atualizada com sucesso!',
            'data' => $template,
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
            'versions' => $structures,
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
            'is_active' => 'required|boolean',
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

                // Mantém a coluna legada alinhada com a versão ativa, caso ainda exista.
                if (Schema::hasColumn('form_templates', 'structure')) {
                    FormTemplate::whereKey($templateId)->update([
                        'structure' => $structure->structure,
                    ]);
                }
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
                'is_active' => (bool) $structure->is_active,
            ],
        ]);
    }

    // Função de log mantida intacta
    protected function appendSaveTemplateEventChainLog(Request $request, array $validated, FormTemplate $template): void
    {
        $logPath = storage_path('logs/save-template-event-chain.txt');

        $lines = [
            str_repeat('=', 100),
            'Save template action',
            'Timestamp: '.now()->format('Y-m-d H:i:s.u'),
            'Action: save button clicked in builder UI',
            'Event: form builder collected template state from the store',
            'Variable: formName => '.$validated['name'],
            'Variable: fields => '.json_encode($validated['structure'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
            'Action: payload assembled for API call',
            'Variable: validation_sequence => '.json_encode($validated['validation_sequence']),
            'Variable: allowed_roles => '.json_encode($validated['allowed_roles']),
            'Action: browser sends POST request to /api/templates with same-origin credentials',
            'Action: Laravel matches request to route api/templates',
            'Action: middleware auth:sanctum validates authenticated user',
            'Action: FormController@storeTemplate is invoked',
            'Variable: request payload => '.json_encode($validated, JSON_UNESCAPED_UNICODE),
            'Action: request data validated according to controller rules',
            'Variable: validated data => '.json_encode($validated, JSON_UNESCAPED_UNICODE),
            'Action: FormTemplate model created in database',
            'Variable: created_template_id => '.$template->id,
            'Variable: created_by => '.$template->created_by,
            'Action: API returns JSON response to frontend',
            'Variable: response status => 201',
            'Variable: response body => '.json_encode($template->toArray(), JSON_UNESCAPED_UNICODE),
            str_repeat('-', 100),
        ];

        File::append($logPath, implode(PHP_EOL, $lines).PHP_EOL);
    }
}
