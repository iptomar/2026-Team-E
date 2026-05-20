<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    /**
     * Listar todos os utilizadores com seus departamentos e labels
     */
    public function index()
    {
        $users = User::with('department', 'labels')->get();
        return response()->json($users);
    }

    /**
     * Mostrar um utilizador específico
     */
    public function show($id)
    {
        $user = User::with('department', 'labels')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Atualizar informações de departamento e cargo de um utilizador
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'department_id' => 'nullable|exists:departments,id',
            'cargo' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Utilizador atualizado com sucesso!',
            'data' => $user->load('department', 'labels')
        ]);
    }

    /**
     * Adicionar um label a um utilizador
     */
    public function addLabel(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $validated = $request->validate([
            'label_id' => 'required|exists:labels,id',
        ]);

        // Evitar duplicatas
        if ($user->labels()->where('label_id', $validated['label_id'])->exists()) {
            return response()->json([
                'error' => 'Este utilizador já tem este label/grupo.'
            ], 409);
        }

        $user->labels()->attach($validated['label_id']);

        return response()->json([
            'message' => 'Label adicionado ao utilizador com sucesso!',
            'data' => $user->load('department', 'labels')
        ]);
    }

    /**
     * Remover um label de um utilizador
     */
    public function removeLabel($userId, $labelId)
    {
        $user = User::findOrFail($userId);
        $user->labels()->detach($labelId);

        return response()->json([
            'message' => 'Label removido do utilizador com sucesso!',
            'data' => $user->load('department', 'labels')
        ]);
    }

    /**
     * Listar utilizadores por departamento
     */
    public function byDepartment($departmentId)
    {
        $users = User::where('department_id', $departmentId)
            ->with('department', 'labels')
            ->get();

        return response()->json($users);
    }

    /**
     * Listar utilizadores por label/grupo
     */
    public function byLabel($labelId)
    {
        $label = \App\Models\Label::findOrFail($labelId);
        $users = $label->users()->with('department', 'labels')->get();

        return response()->json($users);
    }
}
