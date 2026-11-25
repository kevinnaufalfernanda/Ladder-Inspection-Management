import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, ArrowRight, QrCode } from 'lucide-react';

export default function Index({ ladders = [] }) {
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatus = (ladder) => {
        const latest = ladder.latest_inspection;
        if (!latest) return 'none';
        if (latest.status === 'unsafe') return 'unsafe';
        if (new Date(latest.valid_until) <= new Date()) return 'expired';
        return 'safe';
    };

    const totalSafe = ladders.filter((l) => getStatus(l) === 'safe').length;
    const totalExpired = ladders.filter((l) => getStatus(l) === 'expired').length;
    const totalUnsafe = ladders.filter((l) => getStatus(l) === 'unsafe').length;
    const totalNone = ladders.filter((l) => getStatus(l) === 'none').length;
    const totalPermanent = ladders.filter((l) => l.type === 'permanent').length;
    const totalPortable = ladders.filter((l) => l.type === 'portable').length;

    const filteredLadders = ladders.filter((ladder) => {
        const status = getStatus(ladder);
        if (filterStatus === 'all') return true;
        if (filterStatus === 'safe') return status === 'safe';
        if (filterStatus === 'unsafe') return status === 'unsafe';
        if (filterStatus === 'expired') return status === 'expired';
        if (filterStatus === 'none') return status === 'none';
        return true;
    });

    const filterOptions = [
        { key: 'all', label: 'Semua' },
        { key: 'safe', label: 'Aman' },
        { key: 'unsafe', label: 'Tidak aman' },
        { key: 'expired', label: 'Kedaluwarsa' },
        { key: 'none', label: 'Belum inspeksi' },
    ];

    return (
        <AuthenticatedLayout breadcrumb="Data Aset">
            <Head title="Data Aset Tangga" />

            <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto">

                {/* Header Sesuai Gambar 2 */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Data Aset Tangga
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Kelola aset tangga dan pantau status kelayakannya.
                        </p>
                    </div>

                    <Link
                        href={route('ladders.create')}
                        className="sl-btn-primary flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah aset
                    </Link>
                </div>

                {/* Filter Status Sesuai Gambar 2 */}
                <div className="sl-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">Filter status</span>
                    <div className="flex flex-wrap gap-2">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => setFilterStatus(opt.key)}
                                className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                                    filterStatus === opt.key
                                        ? 'bg-[#0f172a] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid 2 Kolom Kartu Aset Sesuai Gambar 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredLadders.length === 0 ? (
                        <div className="col-span-2 sl-card p-12 text-center text-slate-400 text-xs">
                            Tidak ada data aset tangga pada filter ini.
                        </div>
                    ) : (
                        filteredLadders.map((ladder) => {
                            const status = getStatus(ladder);
                            const shortUuid = (ladder.uuid || '').split('-')[0] || ladder.id;

                            return (
                                <div
                                    key={ladder.id}
                                    className="sl-card p-6 flex flex-col justify-between space-y-4 hover:border-slate-300"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">
                                                    {ladder.location}
                                                </h3>
                                                <p className="text-xs text-slate-500 capitalize mt-0.5">
                                                    {ladder.type || 'Portable'}
                                                </p>
                                            </div>

                                            {/* Status Badge Sesuai Gambar 2 */}
                                            {status === 'safe' && (
                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                                                    ✓ Aman
                                                </span>
                                            )}
                                            {status === 'none' && (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                    Belum ada
                                                </span>
                                            )}
                                            {status === 'expired' && (
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100">
                                                    Kedaluwarsa
                                                </span>
                                            )}
                                            {status === 'unsafe' && (
                                                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 border border-rose-100">
                                                    Tidak aman
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom Info ID & Detail Button */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-mono">
                                            ID: {shortUuid}
                                        </span>

                                        <Link
                                            href={route('ladders.show', ladder.uuid)}
                                            className="group inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]"
                                        >
                                            <span>Detail</span>
                                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bar Ringkasan Bawah Sesuai Gambar 2 */}
                <div className="rounded-2xl bg-slate-100/80 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                    <div>
                        <strong className="text-slate-900">{ladders.length} aset terdaftar</strong>
                        <span className="ml-2 text-slate-500">
                            ({totalPermanent} tangga tetap • {totalPortable} tangga portabel)
                        </span>
                    </div>

                    <div className="font-semibold text-slate-700">
                        {totalSafe} aman & valid / {totalNone + totalExpired + totalUnsafe} belum diinspeksi atau perlu perbaikan
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
