<?php

use App\Models\FormTemplate;
use App\Models\User;

test('authenticated users can store templates from the builder payload', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Leave Request',
        'structure' => [
            [
                'id' => 'field-1',
                'type' => 'input',
                'label' => 'Employee Name',
                'name' => 'employee_name',
                'required' => true,
                'x' => 20,
                'y' => 20,
                'width' => 400,
                'height' => 60,
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson('/api/templates', $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('data.name', 'Leave Request')
        ->assertJsonPath('data.created_by', $user->id)
        ->assertJsonPath('data.validation_sequence', [])
        ->assertJsonPath('data.allowed_roles', []);

    $this->assertDatabaseHas('form_templates', [
        'name' => 'Leave Request',
        'created_by' => $user->id,
    ]);

    $template = FormTemplate::firstOrFail();

    expect($template->structure)->toMatchArray($payload['structure']);
    expect($template->validation_sequence)->toBe([]);
    expect($template->allowed_roles)->toBe([]);
});

test('authenticated users can update a saved template structure', function () {
    $user = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Expense Report',
        'structure' => [],
        'validation_sequence' => [],
        'allowed_roles' => [],
        'created_by' => $user->id,
    ]);

    $updatedStructure = [
        [
            'id' => 'field-2',
            'type' => 'textarea',
            'label' => 'Reason',
            'name' => 'reason',
            'required' => false,
            'x' => 40,
            'y' => 80,
            'width' => 400,
            'height' => 160,
        ],
    ];

    $response = $this->actingAs($user)->putJson("/api/templates/{$template->id}", [
        'name' => 'Expense Report v2',
        'structure' => $updatedStructure,
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.name', 'Expense Report v2')
        ->assertJsonPath('data.structure.0.name', 'reason');

    $template->refresh();

    expect($template->name)->toBe('Expense Report v2');
    expect($template->structure)->toMatchArray($updatedStructure);
});
