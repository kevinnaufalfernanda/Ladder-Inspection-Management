import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    X,
    ChevronDown,
    Camera,
    Sparkles,
    CheckCircle2,
    XCircle,
    Clock,
    History,
    CheckSquare,
    ExternalLink,
    ShieldCheck,
    RotateCcw,
    AlertTriangle,
    ArrowRight,
    Lock,
    ArrowUpDown,
    Search,
    Filter,
} from 'lucide-react';
import { useState } from 'react';

export default function Review({ inspection, history = [] }) {
    const [showHistory, setShowHistory] = useState(false);
    const [activePhotoModal, setActivePhotoModal] = useState(null);
    const [rejectConfirmItem, setRejectConfirmItem] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);

    const items = inspection.items || [];
    const groups = inspection.groups || [
        {
            title: 'Daftar Pemeriksaan Checklist K3',
            items: items,
        },
    ];

    const isPartialUpdate = Boolean(inspection.is_partial_update);
    const submittableItems = isPartialUpdate
        ? items.filter((item) => item.is_updated)
        : items;

    // Filter, Urutan (Sort), & Pencarian Cepat
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'submitted' | 'approved' | 'rejected' | 'pending'
    const [sortBy, setSortBy] = useState(isPartialUpdate ? 'submitted_first' : 'default'); // 'submitted_first' | 'default'
    const [searchQuery, setSearchQuery] = useState('');

    // Inisialisasi keputusan review untuk seluruh butir checklist
    const initialDecisions = Object.fromEntries(
        items.map((item) => [item.key, item.decision || ''])
    );
    const initialComments = Object.fromEntries(
        items.map((item) => [item.key, item.comment || ''])
    );

    const { data, setData, post, processing } = useForm({
        decisions: initialDecisions,
        comments: initialComments,
        notes: inspection.notes || '',
    });

    const submit = (event) => {
        if (event) event.preventDefault();
        setShowFinalConfirmModal(false);
        post(route('inspections.review.store', inspection.id));
    };

    // Toggle keputusan review untuk butir yang diajukan
    const toggleDecision = (key, targetDecision) => {
        const current = data.decisions[key];
        const next = current === targetDecision ? '' : targetDecision;
        setData('decisions', {
            ...data.decisions,
            [key]: next,
        });
    };

    // Buka modal konfirmasi ganda untuk me-reject butir yang sebelumnya sudah di-ACC
    const openRejectConfirmModal = (item) => {
        setRejectConfirmItem(item);
        setRejectReasonInput(data.comments[item.key] || '');
    };

    // Konfirmasi reject dari modal konfirmasi ganda
    const handleConfirmReject = () => {
        if (!rejectConfirmItem) return;
        setData({
            ...data,
            decisions: {
                ...data.decisions,
                [rejectConfirmItem.key]: 'rejected',
            },
            comments: {
                ...data.comments,
                [rejectConfirmItem.key]: rejectReasonInput.trim(),
            },
        });
        setRejectConfirmItem(null);
        setRejectReasonInput('');
    };

    // Kembalikan butir ke status ACC
    const restoreToApproved = (key) => {
        setData({
            ...data,
            decisions: {
                ...data.decisions,
                [key]: 'approved',
            },
            comments: {
                ...data.comments,
                [key]: '',
            },
        });
    };

    const totalItems = items.length;
    const totalApproved = Object.values(data.decisions).filter((d) => d === 'approved').length;
    const totalRejected = Object.values(data.decisions).filter((d) => d === 'rejected').length;
    const totalDecided = totalApproved + totalRejected;
    const totalPending = totalItems - totalDecided;
    const totalPhotos = items.filter((i) => Boolean(i.photo_url)).length;

    // Hitung status ACC untuk butir yang diajukan
    const targetItemsForHeader = isPartialUpdate ? submittableItems : items;
    const areTargetItemsAllApproved =
        targetItemsForHeader.length > 0 &&
        targetItemsForHeader.every((item) => data.decisions[item.key] === 'approved');

    // Toggle ACC butir yang diajukan (header utama)
    const toggleApproveTargetItems = () => {
        if (areTargetItemsAllApproved) {
            // Kosongkan keputusan pada butir yang diajukan
            const updated = { ...data.decisions };
            targetItemsForHeader.forEach((item) => {
                updated[item.key] = '';
            });
            setData('decisions', updated);
        } else {
            // ACC seluruh butir yang diajukan
            const updated = { ...data.decisions };
            targetItemsForHeader.forEach((item) => {
                updated[item.key] = 'approved';
            });
            setData('decisions', updated);
        }
    };

    // Toggle ACC kelompok
    const toggleApproveGroup = (groupItems) => {
        const groupTargetItems = isPartialUpdate
            ? groupItems.filter((i) => i.is_updated)
            : groupItems;

        if (groupTargetItems.length === 0) return;

        const isGroupAllApproved = groupTargetItems.every((item) => data.decisions[item.key] === 'approved');
        const updated = { ...data.decisions };
        groupTargetItems.forEach((item) => {
            updated[item.key] = isGroupAllApproved ? '' : 'approved';
        });
        setData('decisions', updated);
    };

    const assetTitle = inspection.ladder?.identifier || `${inspection.ladder?.type === 'permanent' ? 'Permanent' : 'Portable'} - ${inspection.ladder?.location}`;
    const ladderType = inspection.ladder?.type === 'permanent' ? 'permanent' : 'portable';

    // Filter daftar butir yang ditolak untuk modal konfirmasi akhir
    const rejectedItemsList = items.filter((item) => data.decisions[item.key] === 'rejected');

    // Filter & Sortir Groups dan Items
    const processedGroups = groups
        .map((group) => {
            const rawItems = group.items || [];
            let filteredItems = rawItems;

            // 1. Filter berdasarkan activeFilter
            if (activeFilter === 'submitted') {
                filteredItems = filteredItems.filter((item) => item.is_updated);
            } else if (activeFilter === 'approved') {
                filteredItems = filteredItems.filter((item) => data.decisions[item.key] === 'approved');
            } else if (activeFilter === 'rejected') {
                filteredItems = filteredItems.filter((item) => data.decisions[item.key] === 'rejected');
            } else if (activeFilter === 'pending') {
                filteredItems = filteredItems.filter((item) => !data.decisions[item.key]);
            }

            // 2. Filter berdasarkan kata kunci pencarian
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                filteredItems = filteredItems.filter(
                    (item) =>
                        item.label.toLowerCase().includes(q) ||
                        (item.pic_comment && item.pic_comment.toLowerCase().includes(q)) ||
                        item.key.toLowerCase().includes(q)
                );
            }

            // 3. Sortir items dalam group
            if (sortBy === 'submitted_first') {
                filteredItems = [...filteredItems].sort((a, b) => {
                    const aSub = a.is_updated ? 1 : 0;
                    const bSub = b.is_updated ? 1 : 0;
                    if (aSub !== bSub) return bSub - aSub;
                    return 0;
                });
            }

            const submittedCountInGroup = rawItems.filter((i) => i.is_updated).length;

            return {
                ...group,
                rawItems,
                items: filteredItems,
                submittedCount: submittedCountInGroup,
            };
        })
        .sort((a, b) => {
            if (sortBy === 'submitted_first') {
                if (a.submittedCount > 0 && b.submittedCount === 0) return -1;
                if (a.submittedCount === 0 && b.submittedCount > 0) return 1;
            }
            return 0;
        })
        .filter((group) => group.items.length > 0 || (activeFilter === 'all' && !searchQuery.trim()));

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Review Aset', href: route('inspections.review.queue') },
                { label: inspection.ladder?.location || 'Detail Aset', href: route('ladders.show', inspection.ladder?.uuid) },
                { label: 'Detail Review' },
            ]}
        >
            <Head title={`Review - ${inspection.ladder?.location || assetTitle}`} />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* Page Title & Subtitle Selaras Create.jsx */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('inspections.review.queue')}
                            className="sl-btn-back"
                            title="Kembali ke Antrean Review"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Review Formulir Inspeksi Tangga
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                {assetTitle} • PIC: <span className="font-semibold text-slate-700">{inspection.submitter?.name || 'PIC Safety'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Tombol Toggle ACC Butir yang Diajukan */}
                        <button
                            type="button"
                            onClick={toggleApproveTargetItems}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95 ${
                                areTargetItemsAllApproved
                                    ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                            title={
                                areTargetItemsAllApproved
                                    ? 'Klik lagi untuk mengosongkan centang butir yang diajukan'
                                    : isPartialUpdate
                                    ? `Setujui seluruh ${submittableItems.length} butir yang diajukan PIC`
                                    : `Setujui seluruh ${totalItems} butir checklist`
                            }
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>
                                {isPartialUpdate
                                    ? `ACC Butir yang Diajukan (${submittableItems.length})`
                                    : `ACC Semua Butir (${totalItems})`}
                            </span>
                        </button>

                        {inspection.ladder?.uuid && (
                            <Link
                                href={route('ladders.show', inspection.ladder.uuid)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                            >
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                <span>Detail Aset</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Status Inspeksi Terakhir Banner Selaras Gambar 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Waktu Pengajuan:</span>
                        <span className="text-slate-600 font-normal">
                            {new Date(inspection.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })} • {new Date(inspection.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isPartialUpdate && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>{submittableItems.length} Butir Baru Diajukan PIC</span>
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{totalApproved} Butir Disetujui (ACC)</span>
                        </span>
                        {totalRejected > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>{totalRejected} Butir Reject</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Summary Card Selaras Gambar 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Progres: {totalDecided} / {totalItems} Checklist Dinilai · {totalPhotos} Foto Bukti Tersedia
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isPartialUpdate ? (
                                    <>
                                        Tinjau <strong className="text-slate-800">{submittableItems.length} butir yang diajukan PIC</strong>. Butir lainnya berstatus <span className="font-semibold text-emerald-700">ACC Tersimpan</span> dan tetap dapat di-reject melalui konfirmasi ganda jika ditemukan ketidaksesuaian.
                                    </>
                                ) : (
                                    <>
                                        Tinjau bukti foto dan tentukan status kelayakan K3 (<span className="font-bold text-emerald-700">ACC</span> atau <span className="font-bold text-rose-700">Reject</span>) untuk setiap butir pemeriksaan.
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Jenis Tangga Terkunci */}
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 border border-slate-200">
                            <span className="text-xs font-semibold text-slate-600">Jenis Tangga:</span>
                            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                {ladderType === 'permanent'
                                    ? `Tangga Tetap (FLD • ${totalItems} Butir)`
                                    : `Tangga Portabel (PLD • ${totalItems} Butir)`}
                            </span>
                        </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-[#f59e0b] transition-all duration-300"
                            style={{ width: `${totalItems ? (totalDecided / totalItems) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Accordion Riwayat Log Keputusan */}
                {history.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                        >
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-400" />
                                Riwayat & Log Keputusan Inspeksi Tangga Ini ({history.length} Catatan)
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                {showHistory ? 'Sembunyikan' : 'Lihat Riwayat & Waktu Lengkap'}
                                <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                            </span>
                        </button>

                        {showHistory && (
                            <div className="border-t border-slate-100 p-4 space-y-2 bg-slate-50/50 text-xs">
                                {history.map((h, idx) => (
                                    <div
                                        key={idx}
                                        className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-slate-200/60 last:border-0"
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                                <span>Diajukan oleh: <strong className="text-slate-900">{h.submitter_name}</strong></span>
                                                <span className="text-slate-300">•</span>
                                                <span>Inspektor: <strong className="text-slate-900">{h.inspector_name}</strong></span>
                                            </div>
                                            {h.review_comment && (
                                                <p className="text-[11px] text-slate-500 italic">
                                                    Catatan: "{h.review_comment}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2.5">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                h.workflow_status === 'approved'
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : h.workflow_status === 'needs_correction'
                                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                                {h.workflow_status === 'approved'
                                                    ? '✓ Lolos ACC'
                                                    : h.workflow_status === 'needs_correction'
                                                    ? 'Temuan Reject'
                                                    : 'Menunggu Review'}
                                            </span>
                                            <span className="font-mono text-[11px] text-slate-400">
                                                {new Date(h.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })} WIB
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Toolbar Sortir & Filter Checklist */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                    {/* Filter Quick Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer active:scale-95 ${
                                activeFilter === 'all'
                                    ? 'bg-[#0f172a] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Semua Butir ({totalItems})
                        </button>
                        {isPartialUpdate && (
                            <button
                                type="button"
                                onClick={() => setActiveFilter(activeFilter === 'submitted' ? 'all' : 'submitted')}
                                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer active:scale-95 border ${
                                    activeFilter === 'submitted'
                                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                        : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                            >
                                <Sparkles className="w-3 h-3" />
                                Diajukan PIC ({submittableItems.length})
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveFilter(activeFilter === 'approved' ? 'all' : 'approved')}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer active:scale-95 border ${
                                activeFilter === 'approved'
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Disetujui ({totalApproved})
                        </button>
                        {totalRejected > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveFilter(activeFilter === 'rejected' ? 'all' : 'rejected')}
                                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer active:scale-95 border ${
                                    activeFilter === 'rejected'
                                        ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                                        : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                                }`}
                            >
                                <XCircle className="w-3 h-3" />
                                Reject ({totalRejected})
                            </button>
                        )}
                        {totalPending > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
                                className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold transition cursor-pointer active:scale-95 ${
                                    activeFilter === 'pending'
                                        ? 'bg-slate-700 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <Clock className="w-3 h-3" />
                                Belum Ditentukan ({totalPending})
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown & Quick Search */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium hidden sm:inline">Urutan:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-[#0f172a] focus:bg-white focus:outline-none cursor-pointer"
                            >
                                <option value="submitted_first">Diajukan PIC Teratas (Prioritas)</option>
                                <option value="default">Nomor Urut Standar (1 - {totalItems})</option>
                            </select>
                        </div>

                        <div className="relative flex-1 sm:w-48">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari butir checklist..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0f172a] focus:bg-white focus:outline-none"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Evaluasi Checklist 2 Kolom Selaras Gambar 2 */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setShowFinalConfirmModal(true);
                    }}
                    className="space-y-6"
                >

                    {processedGroups.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-xs">
                            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Filter className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-800">
                                    Tidak ada butir checklist yang cocok dengan filter atau kata kunci
                                </p>
                                <p className="text-xs text-slate-500">
                                    Coba pilih tab filter lain atau kosongkan kata kunci pencarian.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveFilter('all');
                                    setSearchQuery('');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                                <span>Reset Filter & Tampilkan Semua</span>
                            </button>
                        </div>
                    )}

                    {processedGroups.map((group, groupIdx) => {
                        const groupRawItems = group.rawItems || group.items || [];
                        const groupItems = group.items || [];
                        const groupSubmittable = isPartialUpdate
                            ? groupRawItems.filter((i) => i.is_updated)
                            : groupRawItems;
                        const groupPhotosCount = groupRawItems.filter((i) => Boolean(i.photo_url)).length;
                        const isGroupTargetAllApproved =
                            groupSubmittable.length > 0 &&
                            groupSubmittable.every((item) => data.decisions[item.key] === 'approved');

                        return (
                            <div key={groupIdx} className="space-y-4">
                                {/* Navy Category Banner Selaras Gambar 2 */}
                                <div className="rounded-2xl bg-[#0f172a] p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                                            {group.title}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-300">
                                            {groupRawItems.length > 0 && `Butir ${groupRawItems[0]?.label?.split('.')[0] || '1'}-${groupRawItems[groupRawItems.length - 1]?.label?.split('.')[0] || groupRawItems.length} • `}
                                            {isPartialUpdate
                                                ? `${groupSubmittable.length} butir diajukan PIC, ${groupRawItems.length - groupSubmittable.length} butir telah di-ACC sebelumnya.`
                                                : 'Tinjau bukti foto dan tentukan status kelayakan K3.'}
                                            {groupItems.length !== groupRawItems.length && (
                                                <span className="text-amber-300 font-semibold ml-1">
                                                    (Menampilkan {groupItems.length} dari {groupRawItems.length} butir)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {groupPhotosCount}/{groupRawItems.length} foto tersedia
                                        </span>

                                        {groupSubmittable.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => toggleApproveGroup(groupRawItems)}
                                                className={`inline-flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                                                    isGroupTargetAllApproved
                                                        ? 'text-emerald-400 hover:text-emerald-300'
                                                        : 'text-amber-400 hover:text-amber-300'
                                                }`}
                                                title={
                                                    isGroupTargetAllApproved
                                                        ? 'Klik lagi untuk mengosongkan butir yang diajukan di bagian ini'
                                                        : 'ACC butir yang diajukan di bagian ini'
                                                }
                                            >
                                                <CheckSquare className="w-3.5 h-3.5" />
                                                <span>
                                                    {isPartialUpdate
                                                        ? `ACC Pembaruan di Bagian Ini (${groupSubmittable.length})`
                                                        : 'ACC Semua di Bagian Ini'}
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Seluruh Butir Bagian Ini Telah ACC
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Checklist Items Grid (2 Kolom Card Persis Gambar 2) */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {groupItems.map((item) => {
                                        const isDirectReviewable = !isPartialUpdate || item.is_updated;
                                        const decision = data.decisions[item.key];
                                        const isAcc = decision === 'approved';
                                        const isRej = decision === 'rejected';

                                        return (
                                            <div
                                                key={item.key}
                                                className={`rounded-2xl border p-4 transition-all ${
                                                    isAcc
                                                        ? 'border-emerald-300 bg-emerald-50/25 shadow-xs'
                                                        : isRej
                                                        ? 'border-rose-300 bg-rose-50/30 shadow-xs'
                                                        : item.is_updated
                                                        ? 'border-amber-300 bg-amber-50/20'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                {/* Top Row: Label & Circle Indicator (Bukti Status Review) */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {item.is_updated && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                                                    <Sparkles className="w-3 h-3 text-amber-600" /> Baru Diajukan PIC
                                                                </span>
                                                            )}
                                                            {!item.is_updated && isAcc && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah Di-ACC Sebelumnya
                                                                </span>
                                                            )}
                                                            {!item.is_updated && isRej && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                                                                    <XCircle className="w-3 h-3 text-rose-600" /> Ditolak (Diubah dari ACC)
                                                                </span>
                                                            )}
                                                            {isDirectReviewable && !decision && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
                                                                    <Clock className="w-3 h-3 text-slate-400" /> Belum Direview
                                                                </span>
                                                            )}
                                                        </div>

                                                        <span className={`text-xs sm:text-sm leading-relaxed block ${
                                                            isAcc ? 'font-bold text-slate-900' : isRej ? 'font-bold text-rose-950' : 'font-medium text-slate-800'
                                                        }`}>
                                                            {item.label}
                                                        </span>

                                                        {item.pic_comment && (
                                                            <p className="text-[11px] text-slate-500 italic">
                                                                Catatan PIC: "{item.pic_comment}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Custom Circular Indicator Bukti Review Selaras Gambar 2 */}
                                                    <div
                                                        className={`shrink-0 mt-0.5 ${isDirectReviewable ? 'cursor-pointer' : ''}`}
                                                        onClick={() => {
                                                            if (isDirectReviewable) {
                                                                toggleDecision(item.key, isAcc ? 'approved' : isRej ? 'rejected' : 'approved');
                                                            }
                                                        }}
                                                        title={
                                                            isDirectReviewable
                                                                ? (decision ? 'Klik untuk membatalkan (kosongkan status)' : 'Klik untuk ACC')
                                                                : 'Status ACC tersimpan dari review sebelumnya'
                                                        }
                                                    >
                                                        {isAcc ? (
                                                            <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                                                                <Check className="w-3 h-3 stroke-[3]" />
                                                            </div>
                                                        ) : isRej ? (
                                                            <div className="w-5 h-5 rounded-full border-2 border-rose-600 bg-rose-600 flex items-center justify-center text-white shadow-xs">
                                                                <X className="w-3 h-3 stroke-[3]" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition" title="Belum Diputuskan" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Bukti Foto Lapangan & Pilihan ACC / Reject */}
                                                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                                    {/* Bukti Foto (Style tombol hijau seperti SafeLadder - Detail Aset.png pada Gambar 2) */}
                                                    <div>
                                                        {item.photo_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActivePhotoModal(item.photo_url)}
                                                                className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition max-w-[210px] truncate cursor-pointer shadow-2xs"
                                                                title="Klik untuk membuka bukti foto resolusi penuh"
                                                            >
                                                                <Camera className="h-3 w-3 shrink-0 text-emerald-600" />
                                                                <span className="truncate">✓ Bukti Foto Terunggah</span>
                                                            </button>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-400">
                                                                <Camera className="h-3 w-3 shrink-0 text-slate-300" />
                                                                <span>Tanpa Foto</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Pilihan ACC atau Reject Berdasarkan Hak Ajuan */}
                                                    <div>
                                                        {isDirectReviewable ? (
                                                            /* Butir yang diajukan PIC: tombol ACC dan Reject aktif dengan sistem toggle */
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleDecision(item.key, 'approved')}
                                                                    className={`rounded-lg border px-3 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                                                                        isAcc
                                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'
                                                                    }`}
                                                                    title={isAcc ? 'Klik lagi untuk membatalkan ACC (kosongkan status)' : 'Setujui butir ini (ACC)'}
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                    <span>ACC</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleDecision(item.key, 'rejected')}
                                                                    className={`rounded-lg border px-3 py-1 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                                                                        isRej
                                                                            ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                                                            : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800'
                                                                    }`}
                                                                    title={isRej ? 'Klik lagi untuk membatalkan Reject (kosongkan status)' : 'Tolak butir ini (Reject)'}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                    <span>Reject</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            /* Butir yang sudah di-ACC sebelumnya: status ACC terkunci, namun tetap ada opsi Reject dengan Konfirmasi Ganda */
                                                            <div className="flex items-center gap-2">
                                                                {isAcc ? (
                                                                    <>
                                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                                                                            <Check className="w-3 h-3 text-emerald-600" /> ACC Tersimpan
                                                                        </span>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openRejectConfirmModal(item)}
                                                                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                                                                            title="Koreksi ulang butir ini (buka konfirmasi reject)"
                                                                        >
                                                                            <X className="h-3 w-3 text-rose-500" />
                                                                            <span>Reject...</span>
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => restoreToApproved(item.key)}
                                                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center gap-1 cursor-pointer active:scale-95"
                                                                        title="Kembalikan butir ini ke status ACC"
                                                                    >
                                                                        <RotateCcw className="h-3 w-3 text-emerald-600" />
                                                                        <span>Batalkan Reject</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Input Catatan Alasan Jika Di-Reject */}
                                                {isRej && (
                                                    <div className="mt-3 pt-2.5 border-t border-rose-100 space-y-1">
                                                        <label className="text-[10px] font-bold text-rose-800 block">
                                                            Catatan Temuan / Alasan Reject untuk PIC Safety:
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={data.comments[item.key] || ''}
                                                            onChange={(e) => setData('comments', { ...data.comments, [item.key]: e.target.value })}
                                                            placeholder="Ketik catatan alasan reject untuk perbaikan PIC..."
                                                            className="w-full rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1.5 text-[11px] text-rose-900 placeholder:text-rose-300 focus:border-rose-400 focus:bg-white focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Section: Penilaian Resmi Kelaikan Fisik K3 */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-5 shadow-xs">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            PENILAIAN RESMI KELAIKAN FISIK K3
                        </h4>
                        <p className="mt-1 text-xs text-slate-600">
                            Hasil akhir status tangga ({totalRejected > 0 ? 'Tidak Aman / Perlu Tindakan Koreksi' : totalPending === 0 ? 'Aman & Valid' : 'Menunggu Keputusan Lengkap'}) diputuskan secara resmi oleh Inspektor EHS.
                        </p>
                    </div>

                    {/* Section: Catatan & Temuan Tambahan (Remarks) Selaras Create.jsx */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            CATATAN & TEMUAN TAMBAHAN (REMARKS REVIEW)
                        </h4>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none"
                            placeholder="Ketik catatan umum evaluasi hasil review untuk PIC Safety (opsional)..."
                        />
                    </div>

                    {/* Bottom Action Row Selaras Create.jsx */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <div className="text-xs text-slate-500">
                            Progres Keputusan: <strong className="text-slate-800">{totalDecided} / {totalItems}</strong> butir dinilai (
                            <span className="text-emerald-700 font-semibold">{totalApproved} ACC</span>
                            {totalRejected > 0 && <span className="text-rose-700 font-semibold">, {totalRejected} Reject</span>}
                            {totalPending > 0 && <span className="text-amber-700 font-semibold">, {totalPending} Belum Ditentukan</span>}
                            )
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Link
                                href={route('inspections.review.queue')}
                                className="sl-btn-back text-xs"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing || totalPending > 0}
                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold shadow-md transition cursor-pointer active:scale-95 ${
                                    totalPending === 0 && !processing
                                        ? totalRejected > 0
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {processing ? (
                                    'Menyimpan Keputusan...'
                                ) : totalPending > 0 ? (
                                    `Tentukan ${totalPending} Butir Lagi`
                                ) : totalRejected > 0 ? (
                                    'Simpan & Kirim Catatan Koreksi'
                                ) : (
                                    'Simpan & Selesaikan Review'
                                )}
                            </button>
                        </div>
                    </div>

                </form>

            </div>

            {/* Modal Konfirmasi Ganda: Reject Butir yang Sudah Di-ACC */}
            {rejectConfirmItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity sl-animate-fade-in"
                    onClick={() => setRejectConfirmItem(null)}
                >
                    <div
                        className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 sl-animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900">
                                    Konfirmasi Reject Butir Checklist
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Butir: <span className="font-bold text-slate-800">{rejectConfirmItem.label}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRejectConfirmItem(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1">
                            <p className="font-semibold">Perhatian:</p>
                            <p className="text-amber-800 text-[11px] leading-relaxed">
                                Butir ini sebelumnya telah berstatus <strong>Lolos ACC</strong>. Jika Anda me-reject butir ini, status tangga akan menjadi <strong>Tidak Aman</strong> dan PIC Safety diwajibkan untuk memperbaiki data atau kondisi fisik butir ini serta mengunggah bukti foto baru.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 block">
                                Catatan Alasan Reject (Wajib): <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={rejectReasonInput}
                                onChange={(e) => setRejectReasonInput(e.target.value)}
                                rows={3}
                                placeholder="Jelaskan kesalahan atau temuan lapangan pada butir ini agar PIC dapat memperbaikinya..."
                                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setRejectConfirmItem(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                disabled={!rejectReasonInput.trim()}
                                onClick={handleConfirmReject}
                                className={`rounded-xl px-5 py-2 text-xs font-bold shadow-sm transition cursor-pointer ${
                                    rejectReasonInput.trim()
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                Ya, Tetapkan Sebagai Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Ganda Saat Submit (Jika Ada Temuan Reject) */}
            {showFinalConfirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity sl-animate-fade-in"
                    onClick={() => setShowFinalConfirmModal(false)}
                >
                    <div
                        className="relative max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 sl-animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                totalRejected > 0
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-emerald-100 text-emerald-600'
                            }`}>
                                {totalRejected > 0 ? (
                                    <AlertTriangle className="h-5 w-5" />
                                ) : (
                                    <ShieldCheck className="h-5 w-5" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900">
                                    {totalRejected > 0
                                        ? 'Konfirmasi Pengiriman Catatan Koreksi'
                                        : 'Konfirmasi Persetujuan K3 Tangga'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {totalRejected > 0
                                        ? `Terdapat ${totalRejected} butir pemeriksaan yang ditolak (Reject).`
                                        : `Seluruh ${totalItems} butir pemeriksaan telah disetujui (ACC).`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFinalConfirmModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {totalRejected > 0 ? (
                            <div className="space-y-3">
                                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900 space-y-1">
                                    <p className="font-semibold">Konfirmasi Temuan Reject:</p>
                                    <p className="text-rose-800 text-[11px] leading-relaxed">
                                        Status tangga akan ditetapkan sebagai <strong>TIDAK AMAN</strong>. PIC Safety akan menerima notifikasi untuk segera melakukan perbaikan pada butir-butir berikut:
                                    </p>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50">
                                    {rejectedItemsList.map((item) => (
                                        <div key={item.key} className="text-xs space-y-0.5 border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                <span>{item.label}</span>
                                            </div>
                                            <p className="text-[11px] text-rose-700 pl-5">
                                                Alasan: "{data.comments[item.key] || 'Perlu perbaikan fisik / data lapangan'}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 space-y-1">
                                <p className="font-semibold">Konfirmasi Lolos Standar K3:</p>
                                <p className="text-emerald-800 text-[11px] leading-relaxed">
                                    Seluruh butir fisik dan operasional dinyatakan memenuhi standar keselamatan Wilmar. Sertifikat kelayakan K3 akan diterbitkan dan aset tangga siap digunakan secara resmi.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowFinalConfirmModal(false)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                            >
                                Periksa Ulang
                            </button>

                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer active:scale-95 ${
                                    totalRejected > 0
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-[#f59e0b] hover:bg-[#d97706]'
                                }`}
                            >
                                {processing ? (
                                    'Menyimpan Keputusan...'
                                ) : totalRejected > 0 ? (
                                    'Ya, Kirim Catatan Koreksi ke PIC'
                                ) : (
                                    'Ya, Selesaikan & Terbitkan ACC'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Pratinjau Foto Dokumentasi Lapangan */}
            {activePhotoModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity sl-animate-fade-in"
                    onClick={() => setActivePhotoModal(null)}
                >
                    <div
                        className="relative max-w-2xl w-full bg-white rounded-3xl p-5 shadow-2xl space-y-3 sl-animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <Camera className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-bold text-slate-800">
                                    Dokumentasi Foto Lapangan K3
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActivePhotoModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center">
                            <img
                                src={activePhotoModal}
                                alt="Bukti Foto Lapangan"
                                className="w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
