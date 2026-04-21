<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreFormTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'structure' => ['required', 'array', 'min:1'],
            'validation_sequence' => ['required', 'array'],
            'allowed_roles' => ['required', 'array', 'min:1'],
        ];
    }
}
