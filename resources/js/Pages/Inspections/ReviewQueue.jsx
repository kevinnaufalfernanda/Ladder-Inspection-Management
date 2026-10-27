import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ClipboardCheck, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReviewQueue({ inspections = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="Antrean Review Inspeksi" />
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs font-medium text-slate-500">Tugas inspektor EHS</p>
                    <h1 className="mt-1 text-xl font-bold text-slate-900">Antrian Review Inspeksi</h1>
                    <p className="mt-1 text-xs text-slate-500">
                        Daftar aset tangga yang menunggu peninjauan dan persetujuan fisik. Setiap tangga diringkas menjadi 1 entri antrean terbaru.
                    </p>
                </div>

                <div className="k3-panel overflow-hidden rounded-2xl">
                    {inspections.length === 0 ? (
                        <div className="px-6 py-14 text-center text-sm text-slate-500">
                            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                            <p className="font-semibold text-slate-700">Tidak ada inspeksi yang menunggu review.</p>
                            <p className="text-xs text-slate-400 mt-1">Semua pengajuan telah selesai diperiksa.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {inspections.map((inspection) => {
                                const isCorrection = inspection.workflow_status === 'needs_correction';
                                const formattedDate = new Date(inspection.created_at).toLocaleString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                });

                                return (
                                    <div key={inspection.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50/60 transition">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900 text-base">
                                                    {inspection.ladder?.identifier || inspection.ladder?.location}
                                                </p>
                                                {isCorrection ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase">
                                                        <AlertCircle className="w-3 h-3" /> Ada Temuan Reject
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase">
                                                        <Clock className="w-3 h-3" /> Menunggu Review
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium">
                                                Lokasi: <span className="font-semibold text-slate-800">{inspection.ladder?.location}</span> · Jenis: {inspection.ladder?.type === 'portable' ? 'Portabel' : 'Permanen'}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                                                <span className="inline-flex items-center gap-1.5 font-medium">
                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                    Pengaju: <strong className="text-slate-700">{inspection.submitter?.name || 'PIC Safety'}</strong>
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 font-medium">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                    Waktu Pengajuan: <strong className="text-slate-700">{formattedDate} WIB</strong>
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('inspections.review', inspection.id)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--k3-navy)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-sm"
                                        >
                                            <ClipboardCheck className="h-4 w-4 text-[var(--k3-accent)]" /> Review
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
