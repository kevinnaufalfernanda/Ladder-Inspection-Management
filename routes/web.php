<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\LadderController;
use App\Http\Controllers\InspectionController; // Diperbaiki: InspectionsController -> InspectionController
use App\Http\Controllers\NotificationController;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/qr/{ladder:uuid}', [LadderController::class, 'qr'])->name('ladders.qr');
Route::get('/qr/{ladder:uuid}/certificate', [LadderController::class, 'certificate'])->name('ladders.certificate');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard Utama
    Route::get('/dashboard', [LadderController::class, 'index'])->name('dashboard');
    
    // Menu Data Aset (Tabel)
    Route::get('/ladders', [LadderController::class, 'dataAset'])->name('ladders.index');
    Route::get('/ladders/create', [LadderController::class, 'create'])->name('ladders.create');
    
    // Rute detail tangga dengan UUID & Hapus Aset
    Route::get('/ladders/{ladder:uuid}', [LadderController::class, 'show'])->name('ladders.show');
    Route::delete('/ladders/{ladder:uuid}', [LadderController::class, 'destroy'])->name('ladders.destroy');

    // Menu Riwayat Inspeksi & Hapus Riwayat
    Route::get('/inspections/history', [InspectionController::class, 'history'])->name('inspections.history');
    Route::get('/inspections/review', [InspectionController::class, 'reviewQueue'])->name('inspections.review.queue');
    Route::get('/inspections/{inspection}/review', [InspectionController::class, 'review'])->name('inspections.review');
    Route::post('/inspections/{inspection}/review', [InspectionController::class, 'reviewStore'])->name('inspections.review.store');
    Route::get('/inspections/{inspection}/correction', [InspectionController::class, 'correction'])->name('inspections.correction');
    Route::post('/inspections/{inspection}/correction', [InspectionController::class, 'correctionStore'])->name('inspections.correction.store');
    Route::delete('/inspections/{inspection}', [InspectionController::class, 'destroy'])->name('inspections.destroy');

    // Fitur Inspeksi & Registrasi Aset
    Route::post('/ladders', [LadderController::class, 'store'])->name('ladders.store');
    Route::get('/ladders/{ladder:uuid}/inspect', [InspectionController::class, 'create'])->name('inspections.create');
    Route::post('/ladders/{ladder:uuid}/inspect', [InspectionController::class, 'store'])->name('inspections.store');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

});

require __DIR__.'/auth.php';