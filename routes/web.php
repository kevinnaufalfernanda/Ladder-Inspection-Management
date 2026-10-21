<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LadderController;
use App\Http\Controllers\InspectionController; // Diperbaiki: InspectionsController -> InspectionController

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Utama
    Route::get('/dashboard', [LadderController::class, 'index'])->name('dashboard');
    
    // Menu Data Aset (Tabel)
    Route::get('/ladders', [LadderController::class, 'dataAset'])->name('ladders.index');
    
    // Rute detail tangga dengan UUID & Hapus Aset
    Route::get('/ladders/{ladder:uuid}', [LadderController::class, 'show'])->name('ladders.show');
    Route::delete('/ladders/{ladder:uuid}', [LadderController::class, 'destroy'])->name('ladders.destroy');

    // Menu Riwayat Inspeksi & Hapus Riwayat
    Route::get('/inspections/history', [InspectionController::class, 'history'])->name('inspections.history');
    Route::delete('/inspections/{inspection}', [InspectionController::class, 'destroy'])->name('inspections.destroy');

    // Fitur Inspeksi & Registrasi Aset
    Route::post('/ladders', [LadderController::class, 'store'])->name('ladders.store');
    Route::get('/ladders/{ladder:uuid}/inspect', [InspectionController::class, 'create'])->name('inspections.create');
    Route::post('/ladders/{ladder:uuid}/inspect', [InspectionController::class, 'store'])->name('inspections.store');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';