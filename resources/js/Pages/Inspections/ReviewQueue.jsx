import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Check,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Search,
    X,
    ArrowRight,
    Layers,
    User,
    Calendar,
    ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ReviewQueue({ inspections = [] }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
    const [searchQuery, setSearchQuery] = useState('');

    // Hitung ringkasan status inspeksi
    const totalCount = inspections.length;
    const pendingCount = inspections.filter((i) => i.workflow_status === 'pending_review').length;
    const approvedCount = inspections.filter(
        (i) => i.workflow_status === 'approved' || (i.status === 'safe' && i.workflow_status !== 'needs_correction' && i.workflow_status !== 'pending_review')
    ).length;
    const rejectedCount = inspections.filter(
        (i) => i.workflow_status === 'needs_correction' || (i.status === 'unsafe' && i.workflow_status !== 'pending_review')
    ).length;

    // Filter interaktif berdasarkan tab dan live search
    const filteredInspections = useMemo(() => {
        return inspections.filter((inspection) => {
            const isPending = inspection.workflow_status === 'pending_review';
            const isApproved =
                inspection.workflow_status === 'approved' ||
                (inspection.status === 'safe' && inspection.workflow_status !== 'needs_correction' && !isPending);
            const isRejected =
                inspection.workflow_status === 'needs_correction' ||
                (inspection.status === 'unsafe' && !isPending);

            if (activeTab === 'pending' && !isPending) return false;
            if (activeTab === 'approved' && !isApproved) return false;
            if (activeTab === 'rejected' && !isRejected) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const location = (inspection.ladder?.location || '').toLowerCase();
                const identifier = (inspection.ladder?.identifier || '').toLowerCase();
                const submitter = (inspection.submitter?.name || '').toLowerCase();
                const inspector = (inspection.inspector?.name || '').toLowerCase();
                const type = (inspection.ladder?.type || '').toLowerCase();

                if (
                    !location.includes(q) &&
                    !identifier.includes(q) &&
                    !submitter.includes(q) &&
                    !inspector.includes(q) &&
                    !type.includes(q)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [inspections, activeTab, searchQuery]);

    return (
        <AuthenticatedLayout breadcrumbs={[{ label: 'Review Aset' }]}>
            <Head title="Review & Verifikasi Aset K3" />

            <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto">

                {/* Header Sesuai SafeLadder Theme */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Review & Verifikasi Aset K3
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Pusat peninjauan kelayakan fisik, persetujuan sertifikasi K3, dan audit ulang hasil inspeksi tangga.
                    </p>
                </div>

                {/* 4 Stat Cards Ringkasan Interaktif */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Total Semua Review */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeTab === 'all' ? 'ring-2 ring-slate-900 border-slate-900' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Semua inspeksi</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <Layers className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCount}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Seluruh riwayat aset</p>
                        </div>
                    </button>

                    {/* 2. Menunggu Review */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeTab === 'pending' ? 'ring-2 ring-amber-500 border-amber-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Menunggu review</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                <Clock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-bold text-amber-600">{pendingCount}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Perlu diverifikasi segera</p>
                        </div>
                    </button>

                    {/* 3. Sudah Di-ACC (Aman & Valid) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('approved')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeTab === 'approved' ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Sudah di-ACC</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{approvedCount}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Tervalidasi & siap dicek ulang</p>
                        </div>
                    </button>

                    {/* 4. Temuan Reject (Perlu Tindak Lanjut) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('rejected')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeTab === 'rejected' ? 'ring-2 ring-rose-500 border-rose-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Temuan reject</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                                <XCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-bold text-rose-600">{rejectedCount}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Perlu revisi / koreksi PIC</p>
                        </div>
                    </button>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 sl-card p-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-[#0f172a] text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua ({totalCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('pending')}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                activeTab === 'pending'
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Review ({pendingCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('approved')}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                activeTab === 'approved'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah Di-ACC ({approvedCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('rejected')}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                activeTab === 'rejected'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Temuan Reject ({rejectedCount})
                        </button>
                    </div>

                    {/* Live Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari tangga, lokasi, PIC..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none transition"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Daftar Kartu Review */}
                <div className="space-y-4">
                    {filteredInspections.length === 0 ? (
                        <div className="sl-card p-16 text-center space-y-3">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Search className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Tidak ada data inspeksi yang sesuai.
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    {searchQuery
                                        ? `Tidak ditemukan hasil untuk "${searchQuery}". Coba kata kunci lain.`
                                        : activeTab === 'pending'
                                        ? 'Semua pengajuan telah selesai direview oleh Inspektor.'
                                        : 'Belum ada data pada kategori ini.'}
                                </p>
                            </div>
                            {searchQuery && (
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                                    >
                                        Hapus pencarian
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredInspections.map((inspection) => {
                                const formattedDate = new Date(inspection.created_at).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                const isPending = inspection.workflow_status === 'pending_review';
                                const isApproved =
                                    inspection.workflow_status === 'approved' ||
                                    (inspection.status === 'safe' && inspection.workflow_status !== 'needs_correction' && !isPending);
                                const isRejected =
                                    inspection.workflow_status === 'needs_correction' ||
                                    (inspection.status === 'unsafe' && !isPending);

                                const checklistEntries = Object.entries(inspection.checklist || {}).filter(
                                    ([k, v]) =>
                                        k !== 'photos' &&
                                        k !== 'comments' &&
                                        k !== 'inspection_type' &&
                                        k !== 'updated_keys' &&
                                        (typeof v === 'boolean' || v === 1 || v === 0 || v === '1' || v === '0')
                                );
                                const totalChecklistCount = checklistEntries.length;

                                return (
                                    <div
                                        key={inspection.id}
                                        className={`sl-card p-5 sm:p-6 transition hover:border-slate-300 ${
                                            isPending ? 'border-amber-200/80 bg-amber-50/10' : ''
                                        }`}
                                    >
                                        {/* Baris Atas: Judul Aset & Badge Status */}
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">
                                                    {inspection.ladder?.identifier || inspection.ladder?.location}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Lokasi: <span className="font-semibold text-slate-700">{inspection.ladder?.location}</span> • Tipe:{' '}
                                                    <span className="font-semibold text-slate-700">
                                                        {inspection.ladder?.type === 'permanent'
                                                            ? 'Tangga Tetap (FLD)'
                                                            : 'Tangga Portabel (PLD)'}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Badge Status Review */}
                                            <div>
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                                                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Review PIC
                                                    </span>
                                                )}
                                                {isApproved && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ✓ Lolos ACC (Aman & Valid)
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
                                                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Temuan Reject (Revisi PIC)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Baris Tengah: Info Meta Pengajuan & Review */}
                                        <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                                            <div>
                                                <span className="text-slate-400 block text-[11px] font-medium">Pengaju (PIC Safety)</span>
                                                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    {inspection.submitter?.name || 'PIC Safety'}
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] font-medium">Waktu Pengajuan</span>
                                                <p className="font-medium text-slate-700 mt-0.5 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formattedDate} WIB
                                                </p>
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block text-[11px] font-medium">
                                                    {isApproved ? 'Masa Berlaku K3' : 'Total Checklist'}
                                                </span>
                                                <p className="font-semibold text-slate-800 mt-0.5">
                                                    {isApproved && inspection.valid_until ? (
                                                        <span className="text-emerald-700">
                                                            Berlaku s/d{' '}
                                                            {new Date(inspection.valid_until).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span>{totalChecklistCount || 25} Butir Diperiksa</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Baris Bawah: Tombol Tindakan */}
                                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                            {/* Link Detail Aset */}
                                            {inspection.ladder?.uuid && (
                                                <Link
                                                    href={route('ladders.show', inspection.ladder.uuid)}
                                                    className="group inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                                                >
                                                    <span>Lihat Detail Aset</span>
                                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                </Link>
                                            )}

                                            {/* Tombol Aksi Review / Cek Ulang */}
                                            <div className="flex items-center gap-2">
                                                {isPending && (
                                                    <Link
                                                        href={route('inspections.review', inspection.id)}
                                                        className="group sl-btn-primary"
                                                    >
                                                        <span>Review Sekarang</span>
                                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </Link>
                                                )}

                                                {isApproved && (
                                                    <Link
                                                        href={route('inspections.review', inspection.id)}
                                                        className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition active:scale-[0.98]"
                                                        title="Cek ulang keputusan review atau perbarui catatan inspeksi"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:-rotate-45" />
                                                        <span>Cek Ulang Hasil Review</span>
                                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </Link>
                                                )}

                                                {isRejected && (
                                                    <Link
                                                        href={route('inspections.review', inspection.id)}
                                                        className="group inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 transition active:scale-[0.98]"
                                                    >
                                                        <span>Cek & Update Temuan</span>
                                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Count */}
                {filteredInspections.length > 0 && (
                    <div className="text-xs text-slate-400 px-1">
                        Menampilkan {filteredInspections.length} dari total {inspections.length} aset terdaftar
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
