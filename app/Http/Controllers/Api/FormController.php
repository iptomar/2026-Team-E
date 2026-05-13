<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormTemplate;
use App\Models\FormSubmission;
use Illuminate\Support\Facades\File;

class FormController extends Controller
{
    /**
     * Passo 1: Guardar o Template (Configuração do Admin)
     */
    public function storeTemplate(Request $request)
    {
        // 1. Validação: Garante que os dados são obrigatórios e no formato correto
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'structure' => 'required|array', // O JSON do Drag-and-Drop
            'validation_sequence' => 'required|array',
            'allowed_roles' => 'required|array',
        ]);

        // 2. Gravação: Usa o Model FormTemplate para inserir na BD
        $template = FormTemplate::create([
            'name' => $validated['name'],
            'structure' => $validated['structure'],
            'validation_sequence' => $validated['validation_sequence'],
            'allowed_roles' => $validated['allowed_roles'],
            'created_by' => auth()->id() ?? 1, // Usa o ID do admin logado
        ]);

        // Log do evento de criação do template (para auditoria)
        $this->appendSaveTemplateEventChainLog($request, $validated, $template);

        // 3. Resposta: Devolve o objeto criado e um código 201 (Created)
        return response()->json([
            'message' => 'Template criado com sucesso!',
            'data' => $template
        ], 201);
    }

    /**
     * Passo 2: Mostrar o Template para o utilizador preencher
     */
    public function showTemplate($id)
    {
        $template = FormTemplate::findOrFail($id);
        return response()->json($template);
    }

    /**
     * Listar todos os templates (para admin ou utilizadores autorizados)
     */
    public function indexTemplates()
    {
        $templates = FormTemplate::with('creator')->get();
        return response()->json($templates);
    }

    /**
     * Atualizar um template existente
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = FormTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'structure' => 'sometimes|required|array',
            'validation_sequence' => 'sometimes|required|array',
            'allowed_roles' => 'sometimes|required|array',
        ]);

        $template->update($validated);

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
        $template->delete();

        return response()->json([
            'message' => 'Template eliminado com sucesso!'
        ]);
    }


    

    // Função auxiliar para escrever um log detalhado do processo de criação do template
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
