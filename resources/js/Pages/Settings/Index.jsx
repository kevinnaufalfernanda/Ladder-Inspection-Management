import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    MapPin,
    Calendar,
    CheckSquare,
    Users,
    Plus,
    Edit2,
    Trash2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Save,
    RotateCcw,
    UserPlus,
    X,
    Camera,
    Sliders,
    Building2,
    Info,
} from 'lucide-react';

export default function SettingsIndex({
    locations = [],
    inspectors = [],
    users = [],
    settings = {},
    checklists = {},
    isCustomChecklist = false,
    currentUser = {},
}) {
    const [activeTab, setActiveTab] = useState('locations'); // 'locations', 'checklists', 'validity', 'users'

    // State untuk form Lokasi
    const [editingLocation, setEditingLocation] = useState(null);
    const [locationModalOpen, setLocationModalOpen] = useState(false);

    // State untuk form Checklist
    const [checklistLadderType, setChecklistLadderType] = useState('permanent'); // 'permanent' | 'portable'
    const [editingChecklistItem, setEditingChecklistItem] = useState(null);
    const [newChecklistModalOpen, setNewChecklistModalOpen] = useState(false);
    const [targetGroupIdx, setTargetGroupIdx] = useState(0);

    // State untuk form Tambah User
    const [userModalOpen, setUserModalOpen] = useState(false);

    // Form Master Lokasi
    const locationForm = useForm({
        location_name: '',
        inspector_id: inspectors[0]?.id || '',
    });

    const openCreateLocation = () => {
        setEditingLocation(null);
        locationForm.setData({
            location_name: '',
            inspector_id: inspectors[0]?.id || '',
        });
        setLocationModalOpen(true);
    };

    const openEditLocation = (loc) => {
        setEditingLocation(loc);
        locationForm.setData({
            location_name: loc.location_name,
            inspector_id: loc.inspector_id,
        });
        setLocationModalOpen(true);
    };

    const submitLocation = (e) => {
        e.preventDefault();
        if (editingLocation) {
            locationForm.put(route('settings.locations.update', editingLocation.id), {
                onSuccess: () => setLocationModalOpen(false),
            });
        } else {
            locationForm.post(route('settings.locations.store'), {
                onSuccess: () => setLocationModalOpen(false),
            });
        }
    };

    const deleteLocation = (loc) => {
        if (confirm(`Hapus pemetaan untuk lokasi "${loc.location_name}"?`)) {
            router.delete(route('settings.locations.destroy', loc.id));
        }
    };

    // Form Masa Berlaku & Pengaturan Umum
    const generalForm = useForm({
        validity_period_days: settings.validity_period_days || 365,
        expiry_warning_days: settings.expiry_warning_days || 30,
        require_photos_per_item: settings.require_photos_per_item ?? true,
        auto_assign_inspector: settings.auto_assign_inspector ?? true,
    });

    const submitGeneral = (e) => {
        e.preventDefault();
        generalForm.post(route('settings.general.update'));
    };

    // Form Tambah User
    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'pic_safety',
    });

    const submitUser = (e) => {
        e.preventDefault();
        userForm.post(route('settings.users.store'), {
            onSuccess: () => {
                setUserModalOpen(false);
                userForm.reset();
            },
        });
    };

    const changeUserRole = (targetUser, newRole) => {
        if (targetUser.role === newRole) return;
        if (confirm(`Ubah peran "${targetUser.name}" menjadi ${newRole}?`)) {
            router.patch(route('settings.users.role', targetUser.id), { role: newRole });
        }
    };

    // Form Checklist
    const newChecklistForm = useForm({
        label: '',
        key: '',
    });

    const activeChecklistGroups = checklists[checklistLadderType] || [];
    const totalPermanent = (checklists.permanent || []).reduce((acc, g) => acc + (g.items?.length || 0), 0);
    const totalPortable = (checklists.portable || []).reduce((acc, g) => acc + (g.items?.length || 0), 0);

    const submitNewChecklistItem = (e) => {
        e.preventDefault();
        const prefix = checklistLadderType === 'permanent' ? 'climbing_' : 'portable_';
        const generatedKey = newChecklistForm.data.key.trim()
            ? newChecklistForm.data.key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
            : prefix + Date.now();

        const updatedChecklists = JSON.parse(JSON.stringify(checklists));
        if (!updatedChecklists[checklistLadderType] || updatedChecklists[checklistLadderType].length === 0) {
            updatedChecklists[checklistLadderType] = [{ title: 'Daftar Pemeriksaan K3', items: [] }];
        }

        const safeGroupIdx = Math.min(targetGroupIdx, updatedChecklists[checklistLadderType].length - 1);
        updatedChecklists[checklistLadderType][safeGroupIdx].items.push({
            key: generatedKey,
            label: newChecklistForm.data.label.trim(),
        });

        router.post(
            route('settings.checklists.update'),
            { checklists: updatedChecklists },
            {
                onSuccess: () => {
                    setNewChecklistModalOpen(false);
                    newChecklistForm.reset();
                },
            }
        );
    };

    const submitEditChecklistItem = (targetKey, newLabel) => {
        if (!newLabel || !newLabel.trim()) return;

        const updatedChecklists = JSON.parse(JSON.stringify(checklists));
        let found = false;

        for (const grp of updatedChecklists[checklistLadderType] || []) {
            for (const itm of grp.items || []) {
                if (itm.key === targetKey) {
                    itm.label = newLabel.trim();
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        if (found) {
            router.post(
                route('settings.checklists.update'),
                { checklists: updatedChecklists },
                {
                    onSuccess: () => setEditingChecklistItem(null),
                }
            );
        }
    };

    const deleteChecklistItem = (targetKey) => {
        if (!confirm('Hapus butir pemeriksaan ini dari standar checklist?')) return;

        const updatedChecklists = JSON.parse(JSON.stringify(checklists));
        for (const grp of updatedChecklists[checklistLadderType] || []) {
            grp.items = (grp.items || []).filter((itm) => itm.key !== targetKey);
        }

        router.post(route('settings.checklists.update'), { checklists: updatedChecklists });
    };

    const resetChecklistsToDefault = () => {
        if (confirm('Kembalikan konfigurasi checklist ke standar pabrikan EHS Wilmar asli? Butir kustom akan dihapus.')) {
            router.post(route('settings.checklists.reset'));
        }
    };

    return (
        <AuthenticatedLayout breadcrumb="Pengaturan">
            <Head title="Pengaturan Sistem & Master K3" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Utama Pengaturan (Image 7) */}
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">
                        Pengaturan Sistem & Master K3
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                        Konfigurasi lokasi, checklist, masa berlaku sertifikat, dan hak akses.
                    </p>
                </div>

                {/* Navigasi Tab Pengaturan (Pills Image 7) */}
                <div className="flex flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={() => setActiveTab('locations')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm cursor-pointer ${
                            activeTab === 'locations'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Master Lokasi & EHS Zona
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('checklists')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm cursor-pointer ${
                            activeTab === 'checklists'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Manajemen Checklist K3
                        {isCustomChecklist && (
                            <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950">
                                Kustom
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('validity')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm cursor-pointer ${
                            activeTab === 'validity'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Masa Berlaku & Operasional
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm cursor-pointer ${
                            activeTab === 'users'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        Manajemen Akun & Role
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: MASTER LOKASI & PEMETAAN INSPEKTUR (Image 7)                        */}
                {/* ========================================================================= */}
                {activeTab === 'locations' && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Pemetaan Otomatis Lokasi & EHS Zona
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Setiap aset yang didaftarkan akan ditugaskan kepada Inspektor EHS sesuai lokasi.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={openCreateLocation}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                            >
                                <Plus className="h-4 w-4" /> Tambah Lokasi Baru
                            </button>
                        </div>

                        {/* Tabel Lokasi */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3 px-3">Nama Lokasi / Plant Area</th>
                                        <th className="py-3 px-3">Inspektor EHS yang Ditugaskan</th>
                                        <th className="py-3 px-3">Email Inspektor</th>
                                        <th className="py-3 px-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {locations.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-16 text-center">
                                                <p className="text-sm font-bold text-slate-800">
                                                    Belum ada master lokasi yang terdaftar
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Klik "Tambah Lokasi Baru" untuk memetakan lokasi dan Inspektor EHS.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        locations.map((loc) => (
                                            <tr key={loc.id} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3.5 px-3 font-bold text-slate-900">
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                                        {loc.location_name}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                        {loc.inspector?.name || 'Belum ditugaskan'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                                                    {loc.inspector?.email || '-'}
                                                </td>
                                                <td className="py-3.5 px-3 text-right space-x-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditLocation(loc)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition active:scale-[0.98] cursor-pointer"
                                                    >
                                                        <Edit2 className="h-3 w-3" /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteLocation(loc)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition active:scale-[0.98] cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Counter Footer */}
                        <div className="pt-2 text-xs text-slate-400">
                            {locations.length} lokasi terdaftar
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: MANAJEMEN CHECKLIST K3                                            */}
                {/* ========================================================================= */}
                {activeTab === 'checklists' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-amber-500" />
                                    Standar Checklist Pemeriksaan K3
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Kelola butir pemeriksaan resmi yang muncul pada formulir inspeksi PIC Safety dan Review Inspektor EHS.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {isCustomChecklist && (
                                    <button
                                        type="button"
                                        onClick={resetChecklistsToDefault}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 cursor-pointer"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" /> Reset ke Default EHS
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setNewChecklistModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" /> Tambah Butir Checklist
                                </button>
                            </div>
                        </div>

                        {/* Switcher Tipe Tangga */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setChecklistLadderType('permanent');
                                    setTargetGroupIdx(0);
                                }}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                    checklistLadderType === 'permanent'
                                        ? 'bg-[#0f172a] text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Tangga Tetap & Fall Arrest ({checklists.permanent?.length || 5} Kategori • {totalPermanent} Butir)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setChecklistLadderType('portable');
                                    setTargetGroupIdx(0);
                                }}
                                className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                    checklistLadderType === 'portable'
                                        ? 'bg-[#0f172a] text-white shadow-xs'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Tangga Portabel (Standar EHS • {totalPortable} Butir)
                            </button>
                        </div>

                        {/* Daftar Butir Checklist Aktif per Kategori */}
                        <div className="space-y-6">
                            {activeChecklistGroups.map((group, groupIdx) => (
                                <div key={groupIdx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                                                Kategori #{groupIdx + 1}
                                            </span>
                                            <h4 className="text-sm font-black text-slate-900">
                                                {group.title}
                                            </h4>
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                            {group.items?.length || 0} Butir
                                        </span>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {group.items?.map((item, idx) => {
                                            const isEditing = editingChecklistItem?.key === item.key;

                                            return (
                                                <div
                                                    key={item.key}
                                                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition flex flex-col justify-between hover:border-slate-300"
                                                >
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                defaultValue={item.label}
                                                                id={`edit-label-${item.key}`}
                                                                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
                                                            />
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setEditingChecklistItem(null)}
                                                                    className="rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                                                                >
                                                                    Batal
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const val = document.getElementById(`edit-label-${item.key}`)?.value;
                                                                        submitEditChecklistItem(item.key, val);
                                                                    }}
                                                                    className="rounded-lg bg-[#0f172a] px-3 py-1 text-[11px] font-bold text-white cursor-pointer"
                                                                >
                                                                    Simpan
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="space-y-1">
                                                                    <span className="text-xs font-bold text-slate-900 block leading-snug">
                                                                        <span className="text-amber-600 font-mono mr-1">
                                                                            #{idx + 1}
                                                                        </span>
                                                                        {item.label}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-mono block">
                                                                        Key: {item.key}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingChecklistItem(item)}
                                                                        title="Ubah teks butir"
                                                                        className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteChecklistItem(item.key)}
                                                                        title="Hapus butir"
                                                                        className="rounded-md p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-100 cursor-pointer"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: MASA BERLAKU & OPERASIONAL                                        */}
                {/* ========================================================================= */}
                {activeTab === 'validity' && (
                    <div className="space-y-6">
                        <form onSubmit={submitGeneral} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 max-w-3xl">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-amber-500" />
                                    Masa Berlaku Sertifikat & Pengingat Inspeksi
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Tentukan jangka waktu sertifikasi kelayakan K3 tangga dan parameter otomatisasi alur kerja inspeksi.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Masa Berlaku */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Masa Berlaku Sertifikat (Hari) <span className="text-rose-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="7"
                                            max="1825"
                                            value={generalForm.data.validity_period_days}
                                            onChange={(e) => generalForm.setData('validity_period_days', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 font-semibold focus:border-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">
                                            Hari (~{Math.round(generalForm.data.validity_period_days / 365 * 10) / 10} Tahun)
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Standar default EHS Wilmar: 365 hari (1 tahun).
                                    </p>
                                    {generalForm.errors.validity_period_days && (
                                        <p className="text-xs text-rose-600 font-semibold">{generalForm.errors.validity_period_days}</p>
                                    )}
                                </div>

                                {/* Batas Peringatan Kadaluarsa */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-800">
                                        Peringatan Jelang Kadaluarsa (H- Hari) <span className="text-rose-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="90"
                                            value={generalForm.data.expiry_warning_days}
                                            onChange={(e) => generalForm.setData('expiry_warning_days', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 font-semibold focus:border-amber-500 focus:ring-amber-500"
                                        />
                                        <span className="absolute right-3.5 top-2.5 text-xs text-slate-400">
                                            Hari Sebelumnya
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Status aset akan berubah menjadi kuning peringatan pada H-{generalForm.data.expiry_warning_days} hari.
                                    </p>
                                    {generalForm.errors.expiry_warning_days && (
                                        <p className="text-xs text-rose-600 font-semibold">{generalForm.errors.expiry_warning_days}</p>
                                    )}
                                </div>
                            </div>

                            {/* Kebijakan Foto Dokumentasi */}
                            <div className="border-t border-slate-100 pt-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Camera className="h-4 w-4 text-amber-500" />
                                            Wajibkan Unggah Foto Lapangan per Butir Checklist
                                        </label>
                                        <p className="text-xs text-slate-500">
                                            Jika diaktifkan, PIC Safety tidak dapat menyimpan formulir jika ada butir pemeriksaan yang belum memiliki bukti foto fisik.
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(generalForm.data.require_photos_per_item)}
                                        onChange={(e) => generalForm.setData('require_photos_per_item', e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-start justify-between gap-4 pt-3 border-t border-slate-100">
                                    <div className="space-y-0.5">
                                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-amber-500" />
                                            Otomatisasi Penugasan Inspektur Berdasarkan Master Lokasi
                                        </label>
                                        <p className="text-xs text-slate-500">
                                            Formulir registrasi tangga baru akan secara otomatis memilih Inspektor EHS berdasarkan zona area yang dipilih.
                                        </p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(generalForm.data.auto_assign_inspector)}
                                        onChange={(e) => generalForm.setData('auto_assign_inspector', e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={generalForm.processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="h-4 w-4" />
                                    {generalForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan Operasional'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 4: MANAJEMEN AKUN & ROLE                                             */}
                {/* ========================================================================= */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-amber-500" />
                                    Manajemen Pengguna & Hak Akses Role
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Kelola akun terdaftar dan atur perannya sebagai Administrator, Inspektor EHS, atau PIC Safety.
                                </p>
                            </div>

                            {currentUser.isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setUserModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                                >
                                    <UserPlus className="h-4 w-4" /> Daftarkan Akun Baru
                                </button>
                            )}
                        </div>

                        {!currentUser.isAdmin && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center gap-2">
                                <Info className="h-4 w-4 shrink-0 text-amber-600" />
                                Anda masuk sebagai <strong>Inspektor EHS</strong>. Anda dapat melihat daftar pengguna, namun perubahan peran hanya dapat dilakukan oleh <strong>Administrator</strong>.
                            </div>
                        )}

                        {/* Tabel Daftar Pengguna */}
                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
                                        <th className="py-3 px-4">Nama Pengguna</th>
                                        <th className="py-3 px-4">Alamat Email</th>
                                        <th className="py-3 px-4">Peran / Hak Akses</th>
                                        <th className="py-3 px-4">Tgl Terdaftar</th>
                                        {currentUser.isAdmin && <th className="py-3 px-4 text-right">Ubah Peran</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((u) => {
                                        const isCurrentUser = u.id === currentUser.id;

                                        return (
                                            <tr key={u.id} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    <span className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#0f172a] text-xs">
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        {u.name}
                                                        {isCurrentUser && (
                                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                                                                Anda
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                                                    {u.email}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {u.role === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                                                            Administrator
                                                        </span>
                                                    ) : u.role === 'inspector' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                                            Inspektor EHS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">
                                                            PIC Safety
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                                    {new Date(u.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                </td>
                                                {currentUser.isAdmin && (
                                                    <td className="py-3.5 px-4 text-right">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => changeUserRole(u, e.target.value)}
                                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-amber-500 cursor-pointer"
                                                        >
                                                            <option value="pic_safety">PIC Safety</option>
                                                            <option value="inspector">Inspektor EHS</option>
                                                            <option value="admin">Administrator</option>
                                                        </select>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* MODAL: FORM LOKASI                                                        */}
            {/* ========================================================================= */}
            {locationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                                {editingLocation ? 'Ubah Pemetaan Lokasi' : 'Tambah Master Lokasi Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setLocationModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitLocation} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Nama Lokasi / Plant Area <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Plant Area ME-FAL"
                                    value={locationForm.data.location_name}
                                    onChange={(e) => locationForm.setData('location_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500"
                                />
                                {locationForm.errors.location_name && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{locationForm.errors.location_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Inspektor EHS Penanggung Jawab <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    required
                                    value={locationForm.data.inspector_id}
                                    onChange={(e) => locationForm.setData('inspector_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 cursor-pointer"
                                >
                                    {inspectors.map((ins) => (
                                        <option key={ins.id} value={ins.id}>
                                            {ins.name} ({ins.email})
                                        </option>
                                    ))}
                                </select>
                                {locationForm.errors.inspector_id && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{locationForm.errors.inspector_id}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setLocationModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={locationForm.processing}
                                    className="rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {locationForm.processing ? 'Menyimpan...' : (editingLocation ? 'Simpan Perubahan' : 'Tambah Lokasi')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: TAMBAH BUTIR CHECKLIST BARU                                       */}
            {/* ========================================================================= */}
            {newChecklistModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                                Tambah Butir Checklist Baru
                            </h3>
                            <button
                                type="button"
                                onClick={() => setNewChecklistModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitNewChecklistItem} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Tipe Tangga
                                </label>
                                <div className="rounded-xl bg-slate-100 p-2 text-xs font-bold text-slate-800">
                                    {checklistLadderType === 'permanent' ? 'Tangga Tetap & Fall Arrest System' : 'Tangga Portabel'}
                                </div>
                            </div>

                            {activeChecklistGroups.length > 1 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1">
                                        Pilih Kategori / Bagian Checklist
                                    </label>
                                    <select
                                        value={targetGroupIdx}
                                        onChange={(e) => setTargetGroupIdx(Number(e.target.value))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 cursor-pointer"
                                    >
                                        {activeChecklistGroups.map((grp, idx) => (
                                            <option key={idx} value={idx}>
                                                {idx + 1}. {grp.title} ({grp.items?.length || 0} butir saat ini)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Teks Deskripsi Pemeriksaan <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Contoh: Baut penyangga platform terpasang kencang dan tidak berkarat"
                                    value={newChecklistForm.data.label}
                                    onChange={(e) => newChecklistForm.setData('label', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Identifier Key Teknis (Opsional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: climbing_baut_penyangga_aman"
                                    value={newChecklistForm.data.key}
                                    onChange={(e) => newChecklistForm.setData('key', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono focus:border-amber-500"
                                />
                                <p className="mt-1 text-[10px] text-slate-400">
                                    Biarkan kosong jika ingin di-generate otomatis oleh sistem.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setNewChecklistModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={newChecklistForm.processing}
                                    className="rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    Tambah ke Checklist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: TAMBAH USER BARU                                                   */}
            {/* ========================================================================= */}
            {userModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-900">
                                Daftarkan Akun Pengguna Baru
                            </h3>
                            <button
                                type="button"
                                onClick={() => setUserModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitUser} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Nama Lengkap <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Rian Pratama (PIC ME)"
                                    value={userForm.data.name}
                                    onChange={(e) => userForm.setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500"
                                />
                                {userForm.errors.name && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{userForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Alamat Email Login <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="user@example.com"
                                    value={userForm.data.email}
                                    onChange={(e) => userForm.setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500"
                                />
                                {userForm.errors.email && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{userForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Kata Sandi (Password) <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    value={userForm.data.password}
                                    onChange={(e) => userForm.setData('password', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500"
                                />
                                {userForm.errors.password && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{userForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                    Peran / Hak Akses <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    required
                                    value={userForm.data.role}
                                    onChange={(e) => userForm.setData('role', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 cursor-pointer"
                                >
                                    <option value="pic_safety">PIC Safety (Pendaftaran & Pelaksanaan Inspeksi)</option>
                                    <option value="inspector">Inspektor EHS (Review & Penetapan Kelaikan)</option>
                                    <option value="admin">Administrator (Akses Penuh Seluruh Sistem)</option>
                                </select>
                                {userForm.errors.role && (
                                    <p className="mt-1 text-xs font-semibold text-rose-600">{userForm.errors.role}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setUserModalOpen(false)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={userForm.processing}
                                    className="rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {userForm.processing ? 'Mendaftarkan...' : 'Daftarkan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
