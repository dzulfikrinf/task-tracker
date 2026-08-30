<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

Route::middleware(['auth'])->group(function () {
    Route::resource('projects', ProjectController::class)
        ->except(['create', 'edit', 'update', 'destroy']);

    Route::resource('tasks', TaskController::class)
        ->only(['store', 'update', 'destroy']);

    Route::post('/tasks/{task}/assign', [TaskController::class, 'assign'])
        ->name('tasks.assign');

    // pasang middleware project.owner khusus buat update & delete project
    Route::middleware(['project.owner'])->group(function () {
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    });
});

require __DIR__ . '/auth.php';
