import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle, Printer, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function Certificate({ ladder, inspection }) {
    const isApproved = inspection?.workflow_status === 'approved';
    const isSafe = inspection?.status === 'safe';
    const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/qr/${ladder.uuid}` : `/qr/${ladder.uuid}`;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 font-sans sm:px-6">
            <Head title={`Label & Sertifikat - ${ladder.identifier || ladder.location}`} />

            <main className="mx-auto max-w-3xl space-y-8">
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href={route('ladders.qr', ladder.uuid)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Pilihan QR
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition"
                    >
                        <Printer className="h-4 w-4" /> Cetak Label & Sertifikat
                    </button>
                </div>

                {/* --- 1. LABEL IDENTIFIKASI FISIK TANGGA (SIAP GANTUNG DI TANGGA) --- */}
                <div className="rounded-3xl border-4 border-slate-900 bg-white p-6 sm:p-8 shadow-xl print:shadow-none print:border-4">
                    <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-black tracking-widest text-slate-500 uppercase">PT Wilmar Nabati Indonesia</p>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">Label Identifikasi Tangga</h2>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                            isApproved && isSafe ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                            {isApproved ? 'INSPEKSI VALID' : 'MENUNGGU APPROVAL'}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ID Unik Tangga</p>
                                <p className="text-lg sm:text-xl font-black font-mono text-slate-900 bg-slate-100 p-2.5 rounded-xl border border-slate-200 mt-1 inline-block">
                                    {ladder.identifier || 'BELUM TERDAFTAR'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Jenis Tangga</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                                        {ladder.type === 'portable' ? 'Tangga Portabel (PLD)' : 'Tangga Tetap (FLD)'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Beban Maksimal</p>
                                    <p className="text-base font-black text-[var(--k3-navy)] mt-0.5">
                                        {ladder.max_load ? `${ladder.max_load} KG` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Lokasi / Area</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{ladder.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Inspektor Penanggung Jawab</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{inspection?.inspector?.name || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code Container */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center">
                            <QRCodeSVG value={qrUrl} size={150} level="H" />
                            <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scan untuk status K3</p>
                        </div>
                    </div>
                </div>

                {/* --- 2. SERTIFIKAT HASIL INSPEKSI --- */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                        Rincian Sertifikat Inspeksi
                    </h3>

                    {inspection ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {isApproved ? (
                                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-bold">
                                        <CheckCircle2 className="w-4 h-4" /> Telah Disetujui Inspektor EHS (Approved)
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-sm font-bold">
                                        <AlertTriangle className="w-4 h-4" /> Status: {inspection.workflow_status}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold">Tanggal Inspeksi</p>
                                    <p className="font-bold text-slate-900 mt-0.5">
                                        {new Date(inspection.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold">Masa Berlaku Hingga</p>
                                    <p className="font-bold text-slate-900 mt-0.5">
                                        {inspection.valid_until
                                            ? new Date(inspection.valid_until).toLocaleDateString('id-ID', { dateStyle: 'long' })
                                            : 'Menunggu approval'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-semibold">Inspektor EHS</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{inspection.inspector?.name || '-'}</p>
                                </div>
                            </div>

                            {inspection.notes && (
                                <div className="p-3 bg-white border border-slate-200 rounded-xl text-sm italic text-slate-700">
                                    Catatan: "{inspection.notes}"
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Belum ada hasil inspeksi yang tercatat untuk tangga ini.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
