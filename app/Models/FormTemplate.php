<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormTemplate extends Model
{
    use HasFactory;

    // 1. Definir quais campos podem ser preenchidos em massa (Segurança)
    protected $fillable = [
        'name',
        'structure',
        'validation_sequence',
        'allowed_roles',
        'created_by'
    ];

    // 2. Configurar o Casting (A parte mais importante para o teu projeto)
    protected $casts = [
        'structure' => 'array',
        'validation_sequence' => 'array',
        'allowed_roles' => 'array',
    ];

    /**
     * Relacionamento: Um template pertence a um utilizador (Admin)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
