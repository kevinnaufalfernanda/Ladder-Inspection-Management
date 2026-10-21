import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, ArrowLeft, Calendar, User, FileText, PenTool, History, Trash2, AlertCircle } from 'lucide-react';

export default function Show({ ladder, latestInspection }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const { delete: destroy, processing } = useForm();

    const inspectionHistory = ladder.inspections || [];

    const getStatusBadge = (inspection) => {
        if (!inspection) return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase">Belum Ada Inspeksi</span>;
        if (inspection.status === 'unsafe') return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 uppercase"><XCircle className="h-4 w-4" /> Tidak Aman</span>;
        if (new Date(inspection.valid_until) <= new Date()) return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"><AlertTriangle className="h-4 w-4" /> Kadaluarsa</span>;
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Aman</span>;
    };

    const deleteLadder = (e) => {
        e.preventDefault();
        destroy(route('ladders.destroy', ladder.uuid), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Aset - ${ladder.location}`} />

            <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
                
                {/* Tombol Navigasi Atas & Aksi */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Link
                        href={route('ladders.index')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Data Aset
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('inspections.create', ladder.uuid)}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 cursor-pointer"
                        >
                            <PenTool className="h-4 w-4" /> Perbarui Status Inspeksi
                        </Link>
                        
                        <button
                            type="button"
                            onClick={() => setConfirmingDeletion(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 shadow-sm transition hover:bg-rose-100 cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus Aset
                        </button>
                    </div>
                </div>

                {/* Grid Informasi Utama & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Kartu Spesifikasi Utama */}
                    <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Informasi Teknis Aset</p>
                                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{ladder.location}</h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {ladder.type}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-1">
                            <div>
                                <p className="text-slate-500 font-medium">UUID Sistem:</p>
                                <p className="font-mono text-xs text-slate-600 mt-0.5 bg-slate-50 p-2 rounded border border-slate-100 select-all">{ladder.uuid}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-medium">Deskripsi / Catatan Lokasi:</p>
                                <p className="text-slate-800 mt-0.5">{ladder.description || 'Tidak ada deskripsi tambahan.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Status K3 */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status K3 Terkini</p>
                            <div className="mt-3 flex items-center justify-center py-4">
                                {getStatusBadge(latestInspection)}
                            </div>
                        </div>
                        {latestInspection?.valid_until && (
                            <div className="border-t border-slate-100 pt-3 text-center">
                                <span className="text-xs text-slate-500">Masa Berlaku hingga:</span>
                                <p className="text-sm font-bold text-slate-800">{new Date(latestInspection.valid_until).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Detail Inspektor & Catatan Terakhir */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Terakhir</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">Laporan Pemeriksaan K3</h3>
                    </div>

                    {latestInspection ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm text-slate-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Petugas Inspeksi</p>
                                    <p className="font-bold text-slate-800">{latestInspection.inspector?.name || 'Administrator'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm text-slate-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Waktu Pemeriksaan</p>
                                    <p className="font-bold text-slate-800">{new Date(latestInspection.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                </div>
                            </div>

                            {latestInspection.notes && (
                                <div className="sm:col-span-2 mt-1 rounded-lg bg-slate-50 p-4 border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> Catatan Temuan Lapangan
                                    </p>
                                    <p className="text-slate-700 text-sm leading-relaxed">{latestInspection.notes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 italic text-sm">
                            Belum ada riwayat inspeksi yang tercatat untuk aset tangga ini. Silakan lakukan inspeksi pertama.
                        </div>
                    )}
                </div>

                {/* Modal Konfirmasi Hapus Aset */}
                {confirmingDeletion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3 text-rose-600">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Aset</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus aset tangga <strong className="text-slate-800">{ladder.location}</strong> ini karena dibongkar atau tidak digunakan? Tindakan ini akan menghapus seluruh data dan riwayat inspeksinya secara permanen.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDeletion(false)}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={deleteLadder}
                                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Menghapus...' : 'Ya, Hapus Aset'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}