import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';

export default function Create({ ladder }) {
    const returnTo = new URLSearchParams(window.location.search).get('return_to');
    const redirectTarget = returnTo === 'detail' ? 'detail' : 'dashboard';
    const backHref = redirectTarget === 'detail' ? route('ladders.show', ladder.uuid) : route('dashboard');

    const { data, setData, post, processing, errors } = useForm({
        status: '',
        return_to: redirectTarget,
        checklist: {
            kaki_karet_anti_slip: false,
            engsel_pengunci: false,
            anak_tangga_kokoh: false,
            label_peringatan_jelas: false,
        },
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('inspections.store', ladder.uuid), {
            data: { ...data, return_to: redirectTarget },
            onSuccess: () => {
                router.visit(
                    redirectTarget === 'detail'
                        ? route('ladders.show', ladder.uuid)
                        : route('dashboard'),
                    { replace: true }
                );
            },
        });
    };

    const toggleChecklist = (key) => {
        setData('checklist', { ...data.checklist, [key]: !data.checklist[key] });
    };

    const checklistLabels = {
        kaki_karet_anti_slip:  'Kaki Karet Anti Slip',
        engsel_pengunci:       'Engsel Pengunci',
        anak_tangga_kokoh:     'Anak Tangga Kokoh',
        label_peringatan_jelas: 'Label Peringatan Jelas',
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans py-8">
            <Head title={`Form Inspeksi - ${ladder.location}`} />

            {/* Container Utama dengan Batasan max-w-4xl */}
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header Navy yang Menyatu Rapi */}
                <div className="rounded-2xl bg-slate-900 text-white shadow-md p-6 sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500">
                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">K3 Safety</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Form Inspeksi Aset</p>
                        <h2 className="mt-1 text-3xl font-bold tracking-tight">{ladder.location}</h2>
                        <p className="mt-1 text-sm text-slate-400">{ladder.type}</p>
                    </div>
                </div>

                {/* Form Utama di Bawah Header */}
                <form onSubmit={submit} className="space-y-5">

                    {/* Checklist Fisik */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Checklist Fisik</h3>
                        <p className="mb-4 text-sm text-slate-500">Tap kartu jika komponen dalam kondisi baik.</p>
                        <div className="space-y-2.5">
                            {Object.keys(data.checklist).map((key) => {
                                const isChecked = data.checklist[key];
                                return (
                                    <div
                                        key={key}
                                        onClick={() => toggleChecklist(key)}
                                        className={`flex cursor-pointer select-none items-center justify-between rounded-lg border px-4 py-3.5 transition-all ${
                                            isChecked
                                                ? 'border-slate-300 bg-slate-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`text-sm font-semibold ${isChecked ? 'text-slate-800' : 'text-slate-600'}`}>
                                            {checklistLabels[key]}
                                        </span>
                                        {isChecked
                                            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            : <Circle className="h-5 w-5 text-slate-300" />
                                        }
                                    </div>
                                );
                            })}
                        </div>
                        {errors.checklist && <p className="mt-2 text-xs font-semibold text-rose-600">{errors.checklist}</p>}
                    </div>

                    {/* Keputusan Akhir */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Keputusan Akhir</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setData('status', 'safe')}
                                className={`flex min-h-[110px] flex-col items-center justify-center rounded-xl border-2 p-5 transition-all duration-150 cursor-pointer ${
                                    data.status === 'safe'
                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md scale-[1.02]'
                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <ShieldCheck className="mb-2.5 h-9 w-9" />
                                <span className="text-sm font-bold uppercase tracking-wider">Aman</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('status', 'unsafe')}
                                className={`flex min-h-[110px] flex-col items-center justify-center rounded-xl border-2 p-5 transition-all duration-150 cursor-pointer ${
                                    data.status === 'unsafe'
                                        ? 'border-rose-600 bg-rose-600 text-white shadow-md scale-[1.02]'
                                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <ShieldAlert className="mb-2.5 h-9 w-9" />
                                <span className="text-sm font-bold uppercase tracking-wider">Tidak Aman</span>
                            </button>
                        </div>
                        {errors.status && <p className="mt-3 text-center text-xs font-semibold text-rose-600">{errors.status}</p>}
                    </div>

                    {/* Catatan Tambahan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Catatan Tambahan</h3>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows="3"
                            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            placeholder="Ketik catatan jika ada temuan (Opsional)..."
                        />
                        {errors.notes && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.notes}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing || !data.status}
                            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Inspeksi'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}