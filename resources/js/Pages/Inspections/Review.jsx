import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, XCircle, Filter, Eye, Camera, Check, History, ChevronDown, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

export default function Review({ inspection, history = [] }) {
    const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'approved', 'rejected', 'pending'
    const [showHistory, setShowHistory] = useState(false);
    const [activePhotoModal, setActivePhotoModal] = useState(null);

    const initialDecisions = Object.fromEntries(inspection.items.map((item) => [item.key, item.decision || '']));
    const initialComments = Object.fromEntries(inspection.items.map((item) => [item.key, item.comment || '']));

    const { data, setData, post, processing, errors } = useForm({
        decisions: initialDecisions,
        comments: initialComments,
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('inspections.review.store', inspection.id));
    };

    const approveAll = () => {
        const updated = { ...data.decisions };
        inspection.items.forEach((item) => {
            updated[item.key] = 'approved';
        });
        setData('decisions', updated);
    };

    const totalApproved = Object.values(data.decisions).filter((d) => d === 'approved').length;
    const totalRejected = Object.values(data.decisions).filter((d) => d === 'rejected').length;
    const totalPending = inspection.items.length - (totalApproved + totalRejected);

    const filteredItems = inspection.items.filter((item) => {
        const decision = data.decisions[item.key] || 'pending';
        if (filterCategory === 'all') return true;
        if (filterCategory === 'approved') return decision === 'approved';
        if (filterCategory === 'rejected') return decision === 'rejected';
        if (filterCategory === 'pending') return decision === 'pending' || !decision;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Review Inspeksi" />

            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header Selaras Dashboard */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--k3-line)] pb-4">
                    <div>
                        <p className="text-xs font-medium text-[var(--k3-muted)]">Tugas Inspektor EHS</p>
                        <h1 className="mt-1 text-xl font-bold text-[var(--k3-navy)]">
                            Review Formulir Inspeksi Tangga
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Aset: <span className="font-semibold text-slate-900">{inspection.ladder?.identifier || inspection.ladder?.location}</span> · PIC: <span className="font-semibold text-slate-900">{inspection.submitter?.name || 'PIC Safety'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={approveAll}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                        >
                            <Check className="h-4 w-4 text-emerald-600" /> ACC Semua Item
                        </button>
                        <Link
                            href={route('inspections.review.queue')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Antrean
                        </Link>
                    </div>
                </div>

                {/* Banner Khusus untuk Inspeksi Pembaruan PIC */}
                {inspection.is_partial_update && (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                                <Check className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                                    Review Pembaruan PIC Safety ({inspection.items.length} Butir Diperbarui)
                                </h3>
                                <p className="text-xs text-emerald-800 mt-0.5">
                                    Hanya menampilkan butir checklist yang baru saja diperbarui oleh PIC Safety. Sebanyak {inspection.previously_approved_count} butir lainnya telah disetujui sebelumnya dan tidak perlu dinilai ulang.
                                </p>
                            </div>
                        </div>
                        <span className="rounded-full bg-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                            {inspection.previously_approved_count} Butir ACC Tersimpan
                        </span>
                    </div>
                )}

                {/* Accordion Riwayat Detail Inspeksi Sebelumnya */}
                {history.length > 0 && (
                    <div className="k3-panel rounded-2xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 hover:bg-slate-50 transition"
                        >
                            <div className="flex items-center gap-2.5">
                                <History className="w-4 h-4 text-[var(--k3-brand)]" />
                                <span className="text-sm">Riwayat & Log Keputusan Inspeksi Tangga Ini ({history.length} Catatan)</span>
                            </div>
                            <span className="text-xs text-[var(--k3-brand-strong)] font-semibold flex items-center gap-1">
                                {showHistory ? 'Sembunyikan' : 'Lihat Riwayat & Waktu Lengkap'}
                                <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                            </span>
                        </button>

                        {showHistory && (
                            <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/50">
                                {history.map((h, idx) => {
                                    const approvedCount = Object.values(h.review_data || {}).filter(r => r?.decision === 'approved').length;
                                    const rejectedCount = Object.values(h.review_data || {}).filter(r => r?.decision === 'rejected').length;
                                    const formattedSubmitTime = new Date(h.created_at).toLocaleString('id-ID', {
                                        dateStyle: 'long',
                                        timeStyle: 'short',
                                    });

                                    return (
                                        <div key={h.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-700">Inspeksi #{h.id} {idx === 0 ? '(Saat ini / Terbaru)' : ''}</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                                        h.workflow_status === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : h.workflow_status === 'needs_correction'
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {h.workflow_status === 'approved' ? 'DISETUJUI (ACC)' : h.workflow_status === 'needs_correction' ? 'ADA TEMUAN REJECT' : 'MENUNGGU REVIEW'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    Waktu Pengajuan: {formattedSubmitTime} WIB
                                                </span>
                                            </div>

                                            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                                                <p>Diajukan oleh: <strong className="text-slate-800">{h.submitter_name}</strong></p>
                                                <p>Inspektor: <strong className="text-slate-800">{h.inspector_name}</strong></p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-700 font-bold">{approvedCount} Item ACC</span>
                                                    <span>·</span>
                                                    <span className="text-rose-700 font-bold">{rejectedCount} Item Reject</span>
                                                </div>
                                            </div>

                                            {h.review_comment && (
                                                <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                                                    Catatan Review: "{h.review_comment}"
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB KATEGORI FILTER: SEMUA / SUDAH DI-ACC / REJECT / BELUM DITENTUKAN */}
                <div className="k3-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--k3-muted)]">
                        <Filter className="h-4 w-4 text-[var(--k3-brand)]" />
                        <span>Kategori Tampilan:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setFilterCategory('all')}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                filterCategory === 'all'
                                    ? 'bg-[var(--k3-navy)] text-white'
                                    : 'bg-[var(--k3-surface)] text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Butir ({inspection.items.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('approved')}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                filterCategory === 'approved'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui ({totalApproved})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('rejected')}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                filterCategory === 'rejected'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                            }`}
                        >
                            <XCircle className="w-3.5 h-3.5" /> Reject ({totalRejected})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('pending')}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                filterCategory === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                        >
                            Belum Ditentukan ({totalPending})
                        </button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {filteredItems.map((item) => {
                        const decision = data.decisions[item.key];
                        return (
                            <section
                                key={item.key}
                                className={`k3-panel p-5 rounded-2xl transition border-2 ${
                                    decision === 'approved'
                                        ? 'border-emerald-300 bg-emerald-50/20'
                                        : decision === 'rejected'
                                        ? 'border-rose-300 bg-rose-50/20'
                                        : 'border-[var(--k3-line)]'
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900">{item.label}</p>
                                        <p className="text-xs text-slate-500">
                                            Status dari PIC: {item.checked ? 'Kondisi Baik / Sesuai' : 'Tidak Sesuai / Butuh Perhatian'}
                                        </p>
                                        {item.pic_comment && (
                                            <p className="text-xs italic text-slate-600">Catatan PIC: "{item.pic_comment}"</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('decisions', { ...data.decisions, [item.key]: 'approved' })}
                                            className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                                decision === 'approved'
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                            }`}
                                        >
                                            <CheckCircle2 className="h-4 w-4" /> ACC
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('decisions', { ...data.decisions, [item.key]: 'rejected' })}
                                            className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                                decision === 'rejected'
                                                    ? 'bg-rose-600 text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                                            }`}
                                        >
                                            <XCircle className="h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                </div>

                                {item.photo_url && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setActivePhotoModal({ url: item.photo_url, label: item.label })}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)] bg-white border border-[var(--k3-line)] px-3 py-1.5 rounded-xl hover:border-[var(--k3-brand)] transition cursor-pointer shadow-2xs"
                                        >
                                            <Camera className="h-3.5 w-3.5 text-[var(--k3-brand)]" /> Lihat Bukti Foto Lapangan
                                        </button>
                                    </div>
                                )}

                                {decision === 'rejected' && (
                                    <div className="mt-3">
                                        <label className="block text-xs font-bold text-rose-800 mb-1">
                                            Catatan / Temuan Reject (Wajib Diisi untuk PIC Safety):
                                        </label>
                                        <input
                                            type="text"
                                            value={data.comments[item.key] || ''}
                                            onChange={(e) => setData('comments', { ...data.comments, [item.key]: e.target.value })}
                                            placeholder="Contoh: Baut pengait longgar, perlu diganti segera."
                                            className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                            required
                                        />
                                    </div>
                                )}
                            </section>
                        );
                    })}

                    <div className="flex justify-end pt-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[var(--k3-navy)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--k3-brand-strong)] disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan & Selesaikan Review'}
                        </button>
                    </div>
                </form>
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
        </AuthenticatedLayout>
    );
}
