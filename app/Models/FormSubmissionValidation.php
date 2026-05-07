<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormSubmissionValidation extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_submission_id',
        'form_validation_step_id',
        'status',
        'validated_by',
        'validated_at',
        'comments',
        'order',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_SKIPPED = 'skipped';

    /**
     * Relacionamento: Pertence a uma submissão
     */
    public function formSubmission()
    {
        return $this->belongsTo(FormSubmission::class);
    }

    /**
     * Relacionamento: Pertence a um passo de validação
     */
    public function validationStep()
    {
        return $this->belongsTo(FormValidationStep::class);
    }

    /**
     * Relacionamento: Validado por um utilizador
     */
    public function validator()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    /**
     * Verifica se está pendente
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Verifica se está aprovado
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Verifica se está rejeitado
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Marca como aprovado
     */
    public function approve(User $validator, ?string $comments = null): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'validated_by' => $validator->id,
            'validated_at' => now(),
            'comments' => $comments,
        ]);
    }

    /**
     * Marca como rejeitado
     */
    public function reject(User $validator, ?string $comments = null): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'validated_by' => $validator->id,
            'validated_at' => now(),
            'comments' => $comments,
        ]);
    }
}
