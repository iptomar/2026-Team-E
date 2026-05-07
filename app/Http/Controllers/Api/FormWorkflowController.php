<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormTemplate;
use Illuminate\Support\Facades\DB;

class FormWorkflowController extends Controller
{
    public function syncSteps(Request $request, $templateId)
    {
        $template = FormTemplate::findOrFail($templateId);

        DB::transaction(function () use ($template, $request) {
            // 1. Remove os passos antigos para reconstruir o fluxo
            $template->validationSteps()->delete();

            // 2. Salva os novos passos vindos do React Flow
            foreach ($request->nodes as $node) {
                if ($node['type'] === 'stepNode') {
                    $template->validationSteps()->create([
                        'name' => $node['data']['name'],
                        'type' => $node['data']['type'],
                        'labels_ids' => $node['data']['labels_ids'], // O seu array de IDs
                        'description' => $node['data']['description'] ?? null,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Fluxo salvo com sucesso!']);
    }
}
