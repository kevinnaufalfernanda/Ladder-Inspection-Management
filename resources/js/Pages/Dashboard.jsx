import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    QrCode, Printer, X, PlusCircle, XCircle, AlertTriangle,
    ShieldCheck, Camera, PenTool, AlertCircle
} from 'lucide-react';

export default function Dashboard({ ladders, auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        location: '',
        type: '',
        description: '',
    });

    const [qrModal, setQrModal] = useState(null);
    const [showGuide, setShowGuide] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('ladders.store'), { onSuccess: () => reset() });
    };

    const totalSafe = ladders.filter((l) => {
        const latest = l.latest_inspection;
        return latest?.status === 'safe' && new Date(latest.valid_until) > new Date();
    }).length;

    const totalUnsafe = ladders.filter((l) => {
        const latest = l.latest_inspection;
        return latest && latest.status === 'unsafe';
    }).length;

    const getStatus = (ladder) => {
        const latest = ladder.latest_inspection;
        if (!latest) return 'none';
        if (latest.status === 'unsafe') return 'unsafe';
        if (new Date(latest.valid_until) <= new Date()) return 'expired';
        return 'safe';
    };

    const statusBadge = {
        safe:    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"><ShieldCheck className="h-3 w-3" />Aman</span>,
        expired: <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700"><AlertTriangle className="h-3 w-3" />Kadaluarsa</span>,
        unsafe:  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-700"><XCircle className="h-3 w-3" />Tidak Aman</span>,
        none:    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">Belum</span>,
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Aset</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-slate-900">{ladders.length}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Aktif</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Aman</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-emerald-600">{totalSafe}</span>
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Valid</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Perlu Tindak Lanjut</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-rose-600">{totalUnsafe}</span>
                                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">Alert</span>
                            </div>
                        </div>
                    </div>

                    {/* Registrasi Form - Admin only */}
                    {auth?.user?.role === 'admin' && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Registrasi</p>
                                    <h3 className="text-lg font-bold text-slate-900">Tangga Baru</h3>
                                </div>

                                {/* Tombol Ikon Tanda Seru Panduan K3 di Pojok Kanan */}
                                <button
                                    onClick={() => setShowGuide(!showGuide)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 cursor-pointer shadow-sm"
                                    title="Panduan K3"
                                >
                                    <AlertCircle className="h-5 w-5 text-emerald-600" />
                                </button>
                            </div>

                            {/* Dropdown / Kotak Panduan K3 yang bisa dibuka-tutup */}
                            {showGuide && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 transition-all">
                                    <p className="mb-4 text-sm text-slate-600 font-medium">Ikuti 3 langkah mudah untuk menjaga keselamatan kerja di area operasional.</p>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {[
                                            { icon: PlusCircle, title: '1. Registrasi', text: 'Daftarkan aset tangga baru dan cetak QR code yang dihasilkan.' },
                                            { icon: Camera,     title: '2. Scan QR',    text: 'Tempelkan QR pada tangga untuk memudahkan inspeksi.' },
                                            { icon: PenTool,    title: '3. Inspeksi',   text: 'Isi checklist secara rutin agar status K3 selalu terupdate.' },
                                        ].map((item) => (
                                            <div key={item.title} className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
                                                <div className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                                                    <item.icon className="h-4 w-4 text-emerald-600" />
                                                    {item.title}
                                                </div>
                                                <p className="text-sm text-slate-600">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3 pt-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Lokasi</label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        placeholder="e.g. Gudang A - Rak 4"
                                        required
                                    />
                                    {errors.location && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.location}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tipe</label>
                                    <input
                                        type="text"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        placeholder="e.g. Step Ladder"
                                        required
                                    />
                                    {errors.type && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.type}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi <span className="font-normal text-slate-400">(Opsional)</span></label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                        placeholder="Keterangan tambahan..."
                                    />
                                </div>
                                <div className="sm:col-span-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Daftarkan Aset'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Daftar Aset */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Daftar Data</p>
                            <h3 className="text-lg font-bold text-slate-900">Aset Tangga</h3>
                        </div>

                        {/* Mobile view */}
                        <div className="divide-y divide-slate-100 md:hidden">
                            {ladders.map((ladder) => (
                                <div key={ladder.id} className="p-4">
                                    <div className="mb-3 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-900">{ladder.location}</p>
                                            <p className="text-sm text-slate-500">{ladder.type}</p>
                                        </div>
                                        {statusBadge[getStatus(ladder)]}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setQrModal(ladder)}
                                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                                        >
                                            <QrCode className="h-4 w-4" /> QR Code
                                        </button>
                                        <Link
                                            href={route('ladders.show', ladder.uuid)}
                                            className="flex flex-1 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                                        >
                                            Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Informasi Aset</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status Safety</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">QR Code</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ladders.map((ladder) => (
                                        <tr key={ladder.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{ladder.location}</p>
                                                <p className="text-xs text-slate-500">{ladder.type}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">ID: {ladder.uuid.split('-')[0]}</p>
                                            </td>
                                            <td className="px-6 py-4">{statusBadge[getStatus(ladder)]}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setQrModal(ladder)}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route('ladders.show', ladder.uuid)}
                                                    className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                                                >
                                                    Detail →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 cursor-pointer"
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
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
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