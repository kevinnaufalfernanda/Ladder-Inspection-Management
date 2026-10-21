import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, History as HistoryIcon, Trash2, AlertCircle } from 'lucide-react';

export default function History({ inspections = [] }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [selectedInspectionId, setSelectedInspectionId] = useState(null);
    const { delete: destroy, processing } = useForm();

    const getStatusBadge = (status, validUntil) => {
        if (status === 'unsafe') return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-700"><XCircle className="h-3 w-3" /> Tidak Aman</span>;
        if (new Date(validUntil) <= new Date()) return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700"><AlertTriangle className="h-3 w-3" /> Kadaluarsa</span>;
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"><ShieldCheck className="h-3 w-3" /> Aman</span>;
    };

    const confirmDelete = (id) => {
        setSelectedInspectionId(id);
        setConfirmingDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDeletion(false);
        setSelectedInspectionId(null);
    };

    const deleteInspection = (e) => {
        e.preventDefault();
        destroy(route('inspections.destroy', selectedInspectionId), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Inspeksi" />

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Judul */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <HistoryIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Log Aktivitas K3</p>
                            <h1 className="text-xl font-bold text-slate-900">Riwayat Inspeksi Seluruh Aset</h1>
                        </div>
                    </div>
                </div>

                {/* Tabel Riwayat */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Lokasi / Aset</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status K3</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Inspektor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pemeriksaan</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inspections.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{item.ladder?.location || 'Aset Dihapus'}</p>
                                            <p className="text-xs text-slate-500">{item.ladder?.type || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status, item.valid_until)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {item.inspector?.name || 'Administrator'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {item.ladder && (
                                                <Link
                                                    href={route('ladders.show', item.ladder.uuid)}
                                                    className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                >
                                                    Detail Aset →
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => confirmDelete(item.id)}
                                                className="inline-flex items-center rounded-lg bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 cursor-pointer"
                                                title="Hapus Riwayat"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {inspections.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">
                                            Belum ada riwayat inspeksi yang tercatat dalam sistem.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Konfirmasi Hapus */}
                {confirmingDeletion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
                            <div className="flex items-center gap-3 text-rose-600">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Riwayat</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Apakah Anda yakin ingin menghapus data riwayat inspeksi ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                            </p>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={deleteInspection}
                                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}