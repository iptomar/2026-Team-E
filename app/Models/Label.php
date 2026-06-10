<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Label extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Um label pertence a um departamento
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Um label tem múltiplos utilizadores (muitos-para-muitos)
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_labels');
    }

    /**
     * Um label pode estar associado a múltiplos passos de validação
     */
    public function validationSteps()
    {
        return $this->hasMany(FormValidationStep::class, 'labels_ids');
    }
}