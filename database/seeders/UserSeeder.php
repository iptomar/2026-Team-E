<?php

namespace Database\Seeders;

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
            ['name' => 'test', 'email' => 'test@example.com'],
        ];

        foreach ($defaultUsers as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        User::factory()->count(5)->create();
    }
}
