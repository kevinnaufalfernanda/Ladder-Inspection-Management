import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, PlusCircle, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

export default function Create({ inspectors = [], pics = [], locationMappings = [] }) {
    const authUser = usePage().props.auth?.user;
    const defaultPicName = pics.find((p) => p.id === authUser?.id)?.name || (authUser?.role === 'pic_safety' ? authUser.name : '') || pics[0]?.name || '';

    const { data, setData, post, processing, errors } = useForm({
        location: '',
        type: 'portable',
        owner_name: '',
        responsible_name: defaultPicName,
        max_load: '',
        inspector_id: inspectors[0]?.id || '',
        description: '',
    });

    useEffect(() => {
        if (!data.location) return;
        const matched = locationMappings.find(
            (m) => m.location_name.toLowerCase().trim() === data.location.toLowerCase().trim()
        );
        if (matched) {
            setData('inspector_id', matched.inspector_id);
        }
    }, [data.location]);

    const submit = (e) => {
        e.preventDefault();
        post(route('ladders.store'));
    };

    const selectedInspector = inspectors.find((ins) => String(ins.id) === String(data.inspector_id));

    return (
        <AuthenticatedLayout>
            <Head title="Identifikasi Tangga" />

            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header Selaras Dashboard */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Langkah 1: Identifikasi Aset Tangga</p>
                        <h1 className="mt-1 text-xl font-semibold text-slate-900">Form Identifikasi Tangga</h1>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                    {/* Panel Form Utama */}
                    <form onSubmit={submit} className="k3-panel p-6 sm:p-7 space-y-5">
                        <div className="border-b border-[var(--k3-line)] pb-4">
                            <h2 className="text-base font-bold text-[var(--k3-navy)]">Identifikasi Aset Tangga</h2>
                            <p className="mt-1 text-xs text-[var(--k3-muted)]">
                                Isi spesifikasi dasar tangga. Lokasi penempatan akan secara otomatis menentukan Inspektor tujuan.
                            </p>
                        </div>

                        {/* A. Jenis Tangga */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                A. Jenis Tangga
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'portable')}
                                    className={`flex items-center justify-center rounded-xl border-2 py-3 text-xs sm:text-sm font-bold transition ${
                                        data.type === 'portable'
                                            ? 'border-[var(--k3-brand)] bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] shadow-sm'
                                            : 'border-[var(--k3-line)] bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    Tangga Portabel (PLD)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'permanent')}
                                    className={`flex items-center justify-center rounded-xl border-2 py-3 text-xs sm:text-sm font-bold transition ${
                                        data.type === 'permanent'
                                            ? 'border-[var(--k3-brand)] bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] shadow-sm'
                                            : 'border-[var(--k3-line)] bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    Tangga Tetap (FLD)
                                </button>
                            </div>
                            {errors.type && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.type}</p>}
                        </div>

                        {/* B. Lokasi Penempatan */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                    B. Lokasi Penempatan
                                </label>
                                <span className="text-[11px] text-[var(--k3-brand)] font-semibold flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Auto-assign Inspektor
                                </span>
                            </div>
                            <input
                                id="location"
                                type="text"
                                list="location-presets"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                                placeholder="Ketik lokasi atau pilih dari daftar preset (misal: Plant Area ME-FAL)"
                                autoFocus
                                required
                            />
                            <datalist id="location-presets">
                                {locationMappings.map((m) => (
                                    <option key={m.id} value={m.location_name}>
                                        Inspektor: {m.inspector?.name}
                                    </option>
                                ))}
                            </datalist>
                            {errors.location && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.location}</p>}
                        </div>

                        {/* Inspektor Tujuan (Sesuai Lokasi) */}
                        <div className="rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] p-4">
                            <label htmlFor="inspector_id" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--k3-brand-strong)]">
                                Nama Inspektor (Otomatis Sesuai Lokasi / Zona)
                            </label>
                            <select
                                id="inspector_id"
                                value={data.inspector_id}
                                onChange={(e) => setData('inspector_id', e.target.value)}
                                className="w-full rounded-lg border border-[var(--k3-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--k3-navy)] focus:border-[var(--k3-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)]"
                                required
                            >
                                <option value="">Pilih Inspektor</option>
                                {inspectors.map((inspector) => (
                                    <option key={inspector.id} value={inspector.id}>
                                        {inspector.name} ({inspector.email})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-[var(--k3-muted)]">
                                {selectedInspector
                                    ? `Hasil formulir inspeksi akan otomatis dikirimkan ke ${selectedInspector.name} untuk direview.`
                                    : 'Ketik lokasi di atas untuk auto-assign inspektor K3 yang bertugas.'}
                            </p>
                            {errors.inspector_id && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.inspector_id}</p>}
                        </div>

                        {/* C & D: Pemilik & Penanggung Jawab */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="owner_name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                    C. Nama Pemilik (Owner)
                                </label>
                                <input
                                    id="owner_name"
                                    type="text"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    className="w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                                    placeholder="Contoh: Plant / Kontraktor"
                                    required
                                />
                                {errors.owner_name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.owner_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="responsible_name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                    D. Nama Penanggung Jawab (PIC Safety)
                                </label>
                                <select
                                    id="responsible_name"
                                    value={data.responsible_name}
                                    onChange={(e) => setData('responsible_name', e.target.value)}
                                    className="w-full rounded-xl border border-[var(--k3-line)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--k3-navy)] focus:border-[var(--k3-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                                    required
                                >
                                    <option value="">Pilih PIC Safety</option>
                                    {pics.map((pic) => (
                                        <option key={pic.id} value={pic.name}>
                                            {pic.name} ({pic.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.responsible_name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.responsible_name}</p>}
                            </div>
                        </div>

                        {/* Beban Maksimal */}
                        <div>
                            <label htmlFor="max_load" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                Beban Maksimal Tangga (Kg)
                            </label>
                            <input
                                id="max_load"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.max_load}
                                onChange={(e) => setData('max_load', e.target.value)}
                                className="w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                                placeholder="Contoh: 150"
                                required
                            />
                            <p className="mt-1 text-[11px] text-[var(--k3-muted)]">
                                Nilai beban maksimal ini akan dicantumkan pada label fisik tangga.
                            </p>
                            {errors.max_load && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.max_load}</p>}
                        </div>

                        {/* Keterangan Tambahan */}
                        <div>
                            <label htmlFor="description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                                Keterangan Tambahan <span className="font-normal text-slate-400">(Opsional)</span>
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className="w-full resize-none rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] px-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                                placeholder="Tambahkan informasi spesifik mengenai material atau area..."
                            />
                            {errors.description && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.description}</p>}
                        </div>

                        {/* Submit Button Bertema K3 Navy */}
                        <div className="flex justify-end pt-3 border-t border-[var(--k3-line)]">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[var(--k3-navy)] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--k3-brand-strong)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <PlusCircle className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Lanjut ke Formulir Inspeksi'}
                            </button>
                        </div>
                    </form>

                    {/* Sidebar Panduan Alur */}
                    <aside className="h-fit k3-panel p-6 space-y-4">
                        <h3 className="font-bold text-[var(--k3-navy)] text-sm uppercase tracking-wider border-b border-[var(--k3-line)] pb-2">
                            Alur Kerja Sistem (Workflow)
                        </h3>
                        <div className="space-y-4 text-xs text-[var(--k3-muted)] leading-relaxed">
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--k3-accent-soft)] text-xs font-bold text-[var(--k3-brand-strong)]">1</div>
                                <p><strong className="text-[var(--k3-navy)]">Identifikasi:</strong> PIC Safety mengisi data dasar tangga & lokasi penempatan.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--k3-accent-soft)] text-xs font-bold text-[var(--k3-brand-strong)]">2</div>
                                <p><strong className="text-[var(--k3-navy)]">Formulir Inspeksi:</strong> Mengisi checklist fisik & upload bukti foto aktual.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--k3-accent-soft)] text-xs font-bold text-[var(--k3-brand-strong)]">3</div>
                                <p><strong className="text-[var(--k3-navy)]">Review Inspektor:</strong> Inspektor EHS mereview dan menentukan Approve / Reject per item.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--k3-accent-soft)] text-xs font-bold text-[var(--k3-brand-strong)]">4</div>
                                <p><strong className="text-[var(--k3-navy)]">Label Identifikasi:</strong> Jika Approve, otomatis generate Label QR Code dengan masa berlaku 1 tahun.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
