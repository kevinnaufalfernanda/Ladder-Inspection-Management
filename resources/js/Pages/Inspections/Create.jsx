import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2, Circle, Camera, CheckSquare, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Create({ ladder, checklistConfig, latestInspection }) {
    const returnTo = new URLSearchParams(window.location.search).get('return_to');
    const redirectTarget = returnTo === 'detail' ? 'detail' : 'dashboard';
    const backHref = redirectTarget === 'detail' ? route('ladders.show', ladder.uuid) : route('dashboard');

    const defaultType = ladder.type === 'permanent' ? 'permanent' : 'portable';
    const [currentType, setCurrentType] = useState(defaultType);
    const [updatedKeys, setUpdatedKeys] = useState(new Set());

    const groups = checklistConfig?.[currentType] || [];
    const allItems = groups.flatMap((g) => g.items || []);

    const previousReviewData = latestInspection?.review_data || {};
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
        status: 'safe',
        inspection_type: defaultType,
        return_to: redirectTarget,
        checklist: initialChecklist,
        checklist_comments: {},
        photos: {},
        notes: '',
        updated_keys: [],
    });

    const submit = (e) => {
        e.preventDefault();

        // Kirim checklist hanya untuk item tipe yang sedang aktif
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
    };

    const setChecklistComment = (key, comment) => {
        setData('checklist_comments', { ...data.checklist_comments, [key]: comment });
        setUpdatedKeys((prev) => new Set(prev).add(key));
    };

    const changeType = (newType) => {
        setCurrentType(newType);
        const newGroups = checklistConfig?.[newType] || [];
        const newItems = newGroups.flatMap((g) => g.items || []);

        setData({
            ...data,
            inspection_type: newType,
            checklist: Object.fromEntries(newItems.map((item) => [item.key, false])),
            checklist_comments: {},
            photos: {},
        });
    };

    const totalItems = allItems.length;
    const checkedCount = allItems.filter((item) => data.checklist[item.key] === true).length;
    const isFirstTime = !latestInspection;

    // Jika pertama kali, wajib isi semua (55/55 atau 25/25).
    // Jika update / perbaikan berkala, boleh simpan per butir (minimal 1 item yang diupdate).
    const canSubmit = isFirstTime ? (totalItems > 0 && checkedCount === totalItems) : checkedCount > 0;

    return (
        <div className="k3-shell min-h-screen py-8 font-sans">
            <Head title={`Form Inspeksi - ${ladder.location}`} />

            <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                {/* Banner Header */}
                <div className="relative overflow-hidden rounded-[26px] bg-[var(--k3-navy)] p-6 text-white shadow-[0_18px_45px_rgba(22,37,31,0.14)] sm:p-8">
                    <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full border-[18px] border-[var(--k3-accent)]/20" />
                    <div className="relative mb-6 flex items-center justify-between">
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--k3-accent)] text-[var(--k3-navy)]">
                                <ShieldCheck className="h-4 w-4 text-[var(--k3-navy)]" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-accent)]">EHS Standard Form</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--k3-accent)]">
                            {currentType === 'portable'
                                ? 'F-GRK/EHS-810-24-012 · Inspeksi Tangga Portable'
                                : 'Form Inspeksi Tangga Tetap & Fall Arrest System'}
                        </p>
                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{ladder.identifier || ladder.location}</h2>
                        <p className="mt-2 text-sm text-slate-300">
                            Lokasi: <span className="text-white font-semibold">{ladder.location}</span> · Beban Maks: <span className="text-white font-semibold">{ladder.max_load || '-'} Kg</span> · Inspektor: <span className="text-[var(--k3-accent)] font-semibold">{ladder.inspector?.name || 'Belum ditugaskan'}</span>
                        </p>
                    </div>
                </div>

                {/* BANNER STATUS RIWAYAT SEBELUMNYA (JIKA ADA ITEM REJECT/ACC SEBELUMNYA) */}
                {latestInspection && (
                    <div className="k3-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 font-bold text-[var(--k3-navy)]">
                            <Clock className="w-4 h-4 text-[var(--k3-brand)]" />
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

                <form onSubmit={submit} className="space-y-6">

                    {/* Progress Bar & Selector */}
                    <div className="rounded-2xl border border-[var(--k3-line)] bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Progres Checklist: {checkedCount} / {totalItems} Butir Terpenuhi
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Centang butir pemeriksaan yang sesuai standar kondisi Good (G).
                                </p>
                            </div>

                            {/* Pilihan Jenis Tangga */}
                            <div className="flex rounded-xl bg-[var(--k3-bg)] p-1 border border-[var(--k3-line)]">
                                <button
                                    type="button"
                                    onClick={() => changeType('portable')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                        currentType === 'portable'
                                            ? 'bg-white text-[var(--k3-navy)] shadow-sm'
                                            : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                                    }`}
                                >
                                    Tangga Portabel (25 Item)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeType('permanent')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                        currentType === 'permanent'
                                            ? 'bg-white text-[var(--k3-navy)] shadow-sm'
                                            : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                                    }`}
                                >
                                    Tangga Tetap (5 Kategori)
                                </button>
                            </div>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-[var(--k3-brand)] transition-all duration-300"
                                style={{ width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* DAFTAR CHECKLIST RESMI */}
                    {groups.map((group, groupIdx) => (
                        <div key={groupIdx} className="rounded-[24px] border border-[var(--k3-line)] bg-white p-5 sm:p-7 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--k3-navy)]">
                                    {group.title}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => checkAllInGroup(group.items)}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--k3-brand)] hover:text-[var(--k3-brand-strong)] transition"
                                >
                                    <CheckSquare className="w-3.5 h-3.5" /> Centang Semua di Bagian Ini
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {group.items.map((item) => {
                                    const isChecked = data.checklist[item.key] === true;
                                    const hasPhoto = Boolean(data.photos[item.key]);

                                    // Status inspeksi sebelumnya jika ada
                                    const prevDecision = previousReviewData[item.key]?.decision;
                                    const prevComment = previousReviewData[item.key]?.comment;

                                    return (
                                        <div
                                            key={item.key}
                                            onClick={() => toggleChecklist(item.key)}
                                            className={`rounded-2xl border-2 p-3.5 transition-all cursor-pointer ${
                                                isChecked
                                                    ? 'border-[var(--k3-brand)] bg-[var(--k3-accent-soft)]/40'
                                                    : prevDecision === 'rejected'
                                                    ? 'border-rose-300 bg-rose-50/50 hover:border-rose-400'
                                                    : 'border-[var(--k3-line)] bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2.5">
                                                <div className="space-y-1">
                                                    <span className={`text-xs sm:text-sm leading-relaxed block ${isChecked ? 'font-bold text-[var(--k3-brand-strong)]' : 'font-medium text-slate-700'}`}>
                                                        {item.label}
                                                    </span>

                                                    {/* TAG STATUS HASIL INSPEKSI SEBELUMNYA */}
                                                    {prevDecision === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah di-ACC pada inspeksi sebelumnya
                                                        </span>
                                                    )}
                                                    {prevDecision === 'rejected' && (
                                                        <div className="inline-flex flex-col gap-0.5 rounded bg-rose-50 p-1.5 text-[10px] text-rose-800 border border-rose-200 font-semibold">
                                                            <span className="flex items-center gap-1 font-bold text-rose-900">
                                                                <XCircle className="w-3 h-3 text-rose-600" /> Ditolak pada inspeksi sebelumnya (Perlu Diperbaiki)
                                                            </span>
                                                            {prevComment && <span>Remark: "{prevComment}"</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {isChecked ? (
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--k3-brand)]" />
                                                ) : (
                                                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                                                )}
                                            </div>

                                            {/* Foto Dokumentasi */}
                                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                                <label className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition max-w-[200px] truncate ${
                                                    hasPhoto
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                        : 'border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:border-[var(--k3-brand)]'
                                                }`}>
                                                    <Camera className="h-3.5 w-3.5 shrink-0 text-[var(--k3-brand)]" />
                                                    <span className="truncate">{data.photos[item.key]?.name || 'Foto item (opsional)'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={(e) => setChecklistPhoto(item.key, e.target.files[0])}
                                                    />
                                                </label>

                                                <input
                                                    type="text"
                                                    value={data.checklist_comments[item.key] || ''}
                                                    onChange={(e) => setChecklistComment(item.key, e.target.value)}
                                                    placeholder="Komentar..."
                                                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:border-[var(--k3-brand)] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {errors.checklist && <p className="text-xs font-bold text-rose-600">{errors.checklist}</p>}

                    {/* Informasi Keputusan Resmi Inspektor */}
                    <div className="rounded-[24px] border border-[var(--k3-line)] bg-slate-50/80 p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--k3-navy)] text-[var(--k3-accent)] shrink-0 shadow-xs">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--k3-navy)]">
                                    Penilaian Resmi Kelaikan Fisik K3
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Hasil akhir status tangga (Aman / Tidak Aman) dinilai dan diputuskan secara resmi oleh Inspektor EHS pada tahap Review.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Tambahan */}
                    <div className="rounded-[24px] border border-[var(--k3-line)] bg-white p-5 sm:p-7 shadow-sm">
                        <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-[var(--k3-navy)]">
                            Catatan & Temuan Tambahan (Remarks)
                        </h3>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full resize-none rounded-xl border border-slate-200 bg-[var(--k3-surface)] p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none"
                            placeholder="Ketik catatan khusus temuan lapangan (Opsional)..."
                        />
                    </div>

                    {/* Tombol Simpan */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <p className="text-xs text-[var(--k3-muted)]">
                            {isFirstTime ? (
                                canSubmit
                                    ? '✓ Seluruh butir checklist terpenuhi untuk inspeksi pertama kali. Siap dikirim ke Inspektor.'
                                    : `Pendaftaran pertama kali: Lengkapi seluruh checklist (${checkedCount}/${totalItems}) agar formulir dapat disimpan.`
                            ) : (
                                canSubmit
                                    ? `✓ ${checkedCount} item dipilih untuk diperbarui. Siap dikirim ke Inspektor.`
                                    : 'Pilih minimal satu butir checklist yang ingin Anda perbarui.'
                            )}
                        </p>
                        <button
                            type="submit"
                            disabled={processing || !canSubmit}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--k3-navy)] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[var(--k3-brand-strong)] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                        >
                            {processing ? 'Menyimpan & Mengirim...' : (isFirstTime ? 'Simpan & Kirim ke Inspektor' : 'Simpan Pembaruan Item')}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}
