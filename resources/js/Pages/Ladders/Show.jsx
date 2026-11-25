import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    XCircle,
    AlertTriangle,
    Calendar,
    User,
    FileText,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Wrench,
    Clock,
    X,
} from 'lucide-react';

export default function Show({ ladder, latestInspection, checklistConfig }) {
    const authUser = usePage().props.auth.user;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [activePhotoModal, setActivePhotoModal] = useState(null);
    const { delete: destroy, processing } = useForm();

    const activeConfigItems = checklistConfig?.[ladder.type]?.flatMap((g) => g.items || []) || [];
    const validConfigKeys = new Set(activeConfigItems.map((i) => i.key));

    const checklistEntries = latestInspection
        ? Object.entries(latestInspection.checklist || {}).filter(
              ([key, value]) =>
                  (validConfigKeys.size === 0 || validConfigKeys.has(key)) &&
                  key !== 'inspection_type' &&
                  key !== 'photos' &&
                  key !== 'comments' &&
                  key !== 'updated_keys' &&
                  (typeof value === 'boolean' || value === 1 || value === 0 || value === '1' || value === '0')
          )
        : [];

    const reviewData = latestInspection?.review_data || {};
    const rejectedItems = checklistEntries.filter(([key]) => reviewData[key]?.decision === 'rejected');
    const approvedItems = checklistEntries.filter(([key]) => reviewData[key]?.decision === 'approved');
    const isNeedsCorrection = latestInspection?.workflow_status === 'needs_correction' || rejectedItems.length > 0;
    const isSubmitterOrAdmin = authUser && (authUser.id === latestInspection?.submitted_by_id || authUser.role === 'admin' || authUser.role === 'pic_safety');

    const getStatusBadge = (inspection) => {
        if (!inspection) {
            return (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    Belum Ada Inspeksi
                </span>
            );
        }

        if (inspection.workflow_status === 'pending_review') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    <Clock className="h-4 w-4" /> Menunggu Review
                </span>
            );
        }

        if (inspection.workflow_status === 'needs_correction' || rejectedItems.length > 0) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                    <XCircle className="h-4 w-4" /> Ada Temuan Reject (Perlu Revisi)
                </span>
            );
        }

        if (inspection.valid_until && new Date(inspection.valid_until) <= new Date()) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    <AlertTriangle className="h-4 w-4" /> Kedaluwarsa
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                ✓ DISETUJUI (AMAN)
            </span>
        );
    };

    const deleteLadder = (e) => {
        e.preventDefault();
        destroy(route('ladders.destroy', ladder.uuid), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Data Aset', href: route('ladders.index') },
                { label: ladder.location || 'Detail Aset' },
            ]}
        >
            <Head title={`Detail Aset - ${ladder.location}`} />

            <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto">

                {/* Header Sesuai Gambar 3 dengan Tombol Kembali Modern */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('ladders.index')}
                            className="sl-btn-back"
                            title="Kembali ke Data Aset"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                {ladder.location}
                            </h1>
                            <p className="text-xs text-slate-500 capitalize mt-0.5">
                                Detail aset • {ladder.type === 'permanent' ? 'Tangga Tetap' : 'Tangga Portabel'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('inspections.create', { ladder: ladder.uuid, return_to: 'detail' })}
                            className="sl-btn-primary"
                        >
                            Ajukan Inspeksi Baru
                        </Link>

                        <button
                            type="button"
                            onClick={() => setConfirmingDeletion(true)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                            Hapus aset
                        </button>
                    </div>
                </div>

                {/* Banner Koreksi jika ada Reject */}
                {isNeedsCorrection && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-rose-600 p-2 text-white">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-rose-900">
                                        Pemberitahuan Temuan Inspeksi: Terdapat {rejectedItems.length} Item Ditolak (Reject)
                                    </h3>
                                    <p className="text-xs text-rose-700 mt-0.5">
                                        Silakan lakukan perbaikan fisik di lapangan lalu unggah foto bukti perbaikan.
                                    </p>
                                </div>
                            </div>

                            {isSubmitterOrAdmin && (
                                <Link
                                    href={route('inspections.correction', latestInspection.id)}
                                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                                >
                                    Buka Form Perbaikan
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid 2 Kolom: Informasi Teknis & Status K3 Terkini Sesuai Gambar 3 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                    {/* Card 1: Informasi Teknis Aset */}
                    <div className="md:col-span-3 sl-card p-6 space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    INFORMASI TEKNIS ASET
                                </p>
                                <h3 className="text-base font-bold text-slate-900 mt-1">
                                    {ladder.location}
                                </h3>
                                <p className="text-xs text-slate-500 capitalize">
                                    {ladder.type}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-1">
                            <div>
                                <span className="text-xs text-slate-400 font-medium block">UUID Sistem</span>
                                <div className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-xs text-slate-700 break-all select-all">
                                    {ladder.uuid}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-slate-400 font-medium block">Deskripsi / Catatan lokasi</span>
                                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                                    {ladder.description || 'Tidak ada deskripsi tambahan.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Status K3 Terkini */}
                    <div className="md:col-span-2 sl-card p-6 flex flex-col justify-between space-y-6">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                STATUS K3 TERKINI
                            </p>
                            <div className="mt-6 flex justify-center">
                                {getStatusBadge(latestInspection)}
                            </div>
                        </div>

                        {latestInspection?.valid_until && (
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <span className="text-[11px] text-slate-400 block font-medium">Masa berlaku hingga</span>
                                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                                    {new Date(latestInspection.valid_until).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Card 3: Audit Terakhir - Laporan Pemeriksaan K3 Sesuai Gambar 3 */}
                <div className="sl-card p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            AUDIT TERAKHIR
                        </p>
                        <h3 className="text-base font-bold text-slate-900 mt-1">
                            Laporan Pemeriksaan K3
                        </h3>
                    </div>

                    {latestInspection ? (
                        <>
                            {/* 3 Box Meta Ringkasan Sesuai Gambar 3 */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="text-xs text-slate-400">Diajukan oleh (PIC Safety)</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {latestInspection.submitter_name || authUser?.name || 'PIC Safety'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="text-xs text-slate-400">Inspektor EHS penilai</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {latestInspection.inspector?.name || 'Inspektor EHS'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <p className="text-xs text-slate-400">Waktu pemeriksaan</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">
                                        {new Date(latestInspection.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })} • {new Date(latestInspection.created_at).toLocaleTimeString('id-ID', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Rincian Status Komponen Checklist */}
                            <div className="pt-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        RINCIAN STATUS KOMPONEN CHECKLIST
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {approvedItems.length} Disetujui / {rejectedItems.length} Reject
                                    </span>
                                </div>

                                {checklistEntries.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-4">
                                        Belum ada rincian komponen pada laporan ini.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {checklistEntries.map(([key]) => {
                                            const itemConfig = activeConfigItems.find((i) => i.key === key);
                                            const decision = reviewData[key]?.decision;
                                            const isApproved = decision === 'approved';
                                            const isRejected = decision === 'rejected';

                                            return (
                                                <div
                                                    key={key}
                                                    className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                                                        isApproved
                                                            ? 'border-emerald-100 bg-emerald-50/40 text-emerald-900'
                                                            : isRejected
                                                            ? 'border-rose-100 bg-rose-50/40 text-rose-900'
                                                            : 'border-slate-100 bg-slate-50/60 text-slate-700'
                                                    }`}
                                                >
                                                    <span className="text-xs font-medium truncate">
                                                        {itemConfig?.label || key.replaceAll('_', ' ')}
                                                    </span>

                                                    {isApproved && (
                                                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold shrink-0">
                                                            ✓ ACC
                                                        </span>
                                                    )}
                                                    {isRejected && (
                                                        <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold shrink-0">
                                                            Reject
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                            Belum ada riwayat inspeksi untuk aset tangga ini.
                        </p>
                    )}
                </div>

            </div>

            {/* Modal Konfirmasi Hapus Aset */}
            {confirmingDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs sl-animate-fade-in">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sl-animate-modal-in space-y-4">
                        <h4 className="text-base font-bold text-slate-900">Konfirmasi Hapus Aset</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Apakah Anda yakin ingin menghapus data tangga <strong>{ladder.location}</strong>? Seluruh riwayat inspeksi dan sertifikat terkait akan dihapus permanen.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingDeletion(false)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={deleteLadder}
                                disabled={processing}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                                {processing ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
