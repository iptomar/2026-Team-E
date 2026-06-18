<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Department;
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
    }
}
