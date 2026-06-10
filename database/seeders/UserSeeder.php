<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed default users for development and testing.
     */
    public function run(): void
    {
        $defaultUsers = [
            [
                'name' => 'Administrador',
                'email' => 'admin@example.com',
                'role' => UserRole::Admin,
            ],
            [
                'name' => 'test',
                'email' => 'test@example.com',
                'role' => UserRole::User,
            ],
        ];

        foreach ($defaultUsers as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                    'email_verified_at' => now(),
                ]
            );
        }

        User::factory()->count(5)->create();
    }
}
