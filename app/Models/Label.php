<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Label extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Relacionamento: Uma label tem muitos utilizadores
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'users_labels');
    }

    /**
     * Relacionamento: Uma label tem muitos passos de validação
     */
    public function validationSteps()
    {
        return $this->belongsToMany(FormValidationStep::class, 'validation_step_labels');
    }
}
