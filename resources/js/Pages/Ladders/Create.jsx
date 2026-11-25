import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
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
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Data Aset', href: route('ladders.index') },
                { label: 'Tambah Aset' },
            ]}
        >
            <Head title="Identifikasi Tangga Baru" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Selaras SafeLadder */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="sl-btn-back"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Identifikasi Tangga Baru
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Langkah 1: Daftarkan spesifikasi teknis dan lokasi penempatan tangga
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    {/* Panel Form Utama */}
                    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-base font-bold text-slate-900">Spesifikasi Identitas Tangga</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Isi spesifikasi teknis tangga. Lokasi penempatan akan secara otomatis menentukan Inspektor EHS penilai.
                            </p>
                        </div>

                        {/* A. Jenis Tangga */}
                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700">
                                A. Jenis Tangga
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'portable')}
                                    className={`flex items-center justify-center rounded-xl border-2 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                        data.type === 'portable'
                                            ? 'border-[#0f172a] bg-slate-900 text-white shadow-xs'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    Tangga Portabel (PLD)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'permanent')}
                                    className={`flex items-center justify-center rounded-xl border-2 py-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                        data.type === 'permanent'
                                            ? 'border-[#0f172a] bg-slate-900 text-white shadow-xs'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
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
                                <label htmlFor="location" className="block text-xs font-semibold text-slate-700">
                                    B. Lokasi Penempatan
                                </label>
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Otomatisasi penugasan inspektor
                                </span>
                            </div>
                            <input
                                id="location"
                                type="text"
                                list="location-presets"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
                                placeholder="Ketik lokasi atau pilih dari daftar preset (misal: Kawasan Gresik)"
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
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <label htmlFor="inspector_id" className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Nama Inspektor (Otomatis Sesuai Lokasi / Zona)
                            </label>
                            <select
                                id="inspector_id"
                                value={data.inspector_id}
                                onChange={(e) => setData('inspector_id', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-[#0f172a] focus:outline-none cursor-pointer"
                                required
                            >
                                <option value="">Pilih Inspektor</option>
                                {inspectors.map((inspector) => (
                                    <option key={inspector.id} value={inspector.id}>
                                        {inspector.name} ({inspector.email})
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-slate-500">
                                {selectedInspector
                                    ? `Hasil formulir inspeksi akan otomatis dikirimkan ke ${selectedInspector.name} untuk direview.`
                                    : 'Ketik lokasi di atas untuk auto-assign inspektor K3 yang bertugas.'}
                            </p>
                            {errors.inspector_id && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.inspector_id}</p>}
                        </div>

                        {/* C & D: Pemilik & Penanggung Jawab */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="owner_name" className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    C. Nama Pemilik (Owner)
                                </label>
                                <input
                                    id="owner_name"
                                    type="text"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
                                    placeholder="Contoh: Plant / Kontraktor"
                                    required
                                />
                                {errors.owner_name && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.owner_name}</p>}
                            </div>

                            <div>
                                <label htmlFor="responsible_name" className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    D. Nama Penanggung Jawab (PIC Safety)
                                </label>
                                <select
                                    id="responsible_name"
                                    value={data.responsible_name}
                                    onChange={(e) => setData('responsible_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0f172a] focus:outline-none transition cursor-pointer"
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
                            <label htmlFor="max_load" className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Beban Maksimal Tangga (Kg)
                            </label>
                            <input
                                id="max_load"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.max_load}
                                onChange={(e) => setData('max_load', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
                                placeholder="Contoh: 150"
                                required
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                Nilai beban maksimal ini akan dicantumkan pada label fisik tangga.
                            </p>
                            {errors.max_load && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.max_load}</p>}
                        </div>

                        {/* Keterangan Tambahan */}
                        <div>
                            <label htmlFor="description" className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Keterangan Tambahan <span className="font-normal text-slate-400">(Opsional)</span>
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows="3"
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
                                placeholder="Tambahkan informasi spesifik mengenai material atau area..."
                            />
                            {errors.description && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.description}</p>}
                        </div>

                        {/* Submit Button Bertema SafeLadder Amber */}
                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] px-6 py-3 text-sm font-bold text-white shadow-md transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                <PlusCircle className="h-4 w-4" />
                                {processing ? 'Menyimpan...' : 'Lanjut ke Formulir Inspeksi'}
                            </button>
                        </div>
                    </form>

                    {/* Sidebar Panduan Alur */}
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                            Alur Kerja SafeLadder
                        </h3>
                        <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">1</div>
                                <p><strong className="text-slate-900">Identifikasi:</strong> PIC Safety mengisi data teknis tangga & lokasi penempatan.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">2</div>
                                <p><strong className="text-slate-900">Formulir Inspeksi:</strong> Mengisi checklist fisik & upload bukti foto aktual.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">3</div>
                                <p><strong className="text-slate-900">Review Inspektor:</strong> Inspektor EHS mereview dan menentukan ACC / Reject per butir.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">4</div>
                                <p><strong className="text-slate-900">Label Identifikasi:</strong> Jika ACC, label QR Code fisik siap dicetak dengan masa berlaku 1 tahun.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
