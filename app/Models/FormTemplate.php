<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FormTemplate extends Model
{
    protected $fillable = [
        'name',
        'structure',
        'validation_sequence',
        'allowed_roles',
        'created_by',
        'folder_id',
    ];

    protected $casts = [
        'structure' => 'array',
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
     * Vai buscar a estrutura atualmente ativa.
     */
    public function activeStructure(): HasOne
    {
        return $this->hasOne(FormTemplateStructure::class)
            ->where('is_active', true);
    }

    /**
     * Accessor para o atributo 'structure'.
     * Quando o frontend pedir $template->structure, devolve o array da estrutura ativa
     * e usa a mais recente apenas como fallback.
     */
    public function getStructureAttribute()
    {
        $activeStructure = $this->relationLoaded('activeStructure')
            ? $this->activeStructure
            : $this->activeStructure()->first();

        if ($activeStructure) {
            return $activeStructure->structure;
        }

        $latestStructure = $this->relationLoaded('latestStructure')
            ? $this->latestStructure
            : $this->latestStructure()->first();

        return $latestStructure?->structure ?? [];
    }

    /**
     * Relacionamento com o criador (usado no indexTemplates)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(FormTemplateFolder::class, 'folder_id');
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
