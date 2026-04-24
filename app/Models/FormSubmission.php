<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FormSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_template_id', 
        'user_id', 
        'submitted_data', 
        'current_step_index', 
        'status'
    ];

    protected $casts = [
        'submitted_data' => 'array', // Crucial para ler as respostas do utilizador como array
    ];

    /**
     * Relacionamento: Uma submissão pertence a um utilizador
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relacionamento: Uma submissão pertence a um template
     */
    public function formTemplate()
    {
        return $this->belongsTo(FormTemplate::class);
    }
}
