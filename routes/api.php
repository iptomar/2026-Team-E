<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\FormSubmissionController;


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


// Rota para submeter os dados preenchidos pelo utilizador
Route::post('/submissions', [FormSubmissionController::class, 'storeSubmission']);

// Rota para visualizar o formulário preenchido (Template + Dados)
Route::get('/submissions/{id}', [FormSubmissionController::class, 'showSubmission']);

// Rotas adicionais para submissões
Route::get('/submissions', [FormSubmissionController::class, 'indexSubmissions']);
Route::put('/submissions/{id}', [FormSubmissionController::class, 'updateSubmission']);
Route::delete('/submissions/{id}', [FormSubmissionController::class, 'destroySubmission']);