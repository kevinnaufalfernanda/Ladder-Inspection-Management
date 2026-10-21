import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, XCircle, AlertTriangle, QrCode, Printer, X, Filter } from 'lucide-react';

export default function Index({ ladders = [] }) {
    const [qrModal, setQrModal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    const getStatus = (ladder) => {
        const latest = ladder.latest_inspection;
        if (!latest) return 'none';
        if (latest.status === 'unsafe') return 'unsafe';
        if (new Date(latest.valid_until) <= new Date()) return 'expired';
        return 'safe';
    };

    // Filter data tangga berdasarkan pilihan tombol filter
    const filteredLadders = ladders.filter((ladder) => {
        const status = getStatus(ladder);
        if (filterStatus === 'all') return true;
        return status === filterStatus;
    });

    const statusBadge = {
        safe: <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"><ShieldCheck className="h-3 w-3" />Aman</span>,
        expired: <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700"><AlertTriangle className="h-3 w-3" />Kadaluarsa</span>,
        unsafe: <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-700"><XCircle className="h-3 w-3" />Tidak Aman</span>,
        none: <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">Belum Ada</span>,
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Aset Tangga" />
            
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <span>Filter Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all', label: 'Semua' },
                            { key: 'safe', label: 'Aman' },
                            { key: 'unsafe', label: 'Tidak Aman' },
                            { key: 'expired', label: 'Kadaluarsa' },
                            { key: 'none', label: 'Belum Inspeksi' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilterStatus(item.key)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    filterStatus === item.key
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabel Data Aset */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Informasi Aset</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">QR Code</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLadders.map((ladder) => (
                                    <tr key={ladder.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{ladder.location}</p>
                                            <p className="text-sm text-slate-500">{ladder.type}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">ID: {ladder.uuid.split('-')[0]}</p>
                                        </td>
                                        <td className="px-6 py-4">{statusBadge[getStatus(ladder)]}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setQrModal(ladder)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </button>
                                        </td>
                                        {/* Class relative pada td dihapus agar link tidak terhalang */}
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('ladders.show', ladder.uuid)} 
                                                className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 cursor-pointer"
                                            >
                                                Detail →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredLadders.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500">
                                            Tidak ada data tangga dengan status tersebut.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* QR Modal */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <h4 className="font-bold text-slate-900">QR Code Tangga</h4>
                            <button
                                onClick={() => setQrModal(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <div className="mb-5 flex justify-center rounded-xl border border-slate-100 bg-white p-4 shadow-inner">
                                <QRCodeSVG value={route('ladders.show', qrModal.uuid)} size={180} />
                            </div>
                            <p className="font-bold text-slate-900">{qrModal.location}</p>
                            <p className="mt-0.5 text-sm text-slate-500">{qrModal.type}</p>
                            <button
                                onClick={() => window.print()}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Printer className="h-4 w-4" /> Print Label QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}