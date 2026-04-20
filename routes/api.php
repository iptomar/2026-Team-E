<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Rota para guardar um novo template (Admin)
Route::post('/templates', [FormController::class, 'storeTemplate']);

// Rota para um utilizador buscar um template específico para preencher
Route::get('/templates/{id}', [FormController::class, 'showTemplate']);


// Rota para submeter os dados preenchidos pelo utilizador
Route::post('/submissions', [FormSubmissionController::class, 'storeSubmission']);

// Rota para visualizar o formulário preenchido (Template + Dados)
Route::get('/submissions/{id}', [FormSubmissionController::class, 'showSubmission']);