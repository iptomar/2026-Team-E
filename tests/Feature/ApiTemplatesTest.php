<?php

use App\Models\FormTemplate;
use App\Models\FormTemplateStructure;
use App\Models\User;
use Illuminate\Support\Facades\File;

/*
<?php
pest()->extend(TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

cada teste de Feature usa RefreshDatabase
a base de dados é reiniciada antes de cada teste
os dados criados num teste não existem no próximo teste
 */

// cria um user (admin) e um template, depois verifica se o template foi guardado na base de dados e se o conteúdo da base de dados é escrito num ficheiro de log
test('api templates endpoint stores a form template and database contains the saved record', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Teste de template',
        'structure' => [
            [
                'id' => 'field-1',
                'type' => 'input',
                'label' => 'Nome completo',
                'name' => 'full_name',
                'required' => true,
            ],
        ],
        'validation_sequence' => ['field-1'],
        'allowed_roles' => ['admin'],
    ];

    // submete o template usando a API e autentica como o user criado
    $response = $this->actingAs($user)
        ->postJson('/api/templates', $payload);

    // Verifica resposta da API
    $response->assertStatus(201)
        ->assertJsonPath('data.name', $payload['name'])
        ->assertJsonPath('data.structure', $payload['structure'])
        ->assertJsonPath('data.validation_sequence', $payload['validation_sequence'])
        ->assertJsonPath('data.allowed_roles', $payload['allowed_roles']);

    // Verifica que o template foi guardado na base de dados
    $this->assertDatabaseHas('form_templates', [
        'name' => $payload['name'],
        'created_by' => $user->id,
    ]);

    // compara o conteúdo do template guardado na base de dados (1º registo da db) com o payload enviado
    $template = FormTemplate::first();
    expect($template)->not->toBeNull();
    expect($template->name)->toBe($payload['name']);
    expect($template->created_by)->toBe($user->id);
    expect($template->structure)->toEqual($payload['structure']);
    expect($template->validation_sequence)->toEqual($payload['validation_sequence']);
    expect($template->allowed_roles)->toEqual($payload['allowed_roles']);
});

