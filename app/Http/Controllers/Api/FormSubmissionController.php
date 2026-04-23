<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormSubmission;

class FormSubmissionController extends Controller
{
    /**
     * Guarda os dados que o utilizador preencheu
     */
    public function storeSubmission(Request $request)
    {
        $validated = $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'submitted_data' => 'required|array',
        ]);

        $submission = FormSubmission::create([
            'form_template_id' => $validated['form_template_id'],
            'user_id' => auth()->id() ?? 1, // Simulação de utilizador logado
            'submitted_data' => $validated['submitted_data'],
            'status' => 'pending',
        ]);

        return response()->json($submission, 201);
    }

    /**
     * Mostra a submissão com o Template incluído
     */
    public function showSubmission($id)
    {
        // O segredo está aqui: with('formTemplate') carrega a estrutura original
        $submission = FormSubmission::with('formTemplate')->findOrFail($id);

        return response()->json($submission);
    }

    /**
     * Listar submissões (filtradas por utilizador ou todas para admin)
     */
    public function indexSubmissions(Request $request)
    {
        $query = FormSubmission::with(['formTemplate', 'user']);

        // Se não for admin, mostrar apenas as próprias submissões
        if (!auth()->user()?->hasRole('admin')) {
            $query->where('user_id', auth()->id());
        }

        $submissions = $query->get();
        return response()->json($submissions);
    }

    /**
     * Atualizar uma submissão
     */
    public function updateSubmission(Request $request, $id)
    {
        $submission = FormSubmission::findOrFail($id);

        // Verificar se o utilizador pode editar esta submissão
        if ($submission->user_id !== auth()->id() && !auth()->user()?->hasRole('admin')) {
            return response()->json(['error' => 'Não autorizado'], 403);
        }

        $validated = $request->validate([
            'submitted_data' => 'sometimes|required|array',
            'current_step_index' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:pending,submitted,approved,rejected',
        ]);

        $submission->update($validated);

        return response()->json([
            'message' => 'Submissão atualizada com sucesso!',
            'data' => $submission->load('formTemplate')
        ]);
    }

    /**
     * Eliminar uma submissão
     */
    public function destroySubmission($id)
    {
        $submission = FormSubmission::findOrFail($id);

        // Verificar se o utilizador pode eliminar esta submissão
        if ($submission->user_id !== auth()->id() && !auth()->user()?->hasRole('admin')) {
            return response()->json(['error' => 'Não autorizado'], 403);
        }

        $submission->delete();

        return response()->json([
            'message' => 'Submissão eliminada com sucesso!'
        ]);
    }
}
