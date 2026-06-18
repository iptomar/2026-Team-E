<?php

namespace App\Console\Commands;

use App\Support\FormTemplateImporter;
use Illuminate\Console\Command;

class ExportFormTemplates extends Command
{
    protected $signature = 'templates:export {--path= : Directory to write JSON files}';

    protected $description = 'Export form templates from the database to database/templates/*.json';

    public function handle(FormTemplateImporter $importer): int
    {
        $directory = $this->option('path') ?? database_path('templates');
        $count = $importer->exportToDirectory($directory);

        $this->info("Exported {$count} template(s) to {$directory}");

        return self::SUCCESS;
    }
}
