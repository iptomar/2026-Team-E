<?php

namespace App\Services;

use App\Models\FormSubmission;
use App\Models\FormValidationStep;
use App\Models\FormSubmissionValidation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class WorkflowValidationService
{
    /**
     * Criar circuito de validação para uma nova submissão
     */
    public function createValidationCircuit(FormSubmission $submission): void
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

    /**
     * Verificar se o utilizador pode validar o passo atual
     */
    public function canUserValidateStep(User $user, FormSubmissionValidation $validation): bool
    {
        // Verificar se o utilizador tem permissão para este passo
        if (!$validation->validationStep->canUserValidate($user)) {
            return false;
        }

        // Verificar se o passo está pendente
        if (!$validation->isPending()) {
            return false;
        }

        // Verificar se os passos anteriores estão validados
        $previousValidations = FormSubmissionValidation::where('form_submission_id', $validation->form_submission_id)
            ->where('order', '<', $validation->order)
            ->get();

        foreach ($previousValidations as $previous) {
            if (!$previous->isApproved()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Processar validação de um passo
     */
    public function processValidation(User $user, FormSubmissionValidation $validation, string $action, ?string $comments = null): array
    {
        if (!$this->canUserValidateStep($user, $validation)) {
            throw new \Exception('Utilizador não tem permissão para validar este passo ou o passo não está disponível para validação.');
        }

        try {
            DB::beginTransaction();

            if ($action === 'approve') {
                $validation->approve($user, $comments);
                $message = 'Passo aprovado com sucesso!';
            } elseif ($action === 'reject') {
                $validation->reject($user, $comments);
                
                // Se rejeitado, marcar passos seguintes como skipped
                $this->skipSubsequentSteps($validation);
                $message = 'Passo rejeitado. Workflow interrompido.';
            } else {
                throw new \Exception('Ação inválida. Use "approve" ou "reject".');
            }

            // Verificar se o workflow está completo
            $isCompleted = $this->checkWorkflowCompletion($validation->form_submission_id);

            DB::commit();

            return [
                'success' => true,
                'message' => $message,
                'workflow_completed' => $isCompleted,
                'validation' => $validation->load('validationStep')
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Marcar passos seguintes como skipped quando um passo é rejeitado
     */
    private function skipSubsequentSteps(FormSubmissionValidation $rejectedValidation): void
    {
        FormSubmissionValidation::where('form_submission_id', $rejectedValidation->form_submission_id)
            ->where('order', '>', $rejectedValidation->order)
            ->where('status', FormSubmissionValidation::STATUS_PENDING)
            ->update(['status' => FormSubmissionValidation::STATUS_SKIPPED]);
    }

    /**
     * Verificar se o workflow está completo
     */
    public function checkWorkflowCompletion(int $submissionId): bool
    {
        $pendingValidations = FormSubmissionValidation::where('form_submission_id', $submissionId)
            ->where('status', FormSubmissionValidation::STATUS_PENDING)
            ->count();

        return $pendingValidations === 0;
    }

    /**
     * Obter próximo passo disponível para validação por um utilizador
     */
    public function getNextAvailableStep(User $user, int $submissionId): ?FormSubmissionValidation
    {
        return FormSubmissionValidation::with(['validationStep.labels', 'formSubmission'])
            ->where('form_submission_id', $submissionId)
            ->where('status', FormSubmissionValidation::STATUS_PENDING)
            ->whereHas('validationStep', function ($query) use ($user) {
                $query->whereJsonContains('labels_ids', $user->labels->pluck('id'));
            })
            ->orderBy('order')
            ->first();
    }

    /**
     * Obter todas as validações pendentes para um utilizador
     */
    public function getPendingValidationsForUser(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return FormSubmissionValidation::with([
            'formSubmission.template',
            'validationStep.labels'
        ])
        ->where('status', FormSubmissionValidation::STATUS_PENDING)
        ->whereHas('validationStep', function ($query) use ($user) {
            $query->whereJsonContains('labels_ids', $user->labels->pluck('id'));
        })
        ->whereDoesntHave('formSubmission.validations', function ($query) {
            $query->where('status', FormSubmissionValidation::STATUS_REJECTED);
        })
        ->orderBy('order')
        ->get();
    }

    /**
     * Obter status atual do workflow
     */
    public function getWorkflowStatus(int $submissionId): array
    {
        $validations = FormSubmissionValidation::with('validationStep')
            ->where('form_submission_id', $submissionId)
            ->orderBy('order')
            ->get();

        $status = [
            'completed' => $validations->where('status', FormSubmissionValidation::STATUS_APPROVED)->count(),
            'pending' => $validations->where('status', FormSubmissionValidation::STATUS_PENDING)->count(),
            'rejected' => $validations->where('status', FormSubmissionValidation::STATUS_REJECTED)->count(),
            'skipped' => $validations->where('status', FormSubmissionValidation::STATUS_SKIPPED)->count(),
            'total' => $validations->count(),
            'is_completed' => false,
            'current_step' => null
        ];

        $status['is_completed'] = $status['pending'] === 0 && $status['rejected'] === 0;
        $status['current_step'] = $validations->where('status', FormSubmissionValidation::STATUS_PENDING)->first();

        return $status;
    }
}
