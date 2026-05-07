<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormTemplate;
use App\Models\FormValidationStep;
use App\Models\Label;
use App\Models\FormSubmission;
use App\Models\FormSubmissionValidation;
use Illuminate\Support\Facades\DB;

class WorkflowController extends Controller
{
    /**
     * Obter todos os labels disponíveis
     */
    public function getLabels()
    {
        $labels = Label::with('users')->get();
        return response()->json($labels);
    }

    /**
     * Guardar workflow de um template
     */
    public function saveWorkflow(Request $request, FormTemplate $template)
    {
        $validated = $request->validate([
            'steps' => 'required|array',
            'steps.*.name' => 'required|string',
            'steps.*.type' => 'required|in:aprovar,informar',
            'steps.*.labels' => 'required|array',
            'steps.*.labels.*.id' => 'required|exists:labels,id',
            'steps.*.order' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Remover passos existentes
            FormValidationStep::where('form_template_id', $template->id)->delete();

            // Criar novos passos
            foreach ($validated['steps'] as $stepData) {
                $step = FormValidationStep::create([
                    'name' => $stepData['name'],
                    'form_template_id' => $template->id,
                    'labels_ids' => collect($stepData['labels'])->pluck('id')->toArray(),
                    'type' => $stepData['type'],
                    'order' => $stepData['order'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Workflow guardado com sucesso!',
                'data' => $template->load('validationSteps.labels')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao guardar workflow',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter workflow de um template
     */
    public function getWorkflow(FormTemplate $template)
    {
        $workflow = FormValidationStep::with('labels')
            ->where('form_template_id', $template->id)
            ->orderBy('order')
            ->get();

        return response()->json($workflow);
    }

    /**
     * Obter validações pendentes para um utilizador
     */
    public function getPendingValidations(Request $request)
    {
        $user = $request->user();
        
        $pendingValidations = FormSubmissionValidation::with([
            'formSubmission',
            'validationStep.labels',
            'formSubmission.template'
        ])
        ->where('status', FormSubmissionValidation::STATUS_PENDING)
        ->whereHas('validationStep', function ($query) use ($user) {
            $query->whereJsonContains('labels_ids', $user->labels->pluck('id'));
        })
        ->orderBy('order')
        ->get();

        return response()->json($pendingValidations);
    }

    /**
     * Processar uma validação
     */
    public function processValidation(Request $request, FormSubmissionValidation $validation)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'comments' => 'nullable|string',
        ]);

        $user = $request->user();

        // Verificar se o utilizador pode validar este passo
        if (!$validation->validationStep->canUserValidate($user)) {
            return response()->json([
                'message' => 'Não tem permissão para validar este passo'
            ], 403);
        }

        try {
            DB::beginTransaction();

            if ($validated['action'] === 'approve') {
                $validation->approve($user, $validated['comments']);
            } else {
                $validation->reject($user, $validated['comments']);
            }

            // Se foi rejeitado, marcar todos os passos seguintes como skipped
            if ($validation->status === FormSubmissionValidation::STATUS_REJECTED) {
                FormSubmissionValidation::where('form_submission_id', $validation->form_submission_id)
                    ->where('order', '>', $validation->order)
                    ->update(['status' => FormSubmissionValidation::STATUS_SKIPPED]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Validação processada com sucesso!',
                'data' => $validation->load('validationStep')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao processar validação',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar validações para uma nova submissão
     */
    public function createSubmissionValidations(FormSubmission $submission)
    {
        $validationSteps = FormValidationStep::where('form_template_id', $submission->form_template_id)
            ->orderBy('order')
            ->get();

        foreach ($validationSteps as $step) {
            FormSubmissionValidation::create([
                'form_submission_id' => $submission->id,
                'form_validation_step_id' => $step->id,
                'status' => FormSubmissionValidation::STATUS_PENDING,
                'order' => $step->order,
            ]);
        }
    }
}
