<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Listar todos os labels/grupos/roles
     */
    public function index()
    {
        $labels = Label::with('department', 'users')->get();
        return response()->json($labels);
    }

    /**
     * Mostrar um label/grupo/role específico
     */
    public function show($id)
    {
        $label = Label::with('department', 'users')->findOrFail($id);
        return response()->json($label);
    }

    /**
     * Criar um novo label/grupo/role
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'access_level' => 'required|in:administrador,validador,utilizador',
            'department_id' => 'nullable|exists:departments,id',
            'cargo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $label = Label::create($validated);

        return response()->json([
            'message' => 'Grupo/Label criado com sucesso!',
            'data' => $label->load('department', 'users')
        ], 201);
    }

    /**
     * Atualizar um label/grupo/role
     */
    public function update(Request $request, $id)
    {
        $label = Label::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'access_level' => 'sometimes|required|in:administrador,validador,utilizador',
            'department_id' => 'nullable|exists:departments,id',
            'cargo' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $label->update($validated);

        return response()->json([
            'message' => 'Grupo/Label atualizado com sucesso!',
            'data' => $label->load('department', 'users')
        ]);
    }

    /**
     * Eliminar um label/grupo/role
     */
    public function destroy($id)
    {
        $label = Label::findOrFail($id);
        $label->delete();

        return response()->json([
            'message' => 'Grupo/Label eliminado com sucesso!'
        ]);
    }

    /**
     * Adicionar utilizador a um label/grupo
     */
    public function addUser(Request $request, $labelId)
    {
        $label = Label::findOrFail($labelId);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Evitar duplicatas
        if ($label->users()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'error' => 'Este utilizador já está neste grupo.'
            ], 409);
        }

        $label->users()->attach($validated['user_id']);

        return response()->json([
            'message' => 'Utilizador adicionado ao grupo com sucesso!',
            'data' => $label->load('users')
        ]);
    }

    /**
     * Remover utilizador de um label/grupo
     */
    public function removeUser($labelId, $userId)
    {
        $label = Label::findOrFail($labelId);
        $label->users()->detach($userId);

        return response()->json([
            'message' => 'Utilizador removido do grupo com sucesso!',
            'data' => $label->load('users')
        ]);
    }
}
