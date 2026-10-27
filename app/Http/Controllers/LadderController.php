<?php

namespace App\Http\Controllers;

use App\Models\Ladder;
use App\Models\User;
use App\Models\LocationInspectorMapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LadderController extends Controller
{
    /**
     * Menampilkan halaman Dashboard utama.
     */
    public function index()
    {
        $ladders = Ladder::with('latestInspection')->latest()->get();
        
        return Inertia::render('Dashboard', [
            'ladders' => $ladders
        ]);
    }

    /**
     * Menampilkan halaman khusus Data Aset (Tabel).
     */
    public function dataAset()
    {
        $ladders = Ladder::with('latestInspection')->latest()->get();
        
        return Inertia::render('Ladders/Index', [
            'ladders' => $ladders
        ]);
    }

    public function create()
    {
        $mappings = LocationInspectorMapping::with('inspector:id,name,email')->get();
        $inspectors = User::query()->whereIn('role', ['inspector', 'admin'])->orderBy('name')->get(['id', 'name', 'email']);
        $pics = User::query()->whereIn('role', ['pic_safety', 'admin'])->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Ladders/Create', [
            'inspectors' => $inspectors,
            'pics' => $pics,
            'locationMappings' => $mappings,
        ]);
    }

    public function qr(Ladder $ladder)
    {
        return Inertia::render('Ladders/QrLanding', [
            'ladder' => $ladder->only(['uuid', 'identifier', 'location', 'type', 'max_load']),
        ]);
    }

    public function certificate(Ladder $ladder)
    {
        $ladder->load(['latestInspection.inspector']);

        return Inertia::render('Ladders/Certificate', [
            'ladder' => $ladder,
            'inspection' => $ladder->latestInspection,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'type' => 'required|in:portable,permanent',
            'owner_name' => 'required|string|max:255',
            'responsible_name' => 'required|string|max:255',
            'max_load' => 'required|numeric|min:0.01|max:999999.99',
            'inspector_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
        ]);

        // Auto-determine inspector by location if not explicitly provided or matched
        if (empty($validated['inspector_id'])) {
            $mapping = LocationInspectorMapping::where('location_name', trim($validated['location']))->first();
            if ($mapping) {
                $validated['inspector_id'] = $mapping->inspector_id;
            } else {
                // Default to first inspector/admin if unmapped
                $defaultInspector = User::whereIn('role', ['inspector', 'admin'])->first();
                $validated['inspector_id'] = $defaultInspector?->id;
            }
        }

        $typeLabel = $validated['type'] === 'portable' ? 'Portable' : 'Permanen';
        $sequence = Ladder::query()
            ->where('type', $validated['type'])
            ->where('location', $validated['location'])
            ->where('owner_name', $validated['owner_name'])
            ->count() + 1;

        $validated['identifier'] = sprintf(
            '%s - %s - %s - %03d',
            $typeLabel,
            trim($validated['location']),
            trim($validated['owner_name']),
            $sequence
        );

        $ladder = Ladder::create($validated);

        return redirect()->route('inspections.create', $ladder->uuid)
            ->with('success', 'Identifikasi tangga berhasil disimpan. Silakan ajukan inspeksi.');
    }

    public function show($uuid)
    {
        // Cari data berdasarkan kolom uuid secara eksplisit
        $ladder = Ladder::where('uuid', $uuid)->with(['latestInspection.inspector', 'latestInspection.submitter'])->firstOrFail();

        $latestInspectionData = null;
        if ($ladder->latestInspection) {
            $checklist = $ladder->latestInspection->checklist ?? [];
            $rawPhotos = $checklist['photos'] ?? [];
            $photoUrls = [];
            foreach ($rawPhotos as $k => $path) {
                $photoUrls[$k] = (!empty($path)) ? Storage::disk('public')->url($path) : null;
            }

            $comments = $checklist['comments'] ?? [];

            $latestInspectionData = [
                'id' => $ladder->latestInspection->id,
                'status' => $ladder->latestInspection->status,
                'workflow_status' => $ladder->latestInspection->workflow_status,
                'submitted_by_id' => $ladder->latestInspection->submitted_by_id,
                'submitter_name' => $ladder->latestInspection->submitter?->name ?? 'PIC Safety',
                'review_data' => $ladder->latestInspection->review_data ?? [],
                'review_comment' => $ladder->latestInspection->review_comment,
                'valid_until' => $ladder->latestInspection->valid_until ? $ladder->latestInspection->valid_until->toIso8601String() : null,
                'created_at' => $ladder->latestInspection->created_at->toIso8601String(),
                'approved_at' => $ladder->latestInspection->approved_at ? $ladder->latestInspection->approved_at->toIso8601String() : null,
                'checklist' => $checklist,
                'photos' => $photoUrls,
                'comments' => $comments,
                'notes' => $ladder->latestInspection->notes,
                'inspector' => [
                    'name' => $ladder->latestInspection->inspector?->name ?? 'Belum ada',
                ]
            ];
        }

        return Inertia::render('Ladders/Show', [
            'ladder' => [
                'id' => $ladder->id,
                'uuid' => $ladder->uuid,
                'type' => $ladder->type,
                'location' => $ladder->location,
                'description' => $ladder->description, // Ditambahkan agar deskripsi ikut tampil
            ],
            'latestInspection' => $latestInspectionData,
        ]);
    }

    /**
     * Menghapus data aset tangga beserta riwayat inspeksinya.
     */
    public function destroy($uuid)
    {
        $ladder = Ladder::where('uuid', $uuid)->firstOrFail();
        
        // Hapus relasi inspeksi terlebih dahulu jika ada
        $ladder->inspections()->delete();
        
        // Hapus aset tangga
        $ladder->delete();

        return redirect()->route('ladders.index')
            ->with('success', 'Aset tangga berhasil dihapus.');
    }
}