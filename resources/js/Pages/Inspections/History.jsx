import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, Trash2, AlertCircle, Filter, ChevronDown } from 'lucide-react';

export default function History({ inspections = [], filters = {} }) {
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [selectedInspectionId, setSelectedInspectionId] = useState(null);
    const [filterData, setFilterData] = useState({
        sort: filters.sort || 'latest',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });
    const { delete: destroy, processing } = useForm();

    const applyFilters = (e) => {
        e.preventDefault();
        router.get(route('inspections.history'), filterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const clearedFilters = { sort: 'latest', date_from: '', date_to: '' };
        setFilterData(clearedFilters);
        router.get(route('inspections.history'), clearedFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const hasActiveFilters = filterData.sort !== 'latest' || filterData.date_from || filterData.date_to;

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

            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
                
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Log aktivitas K3</p>
                        <h1 className="mt-1 text-xl font-semibold text-slate-900">Riwayat Inspeksi Seluruh Aset</h1>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="k3-card flex flex-wrap items-center justify-between gap-4 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Filter className="h-4 w-4 text-slate-500" />
                        Filter
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div>
                            <label htmlFor="sort" className="sr-only">Urutan</label>
                            <div className="relative">
                                <select
                                    id="sort"
                                    value={filterData.sort}
                                    onChange={(e) => setFilterData({ ...filterData, sort: e.target.value })}
                                    className="appearance-none rounded-xl border border-[var(--k3-line)] bg-[var(--k3-accent-soft)] py-2 pl-3 pr-8 text-sm font-medium text-[var(--k3-brand-strong)] outline-none transition focus:border-[var(--k3-brand)] focus:ring-2 focus:ring-[rgba(57,115,93,0.12)]"
                                >
                                    <option value="latest">Terbaru</option>
                                    <option value="oldest">Terlama</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--k3-brand)]" />
                            </div>
                        </div>
                        <label htmlFor="date_from" className="sr-only">Dari tanggal</label>
                        <input
                            id="date_from"
                            type="date"
                            value={filterData.date_from}
                            onChange={(e) => setFilterData({ ...filterData, date_from: e.target.value })}
                            className="rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[var(--k3-brand)] focus:bg-white focus:ring-2 focus:ring-[rgba(57,115,93,0.12)]"
                        />
                        <label htmlFor="date_to" className="sr-only">Sampai tanggal</label>
                        <input
                            id="date_to"
                            type="date"
                            value={filterData.date_to}
                            onChange={(e) => setFilterData({ ...filterData, date_to: e.target.value })}
                            className="rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[var(--k3-brand)] focus:bg-white focus:ring-2 focus:ring-[rgba(57,115,93,0.12)]"
                        />
                        <button type="submit" className="rounded-xl bg-[var(--k3-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--k3-brand-strong)]">Terapkan</button>
                        {hasActiveFilters && (
                            <button type="button" onClick={resetFilters} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Reset</button>
                        )}
                    </div>
                </form>

                <div className="k3-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-[var(--k3-line)] bg-[#f7f9f5]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-muted)]">Lokasi / Aset</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-muted)]">Status K3</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-muted)]">Inspektor</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-muted)]">Tanggal Pemeriksaan</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--k3-muted)]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inspections.map((item) => (
                                    <tr key={item.id} className="transition hover:bg-[#f7f9f5]">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{item.ladder?.location || 'Aset Dihapus'}</p>
                                            <p className="text-xs text-slate-500">{item.ladder?.type || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(item.status, item.valid_until)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.inspector?.name || 'Administrator'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                                        <td className="space-x-2 px-6 py-4 text-right">
                                            {item.ladder && (
                                                <Link href={route('ladders.show', item.ladder.uuid)} className="inline-flex items-center rounded-xl bg-[var(--k3-navy)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--k3-brand-strong)]">
                                                    Detail Aset →
                                                </Link>
                                            )}
                                            <button type="button" onClick={() => confirmDelete(item.id)} className="inline-flex items-center rounded-lg bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 cursor-pointer" title="Hapus Riwayat">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {inspections.length === 0 && (
                                    <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">Belum ada riwayat inspeksi yang tercatat dalam sistem.</td></tr>
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