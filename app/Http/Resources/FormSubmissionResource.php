<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'form_template_id' => $this->form_template_id,
            'user_id' => $this->user_id,
            'submitted_data' => $this->submitted_data,
            'current_step_index' => $this->current_step_index,
            'status' => $this->status,
            'form_template' => $this->whenLoaded('formTemplate', fn () => [
                'id' => $this->formTemplate->id,
                'name' => $this->formTemplate->name,
            ]),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
