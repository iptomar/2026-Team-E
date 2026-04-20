<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormTemplate;
use App\Models\FormSubmission;

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
}
