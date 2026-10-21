<?php

namespace App\Http\Controllers;

use App\Models\Ladder;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InspectionController extends Controller
{
    public function create(Ladder $ladder)
    {
        // Diperbaiki dari 'Inspection/Create' menjadi 'Inspections/Create'
        return Inertia::render('Inspections/Create', [
            'ladder' => $ladder
        ]);
    }

    public function store(Request $request, Ladder $ladder)
    {
        $validated = $request->validate([
            'status' => 'required|in:safe,unsafe',
            'checklist' => 'required|array',
            'notes' => 'nullable|string',
            'return_to' => 'nullable|in:detail,dashboard',
        ]);

        $ladder->inspections()->create([
            'inspector_id' => $request->user()->id,
            'status' => $validated['status'],
            'checklist' => $validated['checklist'],
            'valid_until' => Carbon::now()->addDays(30),
            'notes' => $validated['notes']
        ]);

        $returnTo = $validated['return_to'] ?? 'dashboard';

        if ($returnTo === 'detail') {
            return redirect()->route('ladders.show', $ladder->uuid)
                ->with('success', 'Inspection recorded successfully.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'Inspection recorded successfully.');
    }

    public function history()
    {
        $inspections = Inspection::with(['ladder', 'inspector'])->latest()->get();

        return Inertia::render('Inspections/History', [
            'inspections' => $inspections
        ]);
    }

    public function destroy(Inspection $inspection)
    {
        $inspection->delete();

        return redirect()->route('inspections.history')
            ->with('success', 'Riwayat inspeksi berhasil dihapus.');
    }
}