import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ShieldCheck,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    User,
    FileText,
    PenTool,
    Trash2,
    CheckCircle2,
    Circle,
    AlertCircle,
    Wrench,
    Clock,
    Camera,
    MessageSquare,
    X,
    Eye
} from 'lucide-react';

export default function Show({ ladder, latestInspection }) {
    const authUser = usePage().props.auth.user;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [activePhotoModal, setActivePhotoModal] = useState(null);
    const { delete: destroy, processing } = useForm();

    const getStatusBadge = (inspection) => {
        if (!inspection) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase">Belum Ada Inspeksi</span>;

        if (inspection.workflow_status === 'pending_review') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 uppercase">
                    <Clock className="h-4 w-4" /> Menunggu Review
                </span>
            );
        }

        if (inspection.workflow_status === 'needs_correction') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 uppercase">
                    <XCircle className="h-4 w-4" /> Ada Temuan Reject (Perlu Revisi)
                </span>
            );
        }

        if (inspection.status === 'unsafe' || rejectedItems.length > 0) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 uppercase">
                    <XCircle className="h-4 w-4" /> Tidak Aman
                </span>
            );
        }

        if (inspection.valid_until && new Date(inspection.valid_until) <= new Date()) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 uppercase">
                    <AlertTriangle className="h-4 w-4" /> Kadaluarsa
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 uppercase">
                <ShieldCheck className="h-4 w-4" /> Disetujui (Aman)
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

    const checklistEntries = latestInspection
        ? Object.entries(latestInspection.checklist || {}).filter(([key, value]) => key !== 'inspection_type' && key !== 'photos' && key !== 'comments' && (typeof value === 'boolean' || value === 1 || value === 0 || value === '1' || value === '0'))
        : [];

    const reviewData = latestInspection?.review_data || {};
    const rejectedItems = checklistEntries.filter(([key]) => reviewData[key]?.decision === 'rejected');
    const isNeedsCorrection = latestInspection?.workflow_status === 'needs_correction' || rejectedItems.length > 0;
    const isSubmitterOrAdmin = authUser && (authUser.id === latestInspection?.submitted_by_id || authUser.role === 'admin' || authUser.role === 'pic_safety');

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Aset - ${ladder.location}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
                {/* Header Atas */}
                <div className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-5">
                    <div>
                        <Link
                            href={route('ladders.index')}
                            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Data Aset
                        </Link>
                        <p className="text-xs font-medium text-slate-500">Detail aset</p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">{ladder.location}</h1>
                        <p className="mt-1 text-sm text-slate-500">{ladder.type}</p>
                    </div>

                    <div className="flex items-center gap-3 pb-1">
                        {isNeedsCorrection && isSubmitterOrAdmin ? (
                            <Link
                                href={route('inspections.correction', latestInspection.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
                            >
                                <Wrench className="h-4 w-4" /> Perbaiki Item Reject ({rejectedItems.length})
                            </Link>
                        ) : (
                            <Link
                                href={route('inspections.create', ladder.uuid)}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                            >
                                <PenTool className="h-4 w-4" /> Ajukan Inspeksi Baru
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setConfirmingDeletion(true)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-800"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus aset
                        </button>
                    </div>
                </div>

                {/* BANNER NOTIFIKASI JIKA ADA TEMUAN REJECT */}
                {isNeedsCorrection && (
                    <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-rose-600 p-2 text-white">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-rose-900">
                                        Pemberitahuan Temuan Inspeksi: Terdapat {rejectedItems.length} Item Ditolak (Reject)
                                    </h3>
                                    <p className="mt-1 text-xs text-rose-700 leading-relaxed">
                                        Inspektor telah meninjau formulir ini dan menandai beberapa item tidak memenuhi standar. Silakan lakukan perbaikan fisik lalu unggah dokumentasi perbaikan untuk disetujui.
                                    </p>
                                </div>
                            </div>
                            {isSubmitterOrAdmin && (
                                <Link
                                    href={route('inspections.correction', latestInspection.id)}
                                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                                >
                                    <Wrench className="h-4 w-4" /> Buka Form Perbaikan
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid Informasi Utama & Status */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
                    {/* Kartu Spesifikasi Utama */}
                    <div className="k3-panel space-y-5 p-6 md:col-span-3 rounded-2xl">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Informasi Teknis Aset</p>
                                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{ladder.location}</h3>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {ladder.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">UUID Sistem:</p>
                                <p className="font-mono text-xs bg-slate-50 p-2 rounded border border-slate-200 mt-1 break-all text-slate-700">
                                    {ladder.uuid}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Deskripsi / Catatan Lokasi:</p>
                                <p className="text-slate-800 mt-1 italic">
                                    {ladder.description || 'Tidak ada deskripsi tambahan.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Status K3 */}
                    <div className="k3-panel flex min-h-[220px] flex-col justify-between p-6 md:col-span-2 rounded-2xl">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status K3 Terkini</p>
                            <div className="mt-3 flex items-center justify-center py-4">
                                {getStatusBadge(latestInspection)}
                            </div>
                        </div>
                        {latestInspection?.valid_until && (
                            <div className="border-t border-slate-100 pt-3 text-center">
                                <span className="text-[11px] text-slate-400 block font-medium">Masa Berlaku hingga:</span>
                                <span className="text-xs font-bold text-slate-700">
                                    {new Date(latestInspection.valid_until).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Laporan Pemeriksaan K3 */}
                <div className="k3-panel min-h-[250px] space-y-5 p-6 sm:p-7 rounded-2xl">
                    <div className="border-b border-slate-100 pb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Terakhir</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">Laporan Pemeriksaan K3</h3>
                    </div>

                    {latestInspection ? (
                        <div className="grid grid-cols-1 gap-4 pt-2 text-sm sm:grid-cols-3">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--k3-accent-soft)] text-[var(--k3-navy)] shadow-sm">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Diajukan oleh (PIC Safety)</p>
                                    <p className="font-bold text-slate-800">{latestInspection.submitter_name || 'PIC Safety'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 shadow-sm">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Inspektor EHS Penilai</p>
                                    <p className="font-bold text-slate-800">{latestInspection.inspector?.name || 'Administrator'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm text-slate-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Waktu Pemeriksaan</p>
                                    <p className="font-bold text-slate-800">
                                        {new Date(latestInspection.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>

                            {latestInspection.notes && (
                                <div className="sm:col-span-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> Catatan Temuan Lapangan
                                    </p>
                                    <p className="text-slate-700 text-sm leading-relaxed">{latestInspection.notes}</p>
                                </div>
                            )}

                            {/* HASIL REVIEW PER ITEM (TERLIHAT JELAS ACC VS REJECT) */}
                            <div className="sm:col-span-3 border-t border-slate-100 pt-5">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                            Rincian Status Komponen Checklist
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Status peninjauan setiap item oleh Inspektor EHS.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 border border-emerald-200">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> {checklistEntries.filter(([k]) => reviewData[k]?.decision === 'approved').length} Disetujui
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-rose-700 border border-rose-200">
                                            <XCircle className="w-3.5 h-3.5" /> {rejectedItems.length} Reject
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {checklistEntries.map(([key]) => {
                                        const review = reviewData[key];
                                        const isApproved = review?.decision === 'approved';
                                        const isRejected = review?.decision === 'rejected';
                                        const picComment = latestInspection.comments?.[key];
                                        const photoUrl = latestInspection.photos?.[key];

                                        return (
                                            <div
                                                key={key}
                                                className={`rounded-xl border p-3.5 transition flex flex-col justify-between ${
                                                    isRejected
                                                        ? 'border-rose-300 bg-rose-50/70'
                                                        : isApproved
                                                        ? 'border-emerald-200 bg-emerald-50/50'
                                                        : 'border-slate-200 bg-white'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className={`text-xs font-bold block ${isRejected ? 'text-rose-900' : isApproved ? 'text-emerald-900' : 'text-slate-700'}`}>
                                                            {key.replaceAll('_', ' ')}
                                                        </span>

                                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                                                            isRejected
                                                                ? 'bg-rose-600 text-white'
                                                                : isApproved
                                                                ? 'bg-emerald-600 text-white'
                                                                : 'bg-slate-200 text-slate-600'
                                                        }`}>
                                                            {isRejected ? 'REJECT' : isApproved ? 'ACC' : 'PENDING'}
                                                        </span>
                                                    </div>

                                                    {/* Komentar / Catatan Temuan Lapangan oleh PIC */}
                                                    {picComment && (
                                                        <div className="mt-2 rounded-lg bg-white/80 border border-slate-200/80 p-2 text-xs text-slate-700">
                                                            <p className="font-semibold text-slate-900 flex items-center gap-1 text-[11px] mb-0.5">
                                                                <MessageSquare className="h-3 w-3 text-slate-500" /> Catatan PIC:
                                                            </p>
                                                            <p className="italic text-slate-600">"{picComment}"</p>
                                                        </div>
                                                    )}

                                                    {/* Catatan / Remark Keputusan dari Inspektor EHS */}
                                                    {review?.comment && (
                                                        <div className={`mt-2 rounded-lg p-2 text-xs ${
                                                            isRejected
                                                                ? 'bg-rose-100/70 border border-rose-200 text-rose-900'
                                                                : 'bg-emerald-100/70 border border-emerald-200 text-emerald-900'
                                                        }`}>
                                                            <p className="font-bold flex items-center gap-1 text-[11px] mb-0.5">
                                                                <AlertCircle className="h-3 w-3" /> Evaluasi Inspektor:
                                                            </p>
                                                            <p className="font-medium">"{review.comment}"</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bukti Foto Lapangan dari PIC */}
                                                {photoUrl && (
                                                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActivePhotoModal({ url: photoUrl, label: key.replaceAll('_', ' ') })}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)] bg-white/90 border border-[var(--k3-line)] hover:border-[var(--k3-brand)] px-2.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
                                                        >
                                                            <Camera className="h-3.5 w-3.5 text-[var(--k3-brand)]" />
                                                            Lihat Foto Bukti
                                                        </button>
                                                        <span className="text-[10px] text-slate-400 font-medium">Foto Terlampir</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 italic text-sm">
                            Belum ada riwayat inspeksi yang tercatat untuk aset tangga ini. Silakan lakukan inspeksi pertama.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Preview Foto Lapangan */}
            {activePhotoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-[var(--k3-brand)]" />
                                <h4 className="text-sm font-bold text-slate-900 capitalize">{activePhotoModal.label}</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActivePhotoModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[75vh]">
                            <img
                                src={activePhotoModal.url}
                                alt={activePhotoModal.label}
                                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
                            />
                        </div>
                        <div className="px-5 py-3 bg-white border-t border-slate-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActivePhotoModal(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {confirmingDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2 bg-rose-100 rounded-full">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Hapus Aset Tangga?</h3>
                        </div>
                        <p className="text-sm text-slate-600">
                            Apakah Anda yakin ingin menghapus aset <span className="font-bold text-slate-800">{ladder.location}</span>? Tindakan ini akan menghapus semua riwayat inspeksi terkait dan tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingDeletion(false)}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={deleteLadder}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition disabled:opacity-50"
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
