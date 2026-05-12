<?php

use App\Models\FormTemplate;
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
        'Total templates: ' . $templates->count(),
        '',
    ];

    foreach ($templates as $template) {
        $reportLines[] = 'Template ID: ' . $template->id;
        $reportLines[] = 'Name: ' . $template->name;
        $reportLines[] = 'Created by: ' . $template->created_by;
        $reportLines[] = 'Creator email: ' . $template->creator?->email;
        $reportLines[] = 'Structure: ' . json_encode($template->structure, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $reportLines[] = 'Validation sequence: ' . json_encode($template->validation_sequence);
        $reportLines[] = 'Allowed roles: ' . json_encode($template->allowed_roles);
        $reportLines[] = 'Created at: ' . $template->created_at;
        $reportLines[] = 'Updated at: ' . $template->updated_at;
        $reportLines[] = str_repeat('-', 80);
    }

    File::put($reportPath, implode(PHP_EOL, $reportLines));

    dump('--- API Templates database content output ---');
    dump(implode(PHP_EOL, $reportLines));
    dump('--- End of API Templates database content output ---');

    expect(File::exists($reportPath))->toBeTrue();
    expect(File::get($reportPath))->toContain('API Templates database report');
    expect(File::get($reportPath))->toContain('Template ID: ' . $templates->first()->id);
});
