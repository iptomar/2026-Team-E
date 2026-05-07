<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormValidationStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'form_template_id',
        'labels_ids',
        'type',
        'order',
    ];

    protected $casts = [
        'labels_ids' => 'array',
    ];

    /**
     * Relacionamento: Um passo pertence a um template
     */
    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class);
    }

    /**
     * Relacionamento: Um passo tem muitas labels
     */
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'validation_step_labels');
    }

    /**
     * Obtém os utilizadores responsáveis por este passo
     */
    public function getResponsibleUsers()
    {
        return User::whereHas('labels', function ($query) {
            $query->whereIn('labels.id', $this->labels_ids ?? []);
        })->get();
    }

    /**
     * Verifica se um utilizador pode validar este passo
     */
    public function canUserValidate(User $user): bool
    {
        return $user->labels()->whereIn('labels.id', $this->labels_ids ?? [])->exists();
    }
}
