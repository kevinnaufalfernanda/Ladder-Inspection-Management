import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    Circle,
    Camera,
    CheckSquare,
    XCircle,
    Clock,
    AlertCircle,
    Check,
} from 'lucide-react';
import { useState } from 'react';

export default function Create({ ladder, checklistConfig, latestInspection }) {
    const returnTo = new URLSearchParams(window.location.search).get('return_to');
    const redirectTarget = returnTo === 'dashboard' ? 'dashboard' : 'detail';
    const backHref = redirectTarget === 'dashboard' ? route('dashboard') : route('ladders.show', ladder.uuid);

    // Jenis tangga dikunci mengikuti identitas tangga yang telah didaftarkan
    const ladderType = ladder.type === 'permanent' ? 'permanent' : 'portable';
    const [updatedKeys, setUpdatedKeys] = useState(new Set());
    const [photoPreviews, setPhotoPreviews] = useState({});

    const rawGroups = checklistConfig?.[ladderType] || [];
    // Jika tangga portabel terdiri dari 25 butir dalam 1 grup, kelompokkan menjadi 2 section tampilan (Struktur Fisik & Kebersihan/Posisi) selaras Gambar 6
    const groups = (ladderType === 'portable' && rawGroups.length === 1 && rawGroups[0]?.items?.length === 25)
        ? [
            {
                title: 'Struktur Fisik & Komponen Tangga',
                items: rawGroups[0].items.slice(0, 16),
            },
            {
                title: 'Kebersihan & posisi penggunaan',
                items: rawGroups[0].items.slice(16),
            },
        ]
        : rawGroups;

    const allItems = rawGroups.flatMap((g) => g.items || []);

    const previousReviewData = latestInspection?.review_data || {};
    const previousPhotos = latestInspection?.checklist?.photos || {};
    const previousRejectedCount = Object.values(previousReviewData).filter((v) => v?.decision === 'rejected').length;
    const previousApprovedCount = Object.values(previousReviewData).filter((v) => v?.decision === 'approved').length;

    // Untuk update tangga: butir yang sudah di-ACC sebelumnya otomatis diawali tercentang true.
    // Butir yang pernah di-reject atau belum ada keputusan diawali false agar PIC memperbaikinya.
    const initialChecklist = Object.fromEntries(
        allItems.map((item) => {
            const isApproved = previousReviewData[item.key]?.decision === 'approved';
            return [item.key, isApproved];
        })
    );

    const { data, setData, post, processing, errors } = useForm({
        status: 'unsafe',
        inspection_type: ladderType,
        return_to: redirectTarget,
        checklist: initialChecklist,
        checklist_comments: {},
        photos: {},
        notes: '',
        updated_keys: [],
    });

    const submit = (e) => {
        e.preventDefault();

        const activeChecklist = {};
        allItems.forEach((item) => {
            activeChecklist[item.key] = data.checklist[item.key] ? 1 : 0;
        });

        post(route('inspections.store', ladder.uuid), {
            forceFormData: true,
            data: {
                ...data,
                checklist: activeChecklist,
                updated_keys: Array.from(updatedKeys),
            },
        });
    };

    const toggleChecklist = (key) => {
        setData('checklist', { ...data.checklist, [key]: !data.checklist[key] });
        setUpdatedKeys((prev) => new Set(prev).add(key));
    };

    const checkAllInGroup = (groupItems) => {
        const updated = { ...data.checklist };
        groupItems.forEach((item) => {
            updated[item.key] = true;
        });
        setData('checklist', updated);
        setUpdatedKeys((prev) => {
            const next = new Set(prev);
            groupItems.forEach((i) => next.add(i.key));
            return next;
        });
    };

    const setChecklistPhoto = (key, file) => {
        setData('photos', { ...data.photos, [key]: file });
        setUpdatedKeys((prev) => new Set(prev).add(key));
        if (file) {
            setPhotoPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const setChecklistComment = (key, comment) => {
        setData('checklist_comments', { ...data.checklist_comments, [key]: comment });
        setUpdatedKeys((prev) => new Set(prev).add(key));
    };

    const itemHasPhoto = (key) => Boolean(data.photos[key] || previousPhotos[key]);

    const totalItems = allItems.length;
    const checkedItems = allItems.filter((item) => data.checklist[item.key] === true);
    const checkedCount = checkedItems.length;
    const checkedWithPhotoCount = checkedItems.filter((item) => itemHasPhoto(item.key)).length;
    const allCheckedHavePhotos = checkedCount > 0 && checkedWithPhotoCount === checkedCount;

    const isFirstTime = !latestInspection;

    // canSubmit:
    // Pendaftaran pertama: semua butir dicentang DAN semua butir ada fotonya.
    // Update berkala: minimal 1 butir dicentang DAN semua butir yang dicentang wajib memiliki foto.
    const canSubmit = isFirstTime
        ? (checkedCount === totalItems && allCheckedHavePhotos)
        : (checkedCount > 0 && allCheckedHavePhotos);

    const assetTitle = ladder.identifier || `${ladder.type === 'permanent' ? 'Permanent' : 'Portable'} - ${ladder.location}`;

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Data Aset', href: route('ladders.index') },
                { label: ladder.location || 'Detail Aset', href: route('ladders.show', ladder.uuid) },
                { label: 'Formulir Inspeksi' },
            ]}
        >
            <Head title={`Form Inspeksi - ${ladder.location}`} />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* Page Title & Subtitle dengan Tombol Kembali Modern */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={backHref}
                            className="sl-btn-back"
                            title="Kembali"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Formulir Inspeksi Tangga
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                {assetTitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Inspeksi Sebelumnya Jika Ada */}
                {latestInspection && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Status Inspeksi Terakhir:</span>
                            <span className="text-slate-600 font-normal">
                                {new Date(latestInspection.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {previousApprovedCount > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {previousApprovedCount} Butir Sudah Di-ACC
                                </span>
                            )}
                            {previousRejectedCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-800 border border-rose-200">
                                    <XCircle className="w-3.5 h-3.5" /> {previousRejectedCount} Butir Ditolak (Perlu Diperbaiki)
                                </span>
                            ) : (
                                previousApprovedCount === 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1 font-bold text-slate-700 border border-slate-200">
                                        Pemeriksaan Rutin Baru
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Progress Summary Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Progres: {checkedCount} / {totalItems} Checklist · {checkedWithPhotoCount} / {checkedCount || 0} Foto Diunggah
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Centang butir pemeriksaan yang memenuhi standar dan <span className="font-bold text-rose-600">wajib lampirkan foto dokumentasi</span> untuk setiap butir yang diperiksa.
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
                            style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* DAFTAR CHECKLIST PER KELOMPOK */}
                    {groups.map((group, groupIdx) => {
                        const groupItems = group.items || [];
                        const groupCheckedCount = groupItems.filter((i) => data.checklist[i.key]).length;
                        const groupPhotosCount = groupItems.filter((i) => data.checklist[i.key] && itemHasPhoto(i.key)).length;

                        return (
                            <div key={groupIdx} className="space-y-4">
                                {/* Navy Category Banner */}
                                <div className="rounded-2xl bg-[#0f172a] p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                                            {group.title}
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-300">
                                            {groupItems.length > 0 && `Butir ${groupItems[0]?.label?.split('.')[0] || '1'}-${groupItems[groupItems.length - 1]?.label?.split('.')[0] || groupItems.length} • `}
                                            Lengkapi bukti foto untuk setiap butir yang diperiksa.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-semibold text-slate-300">
                                            {groupPhotosCount}/{groupCheckedCount} foto terunggah
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => checkAllInGroup(groupItems)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer"
                                        >
                                            <CheckSquare className="w-3.5 h-3.5" /> Centang Semua
                                        </button>
                                    </div>
                                </div>

                                {/* Checklist Items Grid (2 Kolom Card) */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {groupItems.map((item) => {
                                        const isChecked = data.checklist[item.key] === true;
                                        const hasPhoto = itemHasPhoto(item.key);
                                        const prevDecision = previousReviewData[item.key]?.decision;
                                        const prevComment = previousReviewData[item.key]?.comment;

                                        return (
                                            <div
                                                key={item.key}
                                                onClick={() => toggleChecklist(item.key)}
                                                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                                                    isChecked
                                                        ? 'border-slate-400 bg-white shadow-xs'
                                                        : prevDecision === 'rejected'
                                                        ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                {/* Top Row: Label & Circle Checkbox */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1 flex-1">
                                                        <span className={`text-xs sm:text-sm leading-relaxed block ${
                                                            isChecked ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                                                        }`}>
                                                            {item.label}
                                                        </span>

                                                        {/* Previous Review Feedback */}
                                                        {prevDecision === 'approved' && (
                                                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah di-ACC pada inspeksi sebelumnya
                                                            </span>
                                                        )}
                                                        {prevDecision === 'rejected' && (
                                                            <div className="inline-flex flex-col gap-0.5 rounded bg-rose-50 p-1.5 text-[10px] text-rose-800 border border-rose-200 font-semibold">
                                                                <span className="flex items-center gap-1 font-bold text-rose-900">
                                                                    <XCircle className="w-3 h-3 text-rose-600" /> Ditolak sebelumnya (Perlu Diperbaiki)
                                                                </span>
                                                                {prevComment && <span>Remark: "{prevComment}"</span>}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Custom Circular Indicator */}
                                                    <div className="shrink-0 mt-0.5">
                                                        {isChecked ? (
                                                            <div className="w-5 h-5 rounded-full border-2 border-[#0f172a] bg-[#0f172a] flex items-center justify-center text-white shadow-xs">
                                                                <Check className="w-3 h-3 stroke-[3]" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400 transition" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Upload Foto & Komentar Input */}
                                                <div
                                                    className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition max-w-[210px] truncate ${
                                                            hasPhoto
                                                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                                                : isChecked
                                                                ? 'border-dashed border-rose-300 bg-rose-50/60 text-rose-700 hover:border-rose-400'
                                                                : 'border-dashed border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                                        }`}>
                                                            <Camera className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">
                                                                {data.photos[item.key]?.name
                                                                    ? data.photos[item.key].name
                                                                    : (previousPhotos[item.key] ? '✓ Foto Tersimpan' : 'Upload Foto Wajib *')}
                                                            </span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={(e) => setChecklistPhoto(item.key, e.target.files[0])}
                                                            />
                                                        </label>

                                                        {photoPreviews[item.key] && (
                                                            <img
                                                                src={photoPreviews[item.key]}
                                                                alt="Preview"
                                                                className="h-6 w-8 object-cover rounded border border-emerald-300 shadow-2xs"
                                                            />
                                                        )}
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={data.checklist_comments[item.key] || ''}
                                                        onChange={(e) => setChecklistComment(item.key, e.target.value)}
                                                        placeholder="Komentar (opsional)..."
                                                        className="flex-1 min-w-[130px] rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-[#0f172a] focus:outline-none"
                                                    />
                                                </div>

                                                {/* Alert Foto Belum Ada */}
                                                {isChecked && !hasPhoto && (
                                                    <p className="mt-2 text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                                                        * Foto dokumentasi wajib diunggah untuk butir ini
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {errors.checklist && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                            {errors.checklist}
                        </div>
                    )}

                    {/* Section: Penilaian Resmi Kelaikan Fisik K3 */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-5 shadow-xs">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            PENILAIAN RESMI KELAIKAN FISIK K3
                        </h4>
                        <p className="mt-1 text-xs text-slate-600">
                            Hasil akhir status tangga (Aman / Tidak Aman) diputuskan secara resmi oleh Inspektor EHS pada tahap Review.
                        </p>
                    </div>

                    {/* Section: Catatan & Temuan Tambahan (Remarks) */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            CATATAN & TEMUAN TAMBAHAN (REMARKS)
                        </h4>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none"
                            placeholder="Ketik catatan khusus temuan lapangan (opsional)..."
                        />
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-xs text-slate-500">
                            Foto dokumentasi wajib untuk setiap butir yang Anda periksa.
                        </p>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Link
                                href={backHref}
                                className="sl-btn-back text-xs"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing || !canSubmit}
                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold shadow-md transition cursor-pointer active:scale-95 ${
                                    canSubmit && !processing
                                        ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {processing ? 'Menyimpan & Mengirim...' : (isFirstTime ? 'Simpan & Kirim ke Inspektor' : 'Simpan Pembaruan Item')}
                            </button>
                        </div>
                    </div>

                </form>

            </div>
        </AuthenticatedLayout>
    );
}
