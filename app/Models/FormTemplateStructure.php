<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormTemplateStructure extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser preenchidos em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'form_template_id',
        'structure',
        'version',
        'is_active',
    ];

    /**
     * Os atributos que devem ser convertidos para tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'structure' => 'array',      // Transforma o JSON da DB num array PHP automaticamente
        'version' => 'integer',
        'is_active' => 'boolean',    // Transforma 0/1 da DB em true/false
    ];

    /**
     * Obtém o template principal ao qual esta estrutura pertence.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class, 'form_template_id');
    }
}