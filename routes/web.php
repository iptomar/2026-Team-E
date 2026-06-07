<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('form', 'form')->name('form');
    Route::inertia('forms-list', 'forms-list')->name('forms-list');
    Route::inertia('submission-details', 'submission-details')->name('submission-details');
    Route::redirect('form', 'preencher-formularios');
    Route::inertia('preencher-formularios', 'form')->name('forms.fill');

    Route::middleware('role:administrador,validador')->group(function () {
        Route::inertia('workflow-approvals', 'workflow-approvals')->name('workflow-approvals');
    });

    Route::middleware('role:administrador')->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
        Route::inertia('builder', 'builder')->name('builder');
        Route::inertia('workflow', 'workflow')->name('workflow');
        Route::inertia('admin-panel', 'admin-panel')->name('admin-panel');
        Route::inertia('edit', 'edit')->name('edit');
    });
});

require __DIR__.'/settings.php';