// cria um user (admin) e um template, depois verifica se o conteúdo da base de dados é escrito num ficheiro de log
test('writes database content to a log report after api template creation', function () {
    $user = User::factory()->create();

    $payload = [
        'name' => 'Relatório de template',
        'structure' => [
            [
                'id' => 'field-2',
                'type' => 'textarea',
                'label' => 'Descrição',
                'name' => 'description',
                'required' => false,
            ],
        ],
        'validation_sequence' => ['field-2'],
        'allowed_roles' => ['admin'],
    ];

    // submete o template usando a API e autentica como o user criado, verificando se a resposta é 201 (Created)
    $this->actingAs($user)->postJson('/api/templates', $payload)->assertStatus(201);

    // Carrega o conteúdo da base de dados para gerar o relatório
    $templates = FormTemplate::with('creator')->get();

    // Escreve o conteúdo da base de dados num ficheiro de log e também faz um dump para o console
    $reportPath = storage_path('logs/api-templates-db-report.txt');
    $reportLines = [
        'API Templates database report',
        '=============================',
        'Total templates: '.$templates->count(),
        '',
    ];

    foreach ($templates as $template) {
        $reportLines[] = 'Template ID: '.$template->id;
        $reportLines[] = 'Name: '.$template->name;
        $reportLines[] = 'Created by: '.$template->created_by;
        $reportLines[] = 'Creator email: '.$template->creator?->email;
        $reportLines[] = 'Structure: '.json_encode($template->structure, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $reportLines[] = 'Validation sequence: '.json_encode($template->validation_sequence);
        $reportLines[] = 'Allowed roles: '.json_encode($template->allowed_roles);
        $reportLines[] = 'Created at: '.$template->created_at;
        $reportLines[] = 'Updated at: '.$template->updated_at;
        $reportLines[] = str_repeat('-', 80);
    }

    File::put($reportPath, implode(PHP_EOL, $reportLines));

    dump('--- API Templates database content output ---');
    dump(implode(PHP_EOL, $reportLines));
    dump('--- End of API Templates database content output ---');

    expect(File::exists($reportPath))->toBeTrue();
    expect(File::get($reportPath))->toContain('API Templates database report');
    expect(File::get($reportPath))->toContain('Template ID: '.$templates->first()->id);
});

test('show template returns the active structure instead of always returning the latest version', function () {
    $user = User::factory()->create();

    $template = FormTemplate::create([
        'name' => 'Template com historico',
        'validation_sequence' => [],
        'allowed_roles' => ['admin'],
        'created_by' => $user->id,
    ]);

    $v1 = $template->structures()->create([
        'structure' => [['id' => 'field-v1', 'type' => 'input', 'label' => 'Versao 1', 'name' => 'v1']],
        'version' => 1,
        'is_active' => false,
    ]);

    $v2 = $template->structures()->create([
        'structure' => [['id' => 'field-v2', 'type' => 'input', 'label' => 'Versao 2', 'name' => 'v2']],
        'version' => 2,
        'is_active' => true,
    ]);

    $v3 = $template->structures()->create([
        'structure' => [['id' => 'field-v3', 'type' => 'input', 'label' => 'Versao 3', 'name' => 'v3']],
        'version' => 3,
        'is_active' => false,
    ]);

    $this->actingAs($user)
        ->putJson("/api/structures/{$v1->id}/toggle-active", [
            'is_active' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.structure_id', $v1->id)
        ->assertJsonPath('data.is_active', true);

    $templateResponse = $this->actingAs($user)
        ->getJson("/api/templates/{$template->id}");

    $templateResponse->assertOk()
        ->assertJsonPath('structure.0.id', 'field-v1')
        ->assertJsonPath('structure.0.label', 'Versao 1');

    expect(FormTemplateStructure::find($v1->id)?->is_active)->toBeTrue();
    expect(FormTemplateStructure::find($v2->id)?->is_active)->toBeFalse();
    expect(FormTemplateStructure::find($v3->id)?->is_active)->toBeFalse();
});

test('updating a template after activating an old version keeps old versions and creates a new active version', function () {
    $user = User::factory()->create();

    $createResponse = $this->actingAs($user)->postJson('/api/templates', [
        'name' => 'Template versionado',
        'structure' => [['id' => 'field-v1', 'type' => 'input', 'label' => 'Base', 'name' => 'base']],
        'validation_sequence' => [],
        'allowed_roles' => ['admin'],
    ]);

    $templateId = $createResponse->json('data.id');

    $this->actingAs($user)->putJson("/api/templates/{$templateId}", [
        'name' => 'Template versionado',
        'structure' => [['id' => 'field-v2', 'type' => 'input', 'label' => 'Mais recente', 'name' => 'latest']],
        'validation_sequence' => [],
        'allowed_roles' => ['admin'],
    ])->assertOk();

    $firstVersion = FormTemplateStructure::where('form_template_id', $templateId)
        ->where('version', 1)
        ->firstOrFail();

    $this->actingAs($user)
        ->putJson("/api/structures/{$firstVersion->id}/toggle-active", [
            'is_active' => true,
        ])
        ->assertOk();

    $this->actingAs($user)->putJson("/api/templates/{$templateId}", [
        'name' => 'Template versionado',
        'structure' => [['id' => 'field-v3', 'type' => 'input', 'label' => 'Nova derivada da ativa', 'name' => 'derived']],
        'validation_sequence' => [],
        'allowed_roles' => ['admin'],
    ])->assertOk();

    $structures = FormTemplateStructure::where('form_template_id', $templateId)
        ->orderBy('version')
        ->get();

    expect($structures)->toHaveCount(3);
    expect($structures->pluck('version')->all())->toBe([1, 2, 3]);
    expect($structures->where('version', 1)->first()?->is_active)->toBeFalse();
    expect($structures->where('version', 2)->first()?->is_active)->toBeFalse();
    expect($structures->where('version', 3)->first()?->is_active)->toBeTrue();

    $templateResponse = $this->actingAs($user)
        ->getJson("/api/templates/{$templateId}");

    $templateResponse->assertOk()
        ->assertJsonPath('structure.0.id', 'field-v3')
        ->assertJsonPath('structure.0.label', 'Nova derivada da ativa');
});

test('admin can create folders and assign templates to them', function () {
    $user = User::factory()->create();

    $folderResponse = $this->actingAs($user)->postJson('/api/template-folders', [
        'name' => 'Recursos Humanos',
    ]);

    $folderResponse->assertCreated()
        ->assertJsonPath('data.name', 'Recursos Humanos');

    $folderId = $folderResponse->json('data.id');

    $templateResponse = $this->actingAs($user)->postJson('/api/templates', [
        'name' => 'Pedido de Férias',
        'structure' => [['id' => 'field-1', 'type' => 'input', 'label' => 'Nome', 'name' => 'nome']],
        'validation_sequence' => [],
        'allowed_roles' => ['admin'],
        'folder_id' => $folderId,
    ]);

    $templateId = $templateResponse->json('data.id');

    $this->assertDatabaseHas('form_templates', [
        'id' => $templateId,
        'folder_id' => $folderId,
    ]);

    $this->actingAs($user)
        ->getJson('/api/templates')
        ->assertOk()
        ->assertJsonFragment([
            'id' => $templateId,
            'folder_id' => $folderId,
        ])
        ->assertJsonFragment([
            'id' => $folderId,
            'name' => 'Recursos Humanos',
        ]);

    $this->actingAs($user)
        ->putJson("/api/templates/{$templateId}/folder", [
            'folder_id' => null,
        ])
        ->assertOk()
        ->assertJsonPath('data.folder_id', null);

    $this->assertDatabaseHas('form_templates', [
        'id' => $templateId,
        'folder_id' => null,
    ]);
});

test('deleting a folder keeps templates and removes their folder assignment', function () {
    $user = User::factory()->create();

    $folderId = $this->actingAs($user)
        ->postJson('/api/template-folders', ['name' => 'Financeiro'])
        ->json('data.id');

    $templateId = $this->actingAs($user)
        ->postJson('/api/templates', [
            'name' => 'Reembolso',
            'structure' => [['id' => 'field-1', 'type' => 'input', 'label' => 'Valor', 'name' => 'valor']],
            'validation_sequence' => [],
            'allowed_roles' => ['admin'],
            'folder_id' => $folderId,
        ])
        ->json('data.id');

    $this->actingAs($user)
        ->deleteJson("/api/template-folders/{$folderId}")
        ->assertOk();

    $this->assertDatabaseMissing('form_template_folders', [
        'id' => $folderId,
    ]);

    $this->assertDatabaseHas('form_templates', [
        'id' => $templateId,
        'folder_id' => null,
    ]);
});
