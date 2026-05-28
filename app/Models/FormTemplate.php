<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FormTemplate extends Model
{
    protected $fillable = [
        'name',
        'validation_sequence',
        'allowed_roles',
        'created_by',
    ];

    protected $casts = [
        'validation_sequence' => 'array',
        'allowed_roles' => 'array',
    ];

    /**
     * Força o Laravel a incluir o atributo virtual 'structure' no JSON de resposta.
     */
    protected $appends = ['structure'];

    /**
     * Relacionamento com todas as estruturas.
     */
    public function structures(): HasMany
    {
        return $this->hasMany(FormTemplateStructure::class);
    }

    /**
     * Vai buscar apenas a estrutura mais recente (Última versão criada).
     */
    public function latestStructure(): HasOne
    {
        return $this->hasOne(FormTemplateStructure::class)->latestOfMany();
    }

    /**
     * Accessor para o atributo 'structure'.
     * Quando o frontend pedir $template->structure, devolve o array da estrutura mais recente.
     */
    public function getStructureAttribute()
    {
        // Carrega a relação se ainda não tiver sido carregada e devolve apenas o array da 'structure'
        return $this->latestStructure ? $this->latestStructure->structure : [];
    }

    /**
     * Relacionamento com o criador (usado no indexTemplates)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    /**
     * Relacionamento: Um template tem múltiplas submissões
     */
    public function submissions()
    {
        return $this->hasMany(FormSubmission::class);
    }

    // app/Models/FormTemplate.php

    public function validationSteps()
    {
        // Verifique se o nome da classe está correto e importado
        return $this->hasMany(FormValidationStep::class);
    }

    protected static function booted(): void
    {
        static::deleting(function ($template) {
            // Elimina em cascata os registos das tabelas relacionadas antes de apagar o template pai
            $template->submissions()->delete();
            $template->validationSteps()->delete();
            
            // Se as estruturas não tiverem o cascade configurado na BD por algum motivo, 
            // podes descomentar a linha abaixo para garantir pelo Eloquent:
            $template->structures()->delete();
        });
    }
}


   