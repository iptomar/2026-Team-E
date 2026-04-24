<?php

use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\FormTemplateController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::apiResource('form-templates', FormTemplateController::class)
        ->only(['index', 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('form-templates', FormTemplateController::class)
            ->only(['store', 'update', 'destroy']);

        Route::get('form-submissions', [FormSubmissionController::class, 'index']);
        Route::post('form-submissions', [FormSubmissionController::class, 'store']);
        Route::get('form-submissions/{form_submission}', [FormSubmissionController::class, 'show']);
        Route::patch('form-submissions/{form_submission}', [FormSubmissionController::class, 'update']);
        Route::delete('form-submissions/{form_submission}', [FormSubmissionController::class, 'destroy']);
    });
});
