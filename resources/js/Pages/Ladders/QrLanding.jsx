import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck, FileCheck2, ShieldCheck, Eye } from 'lucide-react';

export default function QrLanding({ ladder }) {
    return (
        <div className="k3-shell flex min-h-screen items-center justify-center px-4 py-8 font-sans">
            <Head title={`QR ${ladder.identifier || ladder.location}`} />
            
            <div className="w-full max-w-lg space-y-4">
                {/* Tombol Navigasi Kembali */}
                <div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
                    </Link>
                </div>

                <main className="w-full rounded-[26px] border border-[var(--k3-line)] bg-white p-6 shadow-[0_18px_45px_rgba(22,37,31,0.12)] sm:p-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="k3-brand-mark flex h-10 w-10 items-center justify-center rounded-xl">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--k3-brand)]">Ladder Inspection</p>
                                <p className="text-sm font-medium text-slate-500">PT Wilmar Nabati Indonesia</p>
                            </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                            {ladder.type === 'portable' ? 'Portabel' : 'Permanen'}
                        </span>
                    </div>

                    <div className="mt-5 border-b border-slate-100 pb-5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ID Unik Tangga</p>
                        <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 font-mono break-all">
                            {ladder.identifier || ladder.location}
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Lokasi: <span className="font-semibold text-slate-900">{ladder.location}</span>
                            {ladder.max_load && (
                                <> · Beban Maks: <span className="font-semibold text-slate-900">{ladder.max_load} KG</span></>
                            )}
                        </p>
                    </div>

                    <div className="mt-6 grid gap-3">
                        <Link
                            href={route('ladders.certificate', ladder.uuid)}
                            className="flex items-center gap-3 rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-4 py-3.5 text-sm font-bold text-[var(--k3-brand-strong)] transition hover:border-[var(--k3-brand)] hover:bg-[var(--k3-accent-soft)]"
                        >
                            <FileCheck2 className="h-5 w-5 text-[var(--k3-brand)] shrink-0" />
                            <div className="text-left">
                                <p className="font-bold">Sertifikat Hasil Inspeksi</p>
                                <p className="text-xs font-normal text-slate-500">Lihat status validitas K3 dan rincian label resmi</p>
                            </div>
                        </Link>

                        <Link
                            href={route('inspections.create', ladder.uuid)}
                            className="flex items-center gap-3 rounded-xl bg-[var(--k3-navy)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-sm"
                        >
                            <ClipboardCheck className="h-5 w-5 text-[var(--k3-accent)] shrink-0" />
                            <div className="text-left">
                                <p className="font-bold">Pengajuan Inspeksi Baru</p>
                                <p className="text-xs font-normal text-slate-300">Isi checklist pemeriksaan berkala K3</p>
                            </div>
                        </Link>

                        <Link
                            href={route('ladders.show', ladder.uuid)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            <Eye className="h-4 w-4 text-slate-500" /> Buka Detail Manajemen Aset
                        </Link>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--k3-muted)] hover:text-[var(--k3-navy)]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
