<?php

use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\FormTemplateController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::apiResource('form-templates', FormTemplateController::class)
        ->only(['index', 'show']);

    Route::middleware('auth')->group(function () {
        Route::apiResource('form-templates', FormTemplateController::class)
            ->except(['index', 'show']);

        Route::get('form-submissions', [FormSubmissionController::class, 'index']);
        Route::post('form-submissions', [FormSubmissionController::class, 'store']);
        Route::get('form-submissions/{formSubmission}', [FormSubmissionController::class, 'show']);
    });
});
