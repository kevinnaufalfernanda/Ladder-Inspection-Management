<?php

namespace App\Http\Controllers;

use App\Models\Ladder;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Ladder::create($validated);

        return redirect()->back()->with('success', 'Ladder created successfully.');
    }

    public function show($uuid)
    {
        // Cari data berdasarkan kolom uuid secara eksplisit
        $ladder = Ladder::where('uuid', $uuid)->with('latestInspection.inspector')->firstOrFail();

        $latestInspectionData = null;
        if ($ladder->latestInspection) {
            $latestInspectionData = [
                'id' => $ladder->latestInspection->id,
                'status' => $ladder->latestInspection->status,
                'valid_until' => $ladder->latestInspection->valid_until->toIso8601String(),
                'created_at' => $ladder->latestInspection->created_at->toIso8601String(),
                'notes' => $ladder->latestInspection->notes,
                'inspector' => [
                    'name' => $ladder->latestInspection->inspector->name,
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