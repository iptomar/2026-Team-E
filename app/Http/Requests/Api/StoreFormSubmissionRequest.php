<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFormSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'form_template_id' => ['required', 'integer', 'exists:form_templates,id'],
            'submitted_data' => ['required', 'array'],
            'current_step_index' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ];
    }
}
