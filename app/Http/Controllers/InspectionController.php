<?php

namespace App\Http\Controllers;

use App\Models\Ladder;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

class InspectionController extends Controller
{
    public function create(Ladder $ladder)
    {
        $ladder->load(['inspector:id,name,email', 'latestInspection']);

        return Inertia::render('Inspections/Create', [
            'ladder' => $ladder,
            'checklistConfig' => config('checklists'),
            'latestInspection' => $ladder->latestInspection,
        ]);
    }

    public function store(Request $request, Ladder $ladder)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:safe,unsafe',
            'inspection_type' => 'required|in:portable,permanent',
            'checklist' => 'required|array',
            'checklist_comments' => 'nullable|array',
            'photos' => 'nullable|array',
            'notes' => 'nullable|string',
            'return_to' => 'nullable|in:detail,dashboard',
        ]);

        // Validasi format foto untuk item yang mengunggah foto
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $key => $file) {
                $request->validate([
                    "photos.{$key}" => ['nullable', 'image', 'max:5120'],
                ]);
            }
        }

        $hasPreviousInspection = $ladder->inspections()->exists();

        // Jika ini adalah inspeksi pertama kali, semua checklist wajib terisi lengkap.
        // Jika ini adalah update / revisi berkala, PIC diizinkan menyimpan sebagian per butir item.
        if (! $hasPreviousInspection) {
            $allPassed = collect($validated['checklist'])->every(function ($checked) {
                return $checked === true || $checked === 1 || $checked === '1' || $checked === 'true';
            });

            if (! $allPassed) {
                return back()->withErrors([
                    'checklist' => 'Untuk pendaftaran inspeksi pertama kali, semua checklist wajib diisi lengkap.',
                ])->withInput();
            }
        } else {
            // Update berkala: minimal ada 1 checklist yang tercentang
            $anyPassed = collect($validated['checklist'])->contains(function ($checked) {
                return $checked === true || $checked === 1 || $checked === '1' || $checked === 'true';
            });

            if (! $anyPassed) {
                return back()->withErrors([
                    'checklist' => 'Pilih minimal satu checklist yang ingin diperbarui atau dilaporkan.',
                ])->withInput();
            }
        }

        // Ambil data checklist dan review lama jika ada agar item yang tidak dicentang di update ini tidak hilang
        $previousChecklist = [];
        $previousReviewData = [];
        if ($hasPreviousInspection && $ladder->latestInspection) {
            $previousChecklist = $ladder->latestInspection->checklist ?? [];
            $previousReviewData = $ladder->latestInspection->review_data ?? [];
        }

        // Simpan nilai boolean murni
        $normalizedChecklist = collect($validated['checklist'])->map(function ($checked) {
            return $checked === true || $checked === 1 || $checked === '1' || $checked === 'true';
        })->toArray();

        // Gabungkan dengan data checklist sebelumnya (merge)
        if ($hasPreviousInspection) {
            $mergedChecklist = array_merge($previousChecklist, $normalizedChecklist);
        } else {
            $mergedChecklist = $normalizedChecklist;
        }

        $photoPaths = $previousChecklist['photos'] ?? [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $key => $file) {
                if ($file) {
                    $photoPaths[$key] = $file->store("inspections/{$ladder->id}", 'public');
                }
            }
        }

        $mergedComments = array_merge($previousChecklist['comments'] ?? [], $validated['checklist_comments'] ?? []);

        // Deteksi item yang diperbarui oleh PIC
        $updatedKeys = (array) $request->input('updated_keys', []);
        if (empty($updatedKeys) && $hasPreviousInspection) {
            if ($request->hasFile('photos')) {
                $updatedKeys = array_merge($updatedKeys, array_keys($request->file('photos')));
            }
            if (!empty($validated['checklist_comments'])) {
                $updatedKeys = array_merge($updatedKeys, array_keys(array_filter($validated['checklist_comments'])));
            }
        }
        $updatedKeys = array_values(array_unique($updatedKeys));

        // Warisi review_data dari inspeksi sebelumnya:
        // Item yang diperbarui oleh PIC di-reset menjadi pending (decision = null).
        // Item yang TIDAK diperbarui TETAP mempertahankan keputusan sebelumnya (approved tetap approved, rejected tetap rejected).
        $initialReviewData = [];
        if (!empty($previousReviewData)) {
            $initialReviewData = $previousReviewData;
            foreach ($updatedKeys as $k) {
                $initialReviewData[$k] = [
                    'decision' => null,
                    'comment' => null,
                ];
            }
        }

        $inspection = $ladder->inspections()->create([
            'inspector_id' => $ladder->inspector_id ?? $request->user()->id,
            'submitted_by_id' => $request->user()->id,
            'status' => 'unsafe', // Belum disetujui; keputusan status kelayakan diserahkan ke Inspektor EHS saat review
            'workflow_status' => 'pending_review',
            'review_data' => $initialReviewData ?: null,
            'checklist' => array_merge(
                $mergedChecklist,
                ['inspection_type' => $validated['inspection_type']],
                ['comments' => $mergedComments],
                ['photos' => $photoPaths],
                ['updated_keys' => $updatedKeys]
            ),
            'valid_until' => null, // Ditetapkan saat approval oleh inspektor
            'notes' => $validated['notes']
        ]);

        $this->notifyUser($inspection->inspector_id, 'Pengajuan inspeksi baru menunggu review.', $inspection->id);

        $returnTo = $validated['return_to'] ?? 'dashboard';

        if ($returnTo === 'detail') {
            return redirect()->route('ladders.show', $ladder->uuid)
                ->with('success', 'Inspection recorded successfully.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'Inspection recorded successfully.');
    }

    public function history(Request $request)
    {
        $filters = $request->validate([
            'sort' => ['nullable', 'in:latest,oldest'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $query = Inspection::with(['ladder', 'inspector']);
        $query->orderBy('created_at', ($filters['sort'] ?? 'latest') === 'oldest' ? 'asc' : 'desc');

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $inspections = $query->get();

        return Inertia::render('Inspections/History', [
            'inspections' => $inspections,
            'filters' => [
                'sort' => $filters['sort'] ?? 'latest',
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
            ],
        ]);
    }

    public function reviewQueue(Request $request)
    {
        abort_unless($request->user()->isInspector(), 403);

        $query = Inspection::with(['ladder', 'submitter'])
            ->whereIn('workflow_status', ['pending_review', 'needs_correction']);

        if (!$request->user()->isAdmin()) {
            $query->where('inspector_id', $request->user()->id);
        }

        // Tampilkan 1 antrean per aset tangga (inspeksi paling baru) agar tidak menumpuk
        $inspections = $query->latest()
            ->get()
            ->unique('ladder_id')
            ->values();

        return Inertia::render('Inspections/ReviewQueue', [
            'inspections' => $inspections,
        ]);
    }

    public function review(Request $request, Inspection $inspection)
    {
        // Jika PIC Safety mengakses halaman review inspektor, arahkan ke detail tangga alih-alih 403
        if (!$request->user()->isInspector() && !$request->user()->isAdmin()) {
            return redirect()->route('ladders.show', $inspection->ladder->uuid)
                ->with('info', 'Halaman review hasil inspeksi ditujukan khusus untuk Inspektor EHS.');
        }

        abort_unless($request->user()->isInspector() && ($request->user()->isAdmin() || $inspection->inspector_id === $request->user()->id), 403);

        $inspection->load(['ladder', 'submitter']);
        $checklist = $inspection->checklist ?? [];
        $photos = $checklist['photos'] ?? [];
        $reviewData = $inspection->review_data ?? [];
        $updatedKeys = $checklist['updated_keys'] ?? [];

        // Jika updated_keys kosong tapi ada review_data dengan item yang pernah di-reject atau belum ada keputusan:
        if (empty($updatedKeys) && !empty($reviewData)) {
            $updatedKeys = collect($reviewData)
                ->filter(fn ($r) => ($r['decision'] ?? null) !== 'approved')
                ->keys()
                ->toArray();
        }

        // Cek juga jika ada foto yang spesifik dilampirkan
        if (empty($updatedKeys) && !empty($photos)) {
            $updatedKeys = array_keys(array_filter($photos));
        }

        $items = collect($checklist)
            ->filter(fn ($value, $key) => $key !== 'inspection_type' && $key !== 'photos' && $key !== 'comments' && $key !== 'updated_keys' && (is_bool($value) || $value === 1 || $value === 0 || $value === '1' || $value === '0'))
            ->map(fn ($value, $key) => [
                'key' => $key,
                'label' => str($key)->replace('_', ' ')->title()->toString(),
                'checked' => (bool) $value,
                'pic_comment' => $checklist['comments'][$key] ?? '',
                'photo_url' => (!empty($photos[$key])) ? Storage::disk('public')->url($photos[$key]) : null,
                'decision' => $inspection->review_data[$key]['decision'] ?? null,
                'comment' => $inspection->review_data[$key]['comment'] ?? '',
            ])->values();

        // Jika ini adalah update (hanya beberapa butir yang diperbarui oleh PIC)
        $isPartialUpdate = !empty($updatedKeys) && count($updatedKeys) < $items->count();
        $itemsToReview = $isPartialUpdate
            ? $items->filter(fn ($item) => in_array($item['key'], $updatedKeys))->values()
            : $items;

        $previouslyApprovedCount = $items->count() - $itemsToReview->count();

        // Ambil riwayat inspeksi & review tangga ini dengan timestamp detail tanggal & jam
        $history = $inspection->ladder->inspections()
            ->with(['submitter', 'inspector', 'reviewer'])
            ->latest()
            ->get()
            ->map(function ($h) {
                return [
                    'id' => $h->id,
                    'status' => $h->status,
                    'workflow_status' => $h->workflow_status,
                    'submitter_name' => $h->submitter?->name ?? 'PIC Safety',
                    'inspector_name' => $h->inspector?->name ?? 'Inspektor EHS',
                    'reviewer_name' => $h->reviewer?->name ?? $h->inspector?->name,
                    'created_at' => $h->created_at->toIso8601String(),
                    'approved_at' => $h->approved_at ? $h->approved_at->toIso8601String() : null,
                    'review_comment' => $h->review_comment,
                    'review_data' => $h->review_data ?? [],
                ];
            });

        return Inertia::render('Inspections/Review', [
            'inspection' => [
                'id' => $inspection->id,
                'status' => $inspection->status,
                'workflow_status' => $inspection->workflow_status,
                'created_at' => $inspection->created_at->toIso8601String(),
                'ladder' => $inspection->ladder,
                'submitter' => $inspection->submitter,
                'items' => $itemsToReview,
                'is_partial_update' => $isPartialUpdate,
                'total_items_count' => $items->count(),
                'previously_approved_count' => $previouslyApprovedCount,
            ],
            'history' => $history,
        ]);
    }

    public function reviewStore(Request $request, Inspection $inspection)
    {
        abort_unless($request->user()->isInspector() && ($request->user()->isAdmin() || $inspection->inspector_id === $request->user()->id), 403);

        $validated = $request->validate([
            'decisions' => ['required', 'array'],
            'comments' => ['nullable', 'array'],
        ]);

        foreach ($validated['decisions'] as $key => $decision) {
            $request->validate([
                "decisions.{$key}" => ['required', 'in:approved,rejected'],
                "comments.{$key}" => ['nullable', 'string', 'max:2000'],
            ]);
        }

        $checklist = collect($inspection->checklist ?? [])
            ->filter(fn ($value, $key) => $key !== 'inspection_type' && $key !== 'photos' && $key !== 'comments' && $key !== 'updated_keys' && (is_bool($value) || $value === 1 || $value === 0 || $value === '1' || $value === '0'));

        $reviewData = $inspection->review_data ?? [];

        // Jika review_data masih kosong di inspeksi ini, cek apakah ada riwayat keputusan dari inspeksi sebelumnya
        if (empty($reviewData)) {
            $prevInspection = $inspection->ladder->inspections()
                ->where('id', '<', $inspection->id)
                ->whereNotNull('review_data')
                ->latest('id')
                ->first();
            if ($prevInspection && !empty($prevInspection->review_data)) {
                $reviewData = $prevInspection->review_data;
            }
        }

        // Perbarui item-item yang sedang dinilai pada review ini
        foreach ($validated['decisions'] as $key => $decision) {
            $reviewData[$key] = [
                'decision' => $decision,
                'comment' => $validated['comments'][$key] ?? null,
            ];
        }

        // Untuk item-item lain yang belum pernah ada keputusan sama sekali (hanya jika pendaftaran pertama kali):
        foreach ($checklist->keys() as $key) {
            if (!isset($reviewData[$key])) {
                $reviewData[$key] = [
                    'decision' => 'approved',
                    'comment' => null,
                ];
            }
        }

        $hasRejected = collect($reviewData)->contains(fn ($item) => ($item['decision'] ?? null) === 'rejected');
        $hasPending = collect($reviewData)->contains(fn ($item) => empty($item['decision']));

        $workflowStatus = $hasRejected ? 'needs_correction' : ($hasPending ? 'pending_review' : 'approved');
        $status = ($workflowStatus === 'approved') ? 'safe' : 'unsafe';
        $validUntil = ($workflowStatus === 'approved') ? Carbon::now()->addDays(365) : null;
        $approvedAt = ($workflowStatus === 'approved') ? now() : null;

        $inspection->update([
            'reviewed_by_id' => $request->user()->id,
            'workflow_status' => $workflowStatus,
            'status' => $status,
            'valid_until' => $validUntil,
            'review_data' => $reviewData,
            'review_comment' => collect($reviewData)->pluck('comment')->filter()->implode("\n"),
            'approved_at' => $approvedAt,
        ]);

        $inspection->ladder->update([
            'status' => $status,
        ]);

        $this->notifyUser(
            $inspection->submitted_by_id,
            $hasRejected ? 'Inspeksi memiliki item yang perlu diperbaiki.' : 'Inspeksi berhasil disetujui.',
            $inspection->id
        );

        return redirect()->route('inspections.review.queue')
            ->with('success', $hasRejected ? 'Review tersimpan dan item reject dikirim untuk perbaikan.' : 'Inspeksi berhasil disetujui.');
    }

    public function correction(Request $request, Inspection $inspection)
    {
        // Jika Inspektor EHS mengakses halaman koreksi fisik, arahkan ke detail tangga alih-alih 403 Forbidden
        if (!$request->user()->isAdmin() && !$request->user()->isPicSafety() && $inspection->submitted_by_id !== $request->user()->id) {
            return redirect()->route('ladders.show', $inspection->ladder->uuid)
                ->with('info', 'Halaman perbaikan checklist fisik ditujukan khusus untuk PIC Safety.');
        }

        abort_unless($inspection->submitted_by_id === $request->user()->id || $request->user()->isAdmin() || $request->user()->isPicSafety(), 403);
        abort_unless($inspection->workflow_status === 'needs_correction', 404);

        $inspection->load(['ladder.inspector', 'submitter']);

        $checklist = $inspection->checklist ?? [];
        $photos = $checklist['photos'] ?? [];
        $reviewData = $inspection->review_data ?? [];

        $totalCount = collect($checklist)
            ->filter(fn ($value, $key) => $key !== 'inspection_type' && $key !== 'photos' && $key !== 'comments' && $key !== 'updated_keys' && (is_bool($value) || $value === 1 || $value === 0 || $value === '1' || $value === '0'))
            ->count();

        $items = collect($reviewData)
            ->filter(fn ($review) => ($review['decision'] ?? null) === 'rejected')
            ->map(fn ($review, $key) => [
                'key' => $key,
                'label' => str($key)->replace('_', ' ')->title()->toString(),
                'comment' => $review['comment'] ?? '',
                'photo_url' => (!empty($photos[$key])) ? Storage::disk('public')->url($photos[$key]) : null,
            ])->values();

        $previouslyApprovedCount = max(0, $totalCount - $items->count());

        return Inertia::render('Inspections/Correction', [
            'inspection' => [
                'id' => $inspection->id,
                'created_at' => $inspection->created_at->toIso8601String(),
                'ladder' => [
                    'id' => $inspection->ladder->id,
                    'uuid' => $inspection->ladder->uuid,
                    'location' => $inspection->ladder->location,
                    'type' => $inspection->ladder->type,
                    'identifier' => $inspection->ladder->identifier,
                    'max_load' => $inspection->ladder->max_load,
                    'inspector' => [
                        'name' => $inspection->ladder->inspector?->name ?? 'Belum ditugaskan',
                    ],
                ],
                'items' => $items,
                'total_items_count' => $totalCount,
                'previously_approved_count' => $previouslyApprovedCount,
            ],
        ]);
    }

    public function correctionStore(Request $request, Inspection $inspection)
    {
        abort_unless($inspection->submitted_by_id === $request->user()->id || $request->user()->isAdmin() || $request->user()->isPicSafety(), 403);
        abort_unless($inspection->workflow_status === 'needs_correction', 404);

        $rejectedKeys = collect($inspection->review_data ?? [])
            ->filter(fn ($review) => ($review['decision'] ?? null) === 'rejected')
            ->keys();

        $request->validate([
            'photos' => ['required', 'array'],
            'comments' => ['nullable', 'array'],
        ]);

        foreach ($rejectedKeys as $key) {
            $request->validate([
                "photos.{$key}" => ['required', 'image', 'max:5120'],
                "comments.{$key}" => ['nullable', 'string', 'max:1000'],
            ]);
        }

        $checklist = $inspection->checklist ?? [];
        $checklist['photos'] = $checklist['photos'] ?? [];
        $checklist['comments'] = $checklist['comments'] ?? [];
        $reviewData = $inspection->review_data ?? [];

        foreach ($rejectedKeys as $key) {
            $checklist['photos'][$key] = $request->file("photos.{$key}")->store("inspections/{$inspection->ladder_id}", 'public');
            if ($request->filled("comments.{$key}")) {
                $checklist['comments'][$key] = $request->input("comments.{$key}");
            }
            $reviewData[$key]['decision'] = null;
            $reviewData[$key]['comment'] = null;
        }

        // Catat daftar item yang diperbaiki agar inspektor hanya perlu mereview item ini
        $checklist['updated_keys'] = $rejectedKeys->values()->toArray();

        $inspection->update([
            'checklist' => $checklist,
            'review_data' => $reviewData,
            'workflow_status' => 'pending_review',
            'status' => 'unsafe', // Tetap unsafe sampai disetujui kembali oleh inspektor
            'reviewed_by_id' => null,
            'review_comment' => null,
            'approved_at' => null,
        ]);

        $this->notifyUser($inspection->inspector_id, 'Perbaikan inspeksi baru menunggu review.', $inspection->id);

        return redirect()->route('ladders.show', $inspection->ladder->uuid)
            ->with('success', 'Perbaikan berhasil dikirim kembali ke Inspektor EHS untuk ditinjau.');
    }

    private function notifyUser(?int $userId, string $message, int $inspectionId): void
    {
        if (!$userId) {
            return;
        }

        \App\Models\User::find($userId)?->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'inspection.workflow',
            'data' => [
                'message' => $message,
                'inspection_id' => $inspectionId,
            ],
        ]);
    }

    public function destroy(Inspection $inspection)
    {
        $inspection->delete();

        return redirect()->route('inspections.history')
            ->with('success', 'Riwayat inspeksi berhasil dihapus.');
    }
}