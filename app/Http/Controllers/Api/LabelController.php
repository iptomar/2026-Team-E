<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Label;

class LabelController extends Controller
{
    /**
     * Listar todas as labels (compatível com React Flow do workflow)
     */
    public function index()
    {
        // Retorna as labels com todos os campos necessários
        return response()->json(Label::with('department', 'users')->get());
    }

    /**
     * Criar uma nova label
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'access_level' => 'nullable|in:administrador,validador,utilizador',
            'department_id' => 'nullable|exists:departments,id',
            'cargo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $label = Label::create($validated);

        return response()->json([
            'message' => 'Label criado com sucesso!',
            'data' => $label->load('department', 'users')
        ], 201);
    }

    /**
     * Atualizar uma label
     */
    public function update(Request $request, $id)
    {
        $label = Label::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'access_level' => 'sometimes|in:administrador,validador,utilizador',
            'department_id' => 'nullable|exists:departments,id',
            'cargo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $label->update($validated);

        return response()->json([
            'message' => 'Label atualizado com sucesso!',
            'data' => $label->load('department', 'users')
        ]);
    }
}
