<?php

namespace App\Http\Controllers;

use App\Models\LocationInspectorMapping;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        // Hanya pengguna dengan role inspector atau admin yang dapat mengakses Pengaturan Sistem
        abort_unless($request->user()->isInspector(), 403, 'Akses halaman pengaturan hanya untuk Inspektor EHS dan Admin.');

        $locations = LocationInspectorMapping::with('inspector:id,name,email')
            ->orderBy('location_name')
            ->get();

        $inspectors = User::whereIn('role', ['inspector', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        $users = User::orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $settings = [
            'validity_period_days' => (int) SystemSetting::get('validity_period_days', 365),
            'expiry_warning_days' => (int) SystemSetting::get('expiry_warning_days', 30),
            'require_photos_per_item' => (bool) SystemSetting::get('require_photos_per_item', true),
            'auto_assign_inspector' => (bool) SystemSetting::get('auto_assign_inspector', true),
        ];

        $checklists = SystemSetting::getActiveChecklists();
        $isCustomChecklist = SystemSetting::where('key', 'checklists_custom')->exists();

        return Inertia::render('Settings/Index', [
            'locations' => $locations,
            'inspectors' => $inspectors,
            'users' => $users,
            'settings' => $settings,
            'checklists' => $checklists,
            'isCustomChecklist' => $isCustomChecklist,
            'currentUser' => [
                'id' => $request->user()->id,
                'role' => $request->user()->role,
                'isAdmin' => $request->user()->isAdmin(),
            ],
        ]);
    }

    public function updateGeneral(Request $request)
    {
        abort_unless($request->user()->isInspector(), 403);

        $validated = $request->validate([
            'validity_period_days' => ['required', 'integer', 'min:7', 'max:1825'],
            'expiry_warning_days' => ['required', 'integer', 'min:1', 'max:90'],
            'require_photos_per_item' => ['required', 'boolean'],
            'auto_assign_inspector' => ['required', 'boolean'],
        ]);

        SystemSetting::set('validity_period_days', (int) $validated['validity_period_days'], 'general', 'Masa berlaku sertifikat inspeksi (hari)');
        SystemSetting::set('expiry_warning_days', (int) $validated['expiry_warning_days'], 'general', 'Pengingat kadaluarsa (H- hari)');
        SystemSetting::set('require_photos_per_item', (bool) $validated['require_photos_per_item'], 'general', 'Wajib melampirkan foto untuk setiap checklist');
        SystemSetting::set('auto_assign_inspector', (bool) $validated['auto_assign_inspector'], 'general', 'Otomatis mapping inspektor berdasarkan lokasi');

        return back()->with('success', 'Pengaturan masa berlaku & operasional berhasil disimpan.');
    }

    public function storeLocation(Request $request)
    {
        abort_unless($request->user()->isInspector(), 403);

        $validated = $request->validate([
            'location_name' => ['required', 'string', 'max:255', 'unique:location_inspector_mappings,location_name'],
            'inspector_id' => ['required', 'exists:users,id'],
        ], [
            'location_name.unique' => 'Nama lokasi ini sudah terdaftar dalam pemetaan.',
            'inspector_id.required' => 'Pilih Inspektor EHS penanggung jawab lokasi.',
        ]);

        LocationInspectorMapping::create([
            'location_name' => trim($validated['location_name']),
            'inspector_id' => $validated['inspector_id'],
        ]);

        return back()->with('success', 'Master lokasi & pemetaan inspektur berhasil ditambahkan.');
    }

    public function updateLocation(Request $request, LocationInspectorMapping $location)
    {
        abort_unless($request->user()->isInspector(), 403);

        $validated = $request->validate([
            'location_name' => ['required', 'string', 'max:255', "unique:location_inspector_mappings,location_name,{$location->id}"],
            'inspector_id' => ['required', 'exists:users,id'],
        ]);

        $location->update([
            'location_name' => trim($validated['location_name']),
            'inspector_id' => $validated['inspector_id'],
        ]);

        return back()->with('success', 'Data pemetaan lokasi berhasil diperbarui.');
    }

    public function destroyLocation(Request $request, LocationInspectorMapping $location)
    {
        abort_unless($request->user()->isInspector(), 403);

        $location->delete();

        return back()->with('success', 'Pemetaan lokasi berhasil dihapus.');
    }

    public function storeUser(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Hanya Administrator yang dapat menambah akun baru.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:admin,inspector,pic_safety'],
        ], [
            'email.unique' => 'Alamat email ini sudah digunakan oleh akun lain.',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return back()->with('success', 'Pengguna baru berhasil didaftarkan.');
    }

    public function updateUserRole(Request $request, User $user)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Hanya Administrator yang dapat mengubah peran akun.');

        $validated = $request->validate([
            'role' => ['required', 'in:admin,inspector,pic_safety'],
        ]);

        // Cegah admin mengubah perannya sendiri jika dia satu-satunya admin
        if ($user->id === $request->user()->id && $validated['role'] !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return back()->withErrors(['role' => 'Anda adalah satu-satunya Administrator. Peran tidak dapat diturunkan.']);
            }
        }

        $user->update(['role' => $validated['role']]);

        $roleLabels = [
            'admin' => 'Administrator',
            'inspector' => 'Inspektor EHS',
            'pic_safety' => 'PIC Safety',
        ];

        return back()->with('success', "Peran untuk {$user->name} berhasil diubah menjadi {$roleLabels[$validated['role']]}.");
    }

    public function updateChecklists(Request $request)
    {
        abort_unless($request->user()->isInspector(), 403);

        $validated = $request->validate([
            'checklists' => ['required', 'array'],
            'checklists.portable' => ['required', 'array'],
            'checklists.permanent' => ['required', 'array'],
        ]);

        SystemSetting::set(
            'checklists_custom',
            $validated['checklists'],
            'checklists',
            'Konfigurasi butir checklist K3 kustom'
        );

        return back()->with('success', 'Konfigurasi butir checklist K3 berhasil disimpan.');
    }

    public function resetChecklists(Request $request)
    {
        abort_unless($request->user()->isInspector(), 403);

        SystemSetting::where('key', 'checklists_custom')->delete();

        return back()->with('success', 'Konfigurasi checklist berhasil direset ke standar EHS pabrikan.');
    }
}
