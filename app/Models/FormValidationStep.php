<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormValidationStep extends Model
{
    protected $fillable = [
        'name', 
        'form_template_id', 
        'labels_ids', 
        'type'
    ];

    // Converte o JSON do banco para array de PHP automaticamente
    protected $casts = [
        'labels_ids' => 'array',
    ];

    /**
     * Template ao qual este passo pertence.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class, 'form_template_id');
    }
}