<?php

use App\Models\FormSubmission;
use App\Models\FormTemplate;
use App\Models\User;
use Tests\TestCase;

class FormSubmissionApiTest extends TestCase
{
    public function test_authenticated_users_can_create_submissions_for_a_template()
    {
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
        ->assertJsonPath('data.form_template_id', $template->id)
        ->assertJsonPath('data.template_snapshot.id', $template->id)
        ->assertJsonPath('data.template_snapshot.name', 'Vacation Request')
    ->assertJsonPath('data.template_snapshot.structure.0.id', 'days');
}

public function test_users_only_see_their_own_submissions()
{
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
}

public function test_users_can_update_their_own_submission()
{
    $user = User::factory()->create();
    $creator = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Travel Request',
        'structure' => [['id' => 'destination', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    $submission = FormSubmission::create([
        'form_template_id' => $template->id,
        'user_id' => $user->id,
        'template_snapshot' => [
            'id' => $template->id,
            'name' => $template->name,
            'structure' => $template->structure,
            'validation_sequence' => $template->validation_sequence,
            'allowed_roles' => $template->allowed_roles,
            'created_by' => $template->created_by,
        ],
        'submitted_data' => ['destination' => 'Porto'],
        'current_step_index' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->patchJson("/api/v1/form-submissions/{$submission->id}", [
            'submitted_data' => ['destination' => 'Lisbon'],
        ])
        ->assertOk()
        ->assertJsonPath('data.submitted_data.destination', 'Lisbon');

    $this->assertDatabaseHas('form_submissions', [
        'id' => $submission->id,
    ]);
}

public function test_users_can_delete_their_own_submission()
{
    $user = User::factory()->create();
    $creator = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Equipment Request',
        'structure' => [['id' => 'item', 'type' => 'input']],
        'validation_sequence' => ['manager'],
        'allowed_roles' => ['employee'],
        'created_by' => $creator->id,
    ]);

    $submission = FormSubmission::create([
        'form_template_id' => $template->id,
        'user_id' => $user->id,
        'template_snapshot' => [
            'id' => $template->id,
            'name' => $template->name,
            'structure' => $template->structure,
            'validation_sequence' => $template->validation_sequence,
            'allowed_roles' => $template->allowed_roles,
            'created_by' => $template->created_by,
        ],
        'submitted_data' => ['item' => 'Laptop'],
        'current_step_index' => 0,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->deleteJson("/api/v1/form-submissions/{$submission->id}")
        ->assertNoContent();

    $this->assertDatabaseMissing('form_submissions', [
        'id' => $submission->id,
    ]);
}
}
