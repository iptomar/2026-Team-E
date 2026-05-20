<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Listar todos os departamentos
     */
    public function index()
    {
        $departments = Department::with('users', 'labels')->get();
        return response()->json($departments);
    }

    /**
     * Mostrar um departamento específico
     */
    public function show($id)
    {
        $department = Department::with('users', 'labels')->findOrFail($id);
        return response()->json($department);
    }

    /**
     * Criar um novo departamento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        return response()->json([
            'message' => 'Departamento criado com sucesso!',
            'data' => $department
        ], 201);
    }

    /**
     * Atualizar um departamento
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        return response()->json([
            'message' => 'Departamento atualizado com sucesso!',
            'data' => $department
        ]);
    }

    /**
     * Eliminar um departamento
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        
        // Verificar se há utilizadores associados
        if ($department->users()->count() > 0) {
            return response()->json([
                'error' => 'Não é possível eliminar um departamento com utilizadores associados.'
            ], 409);
        }

        $department->delete();

        return response()->json([
            'message' => 'Departamento eliminado com sucesso!'
        ]);
    }
}
