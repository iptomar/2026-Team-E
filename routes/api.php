<?php

use App\Http\Controllers\Api\DepartmentController;
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rota para guardar um novo template (Admin)
Route::post('/templates', [FormController::class, 'storeTemplate']);

// Rota para um utilizador buscar um template específico para preencher
Route::get('/templates/{id}', [FormController::class, 'showTemplate']);

// Rotas adicionais para templates
Route::get('/templates', [FormController::class, 'indexTemplates']);
Route::put('/templates/{id}', [FormController::class, 'updateTemplate']);
Route::delete('/templates/{id}', [FormController::class, 'destroyTemplate']);
Route::put('/templates/{id}/folder', [FormController::class, 'assignFolder']);
Route::get('/template-folders', [FormController::class, 'indexFolders']);
Route::post('/template-folders', [FormController::class, 'storeFolder']);
Route::delete('/template-folders/{folderId}', [FormController::class, 'destroyFolder']);
Route::put('/templates/{id}/folder', [FormController::class, 'assignFolder']);
Route::get('/template-folders', [FormController::class, 'indexFolders']);
Route::post('/template-folders', [FormController::class, 'storeFolder']);
Route::delete('/template-folders/{folderId}', [FormController::class, 'destroyFolder']);

// Rota para listar o histórico de versões/estruturas de um template específico
Route::get('/templates/{id}/structures', [FormController::class, 'indexStructures']);
// Rota para ativar ou desativar uma estrutura específica
Route::put('/structures/{structureId}/toggle-active', [FormController::class, 'toggleStructureActive']);

// Rota para submeter os dados preenchidos pelo utilizador
Route::post('/submissions', [FormSubmissionController::class, 'storeSubmission'])->middleware(['web', 'auth']);
Route::post('/submissions', [FormSubmissionController::class, 'storeSubmission'])->middleware(['web', 'auth']);

// Rota para visualizar o formulário preenchido (Template + Dados)
Route::get('/submissions/{id}', [FormSubmissionController::class, 'showSubmission'])->middleware(['web', 'auth']);
Route::get('/submissions/{id}', [FormSubmissionController::class, 'showSubmission'])->middleware(['web', 'auth']);

// Rotas adicionais para submissões
Route::get('/submissions', [FormSubmissionController::class, 'indexSubmissions'])->middleware(['web', 'auth']);
Route::put('/submissions/{id}', [FormSubmissionController::class, 'updateSubmission'])->middleware(['web', 'auth']);
Route::delete('/submissions/{id}', [FormSubmissionController::class, 'destroySubmission'])->middleware(['web', 'auth']);
Route::get('/submissions', [FormSubmissionController::class, 'indexSubmissions'])->middleware(['web', 'auth']);
Route::put('/submissions/{id}', [FormSubmissionController::class, 'updateSubmission'])->middleware(['web', 'auth']);
Route::delete('/submissions/{id}', [FormSubmissionController::class, 'destroySubmission'])->middleware(['web', 'auth']);

// Rota para listar validações pendentes do utilizador autenticado
Route::get('/validations', [FormSubmissionController::class, 'pendingValidations'])->middleware(['web', 'auth']);

// Rota para validar (aprovar/rejeitar/informar) um passo de workflow
Route::post('/submissions/{id}/validate', [FormSubmissionController::class, 'validateStep'])->middleware(['web', 'auth']);

Route::middleware(['web', 'auth', 'role:administrador'])->group(function () {
    // Listar todas as labels disponíveis para o editor
    Route::get('/labels', [LabelController::class, 'index']);

    // Criar/Editar labels (Cargos/Departamentos)
    Route::post('/labels', [LabelController::class, 'store']);
    Route::put('/labels/{id}', [LabelController::class, 'update']);


    // Salvar todo o fluxo desenhado no React Flow de uma vez
    // Esse endpoint processa o JSON do canvas e sincroniza a tabela form_validation_steps
    Route::post('/templates/{templateId}/workflow', [FormController::class, 'syncWorkflow']);

    // Buscar o workflow de um template para carregar no editor
    Route::get('/templates/{templateId}/workflow', [FormController::class, 'getWorkflow']);


    // ===== ROTAS DE GESTÃO DE DEPARTAMENTOS =====
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);


    // ===== ROTAS DE GESTÃO DE ROLES/LABELS/GRUPOS =====
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Adicionar/Remover utilizadores de roles
    Route::post('/roles/{id}/users', [RoleController::class, 'addUser']);
    Route::delete('/roles/{roleId}/users/{userId}', [RoleController::class, 'removeUser']);


    // ===== ROTAS DE GESTÃO DE UTILIZADORES =====
    Route::get('/users-management', [UserManagementController::class, 'index']);
    Route::get('/users-management/department/{departmentId}', [UserManagementController::class, 'byDepartment']);
    Route::get('/users-management/label/{labelId}', [UserManagementController::class, 'byLabel']);
    Route::get('/users-management/{id}', [UserManagementController::class, 'show']);
    Route::put('/users-management/{id}', [UserManagementController::class, 'update']);

    // Adicionar/Remover labels de utilizadores
    Route::post('/users-management/{id}/labels', [UserManagementController::class, 'addLabel']);
    Route::delete('/users-management/{userId}/labels/{labelId}', [UserManagementController::class, 'removeLabel']);
});
