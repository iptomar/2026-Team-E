<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\FormSubmission;
use App\Models\FormTemplate;
use App\Models\Label;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Departamentos
        $rh = Department::create(['name' => 'Recursos Humanos', 'description' => 'Gestão de pessoas']);
        $ti = Department::create(['name' => 'TI', 'description' => 'Tecnologia da Informação']);
        $financeiro = Department::create(['name' => 'Financeiro', 'description' => 'Gestão financeira']);

        // 2. Labels (apenas name está disponível na tabela atual)
        $diretorRh = Label::create(['name' => 'Diretor RH']);
        $tecnicoRh = Label::create(['name' => 'Técnico RH']);
        $diretorTi = Label::create(['name' => 'Diretor TI']);
        $analistaTi = Label::create(['name' => 'Analista TI']);
        $diretorFin = Label::create(['name' => 'Diretor Financeiro']);

        // 3. Utilizadores
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'department_id' => $ti->id,
                'email_verified_at' => now(),
            ]
        );

        $validatorRh = User::updateOrCreate(
            ['email' => 'validador-rh@example.com'],
            [
                'name' => 'Validador RH',
                'password' => Hash::make('password'),
                'role' => UserRole::Validator,
                'department_id' => $rh->id,
                'email_verified_at' => now(),
            ]
        );
        $validatorRh->labels()->attach($diretorRh->id);

        $validatorTi = User::updateOrCreate(
            ['email' => 'validador-ti@example.com'],
            [
                'name' => 'Validador TI',
                'password' => Hash::make('password'),
                'role' => UserRole::Validator,
                'department_id' => $ti->id,
                'email_verified_at' => now(),
            ]
        );
        $validatorTi->labels()->attach($diretorTi->id);

        $userRh = User::updateOrCreate(
            ['email' => 'user-rh@example.com'],
            [
                'name' => 'User RH',
                'password' => Hash::make('password'),
                'role' => UserRole::User,
                'department_id' => $rh->id,
                'email_verified_at' => now(),
            ]
        );
        $userRh->labels()->attach($tecnicoRh->id);

        // 4. Template com validation_sequence
        $template = FormTemplate::create([
            'name' => 'Pedido de Férias',
            'created_by' => $admin->id,
            'allowed_roles' => [],
            'validation_sequence' => [
                [
                    'name' => 'Aprovação do Diretor de RH',
                    'description' => 'Validação pelo diretor de RH',
                    'labels' => [
                        ['id' => $diretorRh->id, 'name' => 'Diretor RH'],
                    ],
                    'type' => 'approval',
                ],
                [
                    'name' => 'Aprovação do Diretor Financeiro',
                    'description' => 'Validação pelo diretor financeiro',
                    'labels' => [
                        ['id' => $diretorFin->id, 'name' => 'Diretor Financeiro'],
                    ],
                    'type' => 'approval',
                ],
            ],
        ]);

        // 5. Submissão pendente no primeiro passo
        FormSubmission::create([
            'form_template_id' => $template->id,
            'user_id' => $userRh->id,
            'submitted_data' => [
                'nome' => 'User RH',
                'data_inicio' => '2026-07-01',
                'data_fim' => '2026-07-15',
                'motivo' => 'Férias anuais',
            ],
            'current_step_index' => 0,
            'status' => 'pending',
        ]);
    }
}
