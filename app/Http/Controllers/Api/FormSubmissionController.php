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
        // O segredo está aqui: with() carrega a estrutura original + user + validation steps
        $submission = FormSubmission::with([
            'formTemplate',
            'formTemplate.validationSteps',
            'user'
        ])->findOrFail($id);

        return response()->json($submission);
    }

    /**
     * Listar submissões (filtradas por utilizador ou todas para admin)
     */
    public function indexSubmissions(Request $request)
    {
        $query = FormSubmission::with(['formTemplate', 'user']);

        // Filtrar apenas as submissões do utilizador autenticado
        if (auth()->check()) {
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
     * Listar submissões pendentes de validação para o utilizador autenticado
     */
    public function pendingValidations(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Não autenticado'], 401);
        }

        // IDs dos labels do utilizador
        $userLabelIds = $user->labels()->pluck('labels.id')->toArray();

        if (empty($userLabelIds)) {
            return response()->json([]);
        }

        // Buscar submissões pendentes com template
        $submissions = FormSubmission::with(['formTemplate', 'user', 'formTemplate.creator'])
            ->where('status', 'pending')
            ->get();

        // Filtrar: só as que têm um step atual cujos labels correspondem aos do user
        $pending = $submissions->filter(function ($submission) use ($userLabelIds) {
            $template = $submission->formTemplate;
            if (!$template) {
                return false;
            }

            $validationSequence = $template->validation_sequence;
            if (empty($validationSequence)) {
                return false;
            }

            $stepIndex = $submission->current_step_index ?? 0;
            if (!isset($validationSequence[$stepIndex])) {
                return false;
            }

            $currentStep = $validationSequence[$stepIndex];
            $stepLabels = $currentStep['labels'] ?? [];

            $stepLabelIds = array_column($stepLabels, 'id');

            return !empty(array_intersect($stepLabelIds, $userLabelIds));
        })->values();

        return response()->json($pending);
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
