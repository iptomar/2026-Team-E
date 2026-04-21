<?php

use App\Models\FormSubmission;
use App\Models\FormTemplate;
use App\Models\User;

test('authenticated users can create submissions for a template', function () {
    $user = User::factory()->create();
    $creator = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Vacation Request',
        'structure' => [['id' => 'days', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    $this->actingAs($user)
        ->postJson('/api/v1/form-submissions', [
            'form_template_id' => $template->id,
            'submitted_data' => ['days' => 5],
        ])
        ->assertCreated()
        ->assertJsonPath('data.user_id', $user->id)
        ->assertJsonPath('data.form_template_id', $template->id);
});

test('users only see their own submissions', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $creator = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Purchase Request',
        'structure' => [['id' => 'value', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    FormSubmission::create([
        'form_template_id' => $template->id,
        'user_id' => $user->id,
        'submitted_data' => ['value' => 100],
        'current_step_index' => 0,
        'status' => 'pending',
    ]);

    FormSubmission::create([
        'form_template_id' => $template->id,
        'user_id' => $otherUser->id,
        'submitted_data' => ['value' => 200],
        'current_step_index' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->getJson('/api/v1/form-submissions')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.user_id', $user->id);
});
