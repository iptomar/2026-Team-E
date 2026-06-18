<?php

namespace App\Support;

use App\Models\FormTemplate;
use App\Models\Label;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;

class FormTemplateImporter
{
    public function importFromDirectory(string $directory): int
    {
        if (! is_dir($directory)) {
            return 0;
        }

        $count = 0;

        foreach (glob($directory.'/*.json') ?: [] as $path) {
            $data = json_decode((string) file_get_contents($path), true);

            if (! is_array($data) || empty($data['name'])) {
                continue;
            }

            $this->import($data);
            $count++;
        }

        return $count;
    }

    public function import(array $data): FormTemplate
    {
        $admin = User::where('email', 'admin@example.com')->first()
            ?? User::query()->where('role', 'administrador')->first()
            ?? User::query()->first();

        if (! $admin) {
            throw new RuntimeException('No admin user found. Run UserSeeder first.');
        }

        $validationSequence = $this->resolveValidationSequence($data['validation_sequence'] ?? []);
        $structure = $data['structure'] ?? [];

        return DB::transaction(function () use ($data, $admin, $validationSequence, $structure) {
            $payload = [
                'validation_sequence' => $validationSequence,
                'allowed_roles' => $data['allowed_roles'] ?? [],
                'created_by' => $admin->id,
            ];

            if (Schema::hasColumn('form_templates', 'structure')) {
                $payload['structure'] = $structure;
            }

            $template = FormTemplate::updateOrCreate(
                ['name' => $data['name']],
                $payload,
            );

            $activeStructure = $template->structures()->where('is_active', true)->first();

            if ($activeStructure) {
                $activeStructure->update(['structure' => $structure]);
            } else {
                $template->structures()->update(['is_active' => false]);

                $lastVersion = $template->structures()->max('version') ?? 0;

                $template->structures()->create([
                    'structure' => $structure,
                    'version' => $lastVersion + 1,
                    'is_active' => true,
                ]);
            }

            return $template->fresh(['activeStructure']);
        });
    }

    public function exportToDirectory(string $directory): int
    {
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $count = 0;

        foreach (FormTemplate::with('activeStructure')->get() as $template) {
            $filename = Str::slug($template->name).'.json';

            file_put_contents(
                $directory.'/'.$filename,
                json_encode($this->toExportArray($template), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE).PHP_EOL,
            );

            $count++;
        }

        return $count;
    }

    /**
     * @return array<string, mixed>
     */
    public function toExportArray(FormTemplate $template): array
    {
        $sequence = array_map(function (array $step): array {
            if (! isset($step['labels']) || ! is_array($step['labels'])) {
                return $step;
            }

            $step['labels'] = array_values(array_filter(array_map(function (array $label): ?array {
                $name = $label['name'] ?? Label::find($label['id'] ?? null)?->name;

                return $name ? ['name' => $name] : null;
            }, $step['labels'])));

            return $step;
        }, $template->validation_sequence ?? []);

        return [
            'name' => $template->name,
            'structure' => $template->structure ?? [],
            'validation_sequence' => $sequence,
            'allowed_roles' => $template->allowed_roles ?? [],
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $sequence
     * @return array<int, array<string, mixed>>
     */
    protected function resolveValidationSequence(array $sequence): array
    {
        return array_map(function ($step): array|string {
            if (! is_array($step)) {
                return $step;
            }

            if (! isset($step['labels']) || ! is_array($step['labels'])) {
                return $step;
            }

            $step['labels'] = array_map(function (array $label): array {
                $name = $label['name'] ?? null;

                if (! $name) {
                    return $label;
                }

                $model = Label::where('name', $name)->first();

                return [
                    'id' => $model?->id,
                    'name' => $name,
                ];
            }, $step['labels']);

            return $step;
        }, $sequence);
    }
}
