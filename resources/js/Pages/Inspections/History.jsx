import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDown, Trash2, X } from 'lucide-react';

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
        if (status === 'unsafe') {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
                    Tidak aman
                </span>
            );
        }
        if (new Date(validUntil) <= new Date()) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                    Kedaluwarsa
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                ✓ Aman
            </span>
        );
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
        <AuthenticatedLayout breadcrumb="Riwayat Inspeksi">
            <Head title="Riwayat Inspeksi Seluruh Aset" />

            <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto">

                {/* Header Sesuai Gambar 4 */}
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                        Riwayat Inspeksi Seluruh Aset
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Telusuri hasil pemeriksaan dan keputusan keselamatan K3.
                    </p>
                </div>

                {/* Filter Box Sesuai Gambar 4 */}
                <form onSubmit={applyFilters} className="sl-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">Filter riwayat</span>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative">
                            <select
                                value={filterData.sort}
                                onChange={(e) => setFilterData({ ...filterData, sort: e.target.value })}
                                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-8 text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-500 transition cursor-pointer"
                            >
                                <option value="latest">Terbaru</option>
                                <option value="oldest">Terlama</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        </div>

                        <input
                            type="date"
                            value={filterData.date_from}
                            onChange={(e) => setFilterData({ ...filterData, date_from: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-500 transition"
                        />

                        <input
                            type="date"
                            value={filterData.date_to}
                            onChange={(e) => setFilterData({ ...filterData, date_to: e.target.value })}
                            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-amber-500 transition"
                        />

                        <button
                            type="submit"
                            className="sl-btn-primary cursor-pointer"
                        >
                            Terapkan
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>

                {/* Tabel Riwayat Sesuai Gambar 4 */}
                <div className="sl-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-3 px-6">LOKASI / ASET</th>
                                    <th className="py-3 px-4">STATUS K3</th>
                                    <th className="py-3 px-4">INSPEKTOR</th>
                                    <th className="py-3 px-4">TANGGAL PEMERIKSAAN</th>
                                    <th className="py-3 px-6 text-right">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inspections.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            Belum ada data riwayat inspeksi.
                                        </td>
                                    </tr>
                                ) : (
                                    inspections.map((inspection) => (
                                        <tr key={inspection.id} className="hover:bg-slate-50/70 transition">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-slate-900">
                                                    {inspection.ladder?.location || 'Lokasi tidak diketahui'}
                                                </p>
                                                <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                                                    {inspection.ladder?.type || 'Portable'}
                                                </p>
                                            </td>

                                            <td className="py-4 px-4">
                                                {getStatusBadge(inspection.status, inspection.valid_until)}
                                            </td>

                                            <td className="py-4 px-4 text-slate-700 font-medium">
                                                {inspection.inspector?.name || 'Inspektor EHS'}
                                            </td>

                                            <td className="py-4 px-4 text-slate-600">
                                                {new Date(inspection.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>

                                            <td className="py-4 px-6 text-right space-x-2">
                                                {inspection.ladder?.uuid && (
                                                    <Link
                                                        href={route('ladders.show', inspection.ladder.uuid)}
                                                        className="group inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]"
                                                    >
                                                        <span>Detail Aset</span>
                                                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
                        Menampilkan {inspections.length} hasil pemeriksaan
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
