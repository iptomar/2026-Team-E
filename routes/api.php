<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\WorkflowController;


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


// Rotas para workflows
Route::get('/labels', [WorkflowController::class, 'getLabels']);
Route::post('/templates/{template}/workflow', [WorkflowController::class, 'saveWorkflow']);
Route::get('/templates/{template}/workflow', [WorkflowController::class, 'getWorkflow']);
Route::get('/validations/pending', [WorkflowController::class, 'getPendingValidations'])->middleware('auth:sanctum');
Route::post('/validations/{validation}/process', [WorkflowController::class, 'processValidation'])->middleware('auth:sanctum');

// Rotas para submissões (usando FormController atualizado)
Route::post('/submissions', [FormController::class, 'submitForm'])->middleware('auth:sanctum');
Route::get('/submissions', [FormController::class, 'getUserSubmissions'])->middleware('auth:sanctum');
Route::get('/submissions/{id}', [FormController::class, 'getSubmission'])->middleware('auth:sanctum');