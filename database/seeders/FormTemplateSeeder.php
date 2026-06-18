<?php

namespace Database\Seeders;

use App\Support\FormTemplateImporter;
use Illuminate\Database\Seeder;

class FormTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $directory = database_path('templates');
        $count = app(FormTemplateImporter::class)->importFromDirectory($directory);

        $this->command?->info("Imported {$count} form template(s) from database/templates/");
    }
}
