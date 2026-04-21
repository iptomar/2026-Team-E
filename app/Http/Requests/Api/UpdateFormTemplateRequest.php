<?php

namespace App\Http\Requests\Api;

class UpdateFormTemplateRequest extends StoreFormTemplateRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'structure' => ['sometimes', 'required', 'array', 'min:1'],
            'validation_sequence' => ['sometimes', 'required', 'array'],
            'allowed_roles' => ['sometimes', 'required', 'array', 'min:1'],
        ];
    }
}
