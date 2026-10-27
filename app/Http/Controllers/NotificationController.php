<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Redirect langsung ke dashboard karena notifikasi kini menggunakan floating drawer di sebelah kanan.
     */
    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('dashboard');
    }

    /**
     * Menandai notifikasi sebagai dibaca dan redirect ke halaman yang sesuai dengan hak akses role pengguna.
     */
    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $notif = $request->user()->notifications()->whereKey($notification)->first();

        if ($notif) {
            $notif->markAsRead();

            $inspectionId = $notif->data['inspection_id'] ?? null;
            if ($inspectionId) {
                $inspection = Inspection::with('ladder')->find($inspectionId);

                if ($inspection) {
                    $user = $request->user();

                    // 1. Jika inspeksi berstatus pending_review:
                    if ($inspection->workflow_status === 'pending_review') {
                        // Jika user adalah Inspektor yang ditugaskan atau Admin, arahkan ke halaman review
                        if ($user->isInspector() && ($user->isAdmin() || $inspection->inspector_id === $user->id)) {
                            return redirect()->route('inspections.review', $inspection->id);
                        }

                        // Untuk PIC Safety atau role lain, arahkan ke detail aset tangga
                        if ($inspection->ladder) {
                            return redirect()->route('ladders.show', $inspection->ladder->uuid);
                        }
                    }

                    // 2. Jika inspeksi berstatus needs_correction:
                    if ($inspection->workflow_status === 'needs_correction') {
                        // Hanya submitter asli, PIC Safety, atau Admin yang boleh membuka formulir koreksi
                        if ($inspection->submitted_by_id === $user->id || $user->isPicSafety() || $user->isAdmin()) {
                            return redirect()->route('inspections.correction', $inspection->id);
                        }

                        // Untuk Inspektor (yang sudah me-review), arahkan ke detail aset tangga alih-alih 403 Forbidden
                        if ($inspection->ladder) {
                            return redirect()->route('ladders.show', $inspection->ladder->uuid);
                        }
                    }

                    // 3. Jika inspeksi sudah disetujui (approved):
                    if ($inspection->workflow_status === 'approved' && $inspection->ladder) {
                        return redirect()->route('ladders.certificate', $inspection->ladder->uuid);
                    }

                    // Default redirect ke detail aset tangga
                    if ($inspection->ladder) {
                        return redirect()->route('ladders.show', $inspection->ladder->uuid);
                    }
                }
            }
        }

        return redirect()->back();
    }

    /**
     * Menandai seluruh notifikasi yang belum dibaca menjadi sudah dibaca.
     */
    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return redirect()->back()->with('success', 'Semua notifikasi berhasil ditandai telah dibaca.');
    }

    /**
     * Menghapus notifikasi spesifik.
     */
    public function destroy(Request $request, string $notification): RedirectResponse
    {
        $request->user()->notifications()->whereKey($notification)->delete();

        return redirect()->back()->with('success', 'Notifikasi berhasil dihapus.');
    }
}
