import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Clock,
    Camera,
    AlertCircle,
    Send,
} from 'lucide-react';
import { useState } from 'react';

export default function Correction({ inspection }) {
    const { data, setData, post, processing, errors } = useForm({
        photos: {},
        comments: {},
    });

    const [previews, setPreviews] = useState({});

    const handlePhotoChange = (key, file) => {
        setData('photos', { ...data.photos, [key]: file });
        if (file) {
            setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('inspections.correction.store', inspection.id), {
            forceFormData: true,
        });
    };

    const ladder = inspection.ladder || {};
    const items = inspection.items || [];
    const uploadedCount = items.filter((item) => data.photos[item.key]).length;
    const hasAllPhotos = items.length > 0 && items.every((item) => data.photos[item.key]);

    const backHref = ladder.uuid ? route('ladders.show', ladder.uuid) : route('dashboard');
    const assetTitle = ladder.identifier || `${ladder.type === 'permanent' ? 'Permanent' : 'Portable'} - ${ladder.location}`;

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Data Aset', href: route('ladders.index') },
                { label: ladder.location || 'Detail Aset', href: ladder.uuid ? route('ladders.show', ladder.uuid) : route('dashboard') },
                { label: 'Perbaikan Aset' },
            ]}
        >
            <Head title={`Perbaiki Item Reject - ${ladder.location}`} />

            <div className="mx-auto max-w-7xl space-y-6">

                {/* Page Title & Back Button */}
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
                                Perbaikan Temuan Item Reject
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                {assetTitle} • Tindak lanjut perbaikan fisik K3 di lapangan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Ringkasan */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Tanggal Temuan:</span>
                        <span className="text-slate-600 font-normal">
                            {inspection.created_at ? new Date(inspection.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {inspection.previously_approved_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {inspection.previously_approved_count} Butir Sudah Di-ACC (Tersimpan)
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> {items.length} Butir Ditolak (Perlu Diperbaiki)
                        </span>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Progress Bar Dokumentasi Perbaikan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Progres Dokumentasi: {uploadedCount} / {items.length} Foto Bukti Diunggah
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Lakukan perbaikan fisik di lapangan, lalu unggah foto bukti perbaikan dan catatan untuk setiap butir yang ditolak.
                                </p>
                            </div>
                            {hasAllPhotos ? (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Semua Bukti Lengkap
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 border border-rose-200">
                                    <XCircle className="w-4 h-4 text-rose-600" /> {items.length - uploadedCount} Foto Belum Diunggah
                                </span>
                            )}
                        </div>

                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full bg-[#f59e0b] transition-all duration-300"
                                style={{ width: `${items.length ? (uploadedCount / items.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    {/* DAFTAR BUTIR REJECT KHUSUS PERBAIKAN */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                Butir Checklist yang Ditolak ({items.length} Item)
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Hanya butir-butir temuan ini yang perlu Anda perbaiki fisiknya dan lampirkan bukti foto terbarunya.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {items.map((item) => {
                                const hasPhoto = Boolean(data.photos[item.key]);
                                const previewUrl = previews[item.key];

                                return (
                                    <div
                                        key={item.key}
                                        className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                                            hasPhoto
                                                ? 'border-emerald-400 bg-emerald-50/20'
                                                : 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                                        }`}
                                    >
                                        <div className="space-y-2.5">
                                            <div className="flex items-start justify-between gap-2.5">
                                                <span className="text-sm font-bold text-slate-900 leading-snug">
                                                    {item.label}
                                                </span>
                                                <span className="shrink-0 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                                                    REJECT
                                                </span>
                                            </div>

                                            {/* Remark / Catatan Reject dari Inspektor */}
                                            <div className="rounded-xl bg-rose-100/70 border border-rose-200 p-2.5 text-xs text-rose-900">
                                                <p className="font-bold flex items-center gap-1 text-[11px] mb-0.5 text-rose-950">
                                                    <AlertCircle className="h-3.5 w-3.5 text-rose-700 shrink-0" />
                                                    Catatan / Temuan Inspektor:
                                                </p>
                                                <p className="font-semibold italic text-rose-900 pl-4">
                                                    "{item.comment || 'Item tidak memenuhi standar kelayakan fisik, perlu dilakukan perbaikan.'}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Upload Foto Bukti & Komentar Tindak Lanjut */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                                                    Unggah Foto Bukti Perbaikan <span className="text-rose-600">*</span>
                                                </label>
                                                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition ${
                                                    hasPhoto
                                                        ? 'border-emerald-500 bg-white text-emerald-800 shadow-xs'
                                                        : 'border-dashed border-rose-300 bg-white text-rose-700 hover:border-rose-500'
                                                }`}>
                                                    <Camera className="h-4 w-4 shrink-0" />
                                                    <span className="min-w-0 flex-1 truncate font-medium">
                                                        {data.photos[item.key]?.name || 'Pilih foto dokumentasi perbaikan...'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        required
                                                        className="sr-only"
                                                        onChange={(e) => handlePhotoChange(item.key, e.target.files[0])}
                                                    />
                                                </label>

                                                {/* Pratinjau Foto jika sudah dipilih */}
                                                {previewUrl && (
                                                    <div className="mt-2 flex items-center gap-3 rounded-xl bg-emerald-50 p-2 border border-emerald-200">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Bukti Perbaikan"
                                                            className="h-12 w-16 object-cover rounded-lg border border-emerald-300 shadow-xs shrink-0"
                                                        />
                                                        <span className="text-[11px] font-bold text-emerald-800">
                                                            ✓ Foto berhasil dimuat
                                                        </span>
                                                    </div>
                                                )}

                                                {errors[`photos.${item.key}`] && (
                                                    <p className="mt-1 text-xs font-semibold text-rose-600">
                                                        Foto bukti perbaikan wajib diunggah.
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                                                    Catatan / Tindak Lanjut PIC Safety (Opsional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.comments[item.key] || ''}
                                                    onChange={(e) => setData('comments', { ...data.comments, [item.key]: e.target.value })}
                                                    placeholder="Contoh: Telah diganti dengan baut baru & dibersihkan."
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0f172a] focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Bar Bagian Bawah */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div>
                            <p className="text-sm font-bold text-slate-900">
                                {hasAllPhotos ? 'Seluruh bukti foto perbaikan telah lengkap' : 'Lengkapi foto bukti perbaikan untuk semua butir'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Dokumen perbaikan akan otomatis dikirimkan ke antrean review Inspektor EHS.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={processing || !hasAllPhotos}
                            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition cursor-pointer active:scale-95 ${
                                hasAllPhotos && !processing
                                    ? 'bg-[#f59e0b] hover:bg-[#d97706] text-white'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Send className="w-4 h-4" />
                            {processing ? 'Mengirim ke Inspektor...' : 'Kirim Perbaikan ke Inspektor EHS'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
