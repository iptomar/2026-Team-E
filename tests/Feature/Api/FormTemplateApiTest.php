<?php

use App\Models\FormTemplate;
use App\Models\User;

test('guests can list form templates', function () {
    $creator = User::factory()->create();

    FormTemplate::create([
        'name' => 'Leave Request',
        'structure' => [['id' => 'field-1', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    $this->getJson('/api/v1/form-templates')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Leave Request');
});

test('authenticated users can create form templates', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/v1/form-templates', [
            'name' => 'Expense Claim',
            'structure' => [['id' => 'amount', 'type' => 'input']],
            'validation_sequence' => ['finance'],
            'allowed_roles' => ['employee'],
        ])
        ->assertCreated()
        ->assertJsonPath('data.created_by', $user->id);

    $this->assertDatabaseHas('form_templates', [
        'name' => 'Expense Claim',
        'created_by' => $user->id,
    ]);
});

test('users cannot update templates created by someone else', function () {
    $creator = User::factory()->create();
    $otherUser = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Original Template',
        'structure' => [['id' => 'field-1', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    $this->actingAs($otherUser)
        ->putJson("/api/v1/form-templates/{$template->id}", [
            'name' => 'Updated Template',
        ])
        ->assertForbidden();
});
