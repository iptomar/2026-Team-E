<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('builder', 'builder')->name('builder');
    Route::inertia('workflow', 'workflow')->name('workflow');
    Route::inertia('form', 'form')->name('form');
    Route::inertia('edit', 'edit')->name('edit');

});

require __DIR__.'/settings.php';
