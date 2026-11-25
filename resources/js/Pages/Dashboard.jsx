import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    LayoutGrid,
    ShieldCheck,
    RotateCcw,
    XCircle,
    Search,
    X,
    Plus,
    Printer,
    ExternalLink,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    QrCode,
} from 'lucide-react';

export default function Dashboard({ ladders = [], flash }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user || {};
    const [qrModal, setQrModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'safe', 'expired', 'unsafe', 'none'

    // Evaluasi status K3 aset tangga
    const getStatus = (ladder) => {
        const latest = ladder.latest_inspection;
        if (!latest) return 'none';
        if (latest.status === 'unsafe') return 'unsafe';
        if (new Date(latest.valid_until) <= new Date()) return 'expired';
        return 'safe';
    };

    // Statistik Agregat K3
    const totalSafe = ladders.filter((l) => getStatus(l) === 'safe').length;
    const totalExpired = ladders.filter((l) => getStatus(l) === 'expired').length;
    const totalUnsafe = ladders.filter((l) => getStatus(l) === 'unsafe').length;
    const totalNone = ladders.filter((l) => getStatus(l) === 'none').length;
    const totalPermanent = ladders.filter((l) => l.type === 'permanent').length;
    const totalPortable = ladders.filter((l) => l.type === 'portable').length;

    // Tingkat Kepatuhan K3
    const complianceRate = ladders.length > 0
        ? Math.round((totalSafe / ladders.length) * 100)
        : 100;

    // Aset yang belum diinspeksi (untuk kartu alert)
    const uninspectedLadder = ladders.find((l) => getStatus(l) === 'none');

    // Aktivitas pemeriksaan terakhir
    const latestInspectedLadder = useMemo(() => {
        const inspected = ladders.filter((l) => l.latest_inspection);
        if (inspected.length === 0) return null;
        return inspected.sort((a, b) => new Date(b.latest_inspection.created_at) - new Date(a.latest_inspection.created_at))[0];
    }, [ladders]);

    // Format tanggal
    const formatInspectionDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Filter daftar tangga untuk tabel
    const filteredLadders = ladders.filter((ladder) => {
        const status = getStatus(ladder);
        if (activeFilter === 'safe' && status !== 'safe') return false;
        if (activeFilter === 'expired' && status !== 'expired') return false;
        if (activeFilter === 'unsafe' && status !== 'unsafe') return false;
        if (activeFilter === 'none' && status !== 'none') return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchLoc = (ladder.location || '').toLowerCase().includes(q);
            const matchId = (ladder.identifier || ladder.uuid || '').toLowerCase().includes(q);
            const matchOwner = (ladder.owner_name || '').toLowerCase().includes(q);
            const matchResp = (ladder.responsible_name || '').toLowerCase().includes(q);
            return matchLoc || matchId || matchOwner || matchResp;
        }

        return true;
    });

    // Cetak Label Resmi Wilmar
    const handlePrintLabel = (ladder) => {
        if (!ladder) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const qrSvgElement = document.getElementById('printable-modal-qr');
        const qrSvgHtml = qrSvgElement ? qrSvgElement.outerHTML : '';
        const statusText = ladder.latest_inspection?.status === 'safe' ? 'INSPEKSI VALID' : 'PERLU INSPEKSI';
        const typeLabel = ladder.type === 'portable' ? 'Tangga Portabel (PLD)' : 'Tangga Tetap (FLD)';
        const maxLoadText = ladder.max_load ? `${ladder.max_load} KG` : '-';
        const identifierText = ladder.identifier || ladder.location;

        const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Label K3 - ${identifierText}</title>
    <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; background: #ffffff; color: #16251f; }
        .label-card { max-width: 580px; margin: 0 auto; border: 4px solid #16251f; border-radius: 20px; padding: 24px 28px; background: #ffffff; page-break-inside: avoid; break-inside: avoid; }
        .header { border-bottom: 2px solid #16251f; padding-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .brand-sub { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #4b5563; text-transform: uppercase; margin: 0; }
        .brand-title { font-size: 20px; font-weight: 900; margin: 4px 0 0; color: #16251f; text-transform: uppercase; }
        .badge { display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; background: #edf8c9; color: #204c3b; border: 1px solid #39735d; }
        .body-layout { margin-top: 20px; display: flex; gap: 20px; align-items: center; }
        .details { flex: 1; }
        .field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #6b7280; margin: 0 0 2px; }
        .id-box { background: #f7f9f5; border: 2px solid #d9e1d7; border-radius: 10px; padding: 10px 14px; font-family: monospace; font-size: 13px; font-weight: 900; color: #16251f; margin: 4px 0 14px; word-break: break-all; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; font-size: 13px; }
        .info-value { font-weight: 800; color: #16251f; margin: 0; }
        .qr-section { display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f7f9f5; border: 2px solid #d9e1d7; border-radius: 16px; padding: 16px; text-align: center; min-width: 170px; }
        .qr-caption { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #4b5563; margin-top: 8px; }
        .footer { margin-top: 18px; padding-top: 12px; border-top: 1px dashed #d9e1d7; font-size: 9.5px; font-weight: 700; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <div class="label-card">
        <div class="header">
            <div>
                <p class="brand-sub">PT Wilmar Nabati Indonesia</p>
                <h1 class="brand-title">Label Identifikasi Tangga</h1>
            </div>
            <span class="badge">${statusText}</span>
        </div>
        <div class="body-layout">
            <div class="details">
                <p class="field-label">ID Unik Tangga</p>
                <div class="id-box">${identifierText}</div>
                <div class="info-grid">
                    <div><p class="field-label">Jenis Tangga</p><p class="info-value">${typeLabel}</p></div>
                    <div><p class="field-label">Beban Maksimal</p><p class="info-value">${maxLoadText}</p></div>
                    <div style="grid-column: span 2;"><p class="field-label">Lokasi / Area</p><p class="info-value">${ladder.location}</p></div>
                    <div><p class="field-label">Penanggung Jawab</p><p class="info-value">${ladder.responsible_name || '-'}</p></div>
                    <div><p class="field-label">Pemilik Aset</p><p class="info-value">${ladder.owner_name || '-'}</p></div>
                </div>
            </div>
            <div class="qr-section">
                ${qrSvgHtml}
                <p class="qr-caption">Scan untuk Status K3</p>
            </div>
        </div>
        <div class="footer">Standar Keselamatan Kerja (K3) PT Wilmar Nabati Indonesia · Wajib Diinspeksi Berkala</div>
    </div>
</body>
</html>`;

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(content);
        iframe.contentWindow.document.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }, 300);
    };

    return (
        <AuthenticatedLayout breadcrumb="Dashboard">
            <Head title="Dashboard Keselamatan Tangga" />

            <div className="p-6 sm:p-8 space-y-6 max-w-[1440px] mx-auto">

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                        {flash.success}
                    </div>
                )}

                {/* Header Utama Sesuai Gambar 1 */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Dashboard keselamatan tangga
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Pantau kelayakan aset dan pastikan setiap langkah tetap aman.
                        </p>
                    </div>

                    <Link
                        href={route('ladders.create')}
                        className="sl-btn-primary flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Aset
                    </Link>
                </div>

                {/* ========================================================================= */}
                {/* BARIS 1: 4 KARTU STATISTIK (DENGAN SENTUHAN INTERAKTIF FILTER)           */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* 1. Total Aset */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeFilter === 'all' ? 'ring-2 ring-slate-900 border-slate-900' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Total aset</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <LayoutGrid className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">{ladders.length}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Terdaftar di plant</p>
                        </div>
                    </button>

                    {/* 2. Aman & Valid */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter('safe')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeFilter === 'safe' ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Aman & valid</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalSafe}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Siap digunakan</p>
                        </div>
                    </button>

                    {/* 3. Perlu Uji Ulang */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter('expired')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeFilter === 'expired' ? 'ring-2 ring-amber-500 border-amber-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Perlu uji ulang</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                <RotateCcw className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalExpired}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Masa berlaku kedaluwarsa</p>
                        </div>
                    </button>

                    {/* 4. Temuan Reject */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter('unsafe')}
                        className={`sl-card p-5 text-left transition-all cursor-pointer ${
                            activeFilter === 'unsafe' ? 'ring-2 ring-rose-500 border-rose-500' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Temuan reject</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                                <XCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalUnsafe}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5">Perlu tindakan koreksi</p>
                        </div>
                    </button>

                </div>

                {/* ========================================================================= */}
                {/* BARIS 2: 3 KARTU (NAVY CARD, DISTRIBUSI, AKTIVITAS PEMERIKSAAN)          */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Kepatuhan Standar K3 (Navy Card Sesuai Gambar 1) */}
                    <div className="rounded-2xl bg-[#0f172a] p-6 text-white shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-200">
                                    Kepatuhan standar K3
                                </h3>
                                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                                    {complianceRate >= 80 ? 'Kondisi baik' : 'Perlu perhatian'}
                                </span>
                            </div>

                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                                    {complianceRate}
                                </span>
                                <span className="text-xl font-bold text-amber-400">%</span>
                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                                {totalSafe} dari {ladders.length} aset terverifikasi aman
                            </p>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                <div
                                    className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                                    style={{ width: `${complianceRate}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Target kepatuhan</span>
                                <span className="font-bold text-white">100%</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Distribusi Status Aset (Card Putih Tengah) */}
                    <div className="sl-card p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Distribusi status aset
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Kondisi kelayakan seluruh tangga
                            </p>

                            {/* Multi-segment visual bar */}
                            <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                                <div
                                    style={{ width: `${ladders.length ? (totalSafe / ladders.length) * 100 : 0}%` }}
                                    className="bg-emerald-500 transition-all duration-300"
                                />
                                <div
                                    style={{ width: `${ladders.length ? (totalNone / ladders.length) * 100 : 0}%` }}
                                    className="bg-slate-300 transition-all duration-300"
                                />
                                <div
                                    style={{ width: `${ladders.length ? ((totalExpired + totalUnsafe) / ladders.length) * 100 : 0}%` }}
                                    className="bg-amber-500 transition-all duration-300"
                                />
                            </div>

                            {/* Legend interaktif */}
                            <div className="mt-4 space-y-2 text-xs">
                                <div
                                    onClick={() => setActiveFilter('safe')}
                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-slate-600">Aman & valid</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{totalSafe} aset</span>
                                </div>

                                <div
                                    onClick={() => setActiveFilter('none')}
                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                                        <span className="text-slate-600">Belum diinspeksi</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{totalNone} aset</span>
                                </div>

                                <div
                                    onClick={() => setActiveFilter('expired')}
                                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50 px-1 rounded-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span className="text-slate-600">Uji ulang / reject</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">{totalExpired + totalUnsafe} aset</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer rasio jenis tangga */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>{totalPermanent} tangga tetap</span>
                            <span>{totalPortable} tangga portabel</span>
                        </div>
                    </div>

                    {/* 3. Aktivitas Pemeriksaan (Card Putih Kanan) */}
                    <div className="sl-card p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Aktivitas pemeriksaan
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {latestInspectedLadder?.latest_inspection
                                    ? `Terakhir diperiksa ${formatInspectionDate(latestInspectedLadder.latest_inspection.created_at)}`
                                    : 'Belum ada data pemeriksaan'}
                            </p>

                            {/* Item pemeriksaan terakhir jika ada */}
                            {latestInspectedLadder ? (
                                <Link
                                    href={route('ladders.show', latestInspectedLadder.uuid)}
                                    className="mt-4 block rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {latestInspectedLadder.location}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    {latestInspectedLadder.type === 'permanent' ? 'Permanent' : 'Portable'} • {latestInspectedLadder.identifier || '001'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                Lolos ACC
                                            </span>
                                            <p className="text-[9px] text-slate-400 mt-0.5">
                                                {latestInspectedLadder.inspector?.name || 'Inspektor EHS'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-400 text-center">
                                    Belum ada pemeriksaan tercatat
                                </div>
                            )}
                        </div>

                        {/* Banner status belum diinspeksi sesuai gambar */}
                        {uninspectedLadder && (
                            <Link
                                href={route('ladders.show', uninspectedLadder.uuid)}
                                className="mt-3 block rounded-xl bg-amber-50/80 border border-amber-200/60 p-3 hover:bg-amber-100/70 transition cursor-pointer"
                            >
                                <p className="text-xs font-bold text-amber-900">
                                    {totalNone} aset belum diinspeksi
                                </p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Jadwalkan pemeriksaan {uninspectedLadder.location}.
                                </p>
                            </Link>
                        )}
                    </div>

                </div>

                {/* ========================================================================= */}
                {/* BARIS 3: INVENTARIS TANGGA KERJA (TABEL UTAMA SESUAI GAMBAR 1)            */}
                {/* ========================================================================= */}
                <div className="sl-card overflow-hidden">
                    <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Inventaris tangga kerja
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Daftar aset terdaftar di seluruh lokasi plant
                            </p>
                        </div>

                        {/* Search Bar Sesuai Gambar 1 */}
                        <div className="relative w-full sm:w-72">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama, ID, atau lokasi aset..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Chip Aktif (Jika filter dipilih) */}
                    {activeFilter !== 'all' && (
                        <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-600">
                                Menampilkan filter: <strong className="text-slate-900 uppercase">{activeFilter}</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => setActiveFilter('all')}
                                className="text-amber-600 font-bold hover:underline"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    {/* Tabel Inventaris */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-3 px-6">IDENTITAS & LOKASI ASET</th>
                                    <th className="py-3 px-4">TIPE TANGGA</th>
                                    <th className="py-3 px-4">STATUS K3</th>
                                    <th className="py-3 px-4">MASA BERLAKU</th>
                                    <th className="py-3 px-6 text-right">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLadders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-400">
                                            Tidak ada aset tangga yang sesuai.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLadders.map((ladder) => {
                                        const status = getStatus(ladder);
                                        const latest = ladder.latest_inspection;

                                        return (
                                            <tr key={ladder.id} className="hover:bg-slate-50/70 transition">
                                                {/* Kolom 1: Identitas & Lokasi */}
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-slate-900">
                                                        {ladder.identifier || ladder.location}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {ladder.location}
                                                    </p>
                                                </td>

                                                {/* Kolom 2: Tipe Tangga */}
                                                <td className="py-4 px-4">
                                                    <p className="font-semibold text-slate-700">
                                                        {ladder.type === 'permanent' ? 'Tangga tetap (FLD)' : 'Portabel (PLD)'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Maks. {ladder.max_load || '111'} kg
                                                    </p>
                                                </td>

                                                {/* Kolom 3: Status K3 Sesuai Pill Gambar */}
                                                <td className="py-4 px-4">
                                                    {status === 'safe' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                                                            ✓ Aman & valid
                                                        </span>
                                                    )}
                                                    {status === 'none' && (
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                                            Belum diinspeksi
                                                        </span>
                                                    )}
                                                    {status === 'expired' && (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                                                            Perlu uji ulang
                                                        </span>
                                                    )}
                                                    {status === 'unsafe' && (
                                                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
                                                            Temuan reject
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Kolom 4: Masa Berlaku */}
                                                <td className="py-4 px-4">
                                                    {latest?.valid_until ? (
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {new Date(latest.valid_until).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                            <p className={`text-[10px] ${
                                                                new Date(latest.valid_until) > new Date() ? 'text-emerald-600' : 'text-rose-600 font-bold'
                                                            }`}>
                                                                {new Date(latest.valid_until) > new Date() ? 'Berlaku aktif' : 'Kedaluwarsa'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">Belum ada inspeksi</span>
                                                    )}
                                                </td>

                                                {/* Kolom 5: Aksi (Detail -> dan Cetak QR) */}
                                                <td className="py-4 px-6 text-right space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQrModal(ladder)}
                                                        title="Cetak Label QR Fisik"
                                                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs active:scale-[0.98] cursor-pointer"
                                                    >
                                                        <QrCode className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Link
                                                        href={route('ladders.show', ladder.uuid)}
                                                        className="group inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98]"
                                                    >
                                                        <span>Detail</span>
                                                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Tabel */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Menampilkan {filteredLadders.length} dari {ladders.length} aset</span>
                        <span className="font-bold text-slate-700">1</span>
                    </div>
                </div>

            </div>

            {/* Modal Cetak Label Fisik Resmi */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Label Fisik Tangga</h4>
                                <p className="text-xs text-slate-400">PT Wilmar Nabati Indonesia</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQrModal(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="rounded-2xl border-2 border-slate-900 bg-slate-50 p-5">
                                <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">PT Wilmar Nabati Indonesia</p>
                                        <h5 className="text-sm font-black text-slate-900">LABEL IDENTIFIKASI TANGGA</h5>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">
                                        {qrModal.latest_inspection?.status === 'safe' ? 'INSPEKSI VALID' : 'PERLU INSPEKSI'}
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex-1 text-xs space-y-1">
                                        <p className="text-[10px] font-mono font-bold text-slate-500">{qrModal.identifier || qrModal.location}</p>
                                        <p className="text-slate-700">Tipe: <strong>{qrModal.type === 'permanent' ? 'Tangga Tetap' : 'Tangga Portabel'}</strong></p>
                                        <p className="text-slate-700">Lokasi: <strong>{qrModal.location}</strong></p>
                                        <p className="text-slate-700">Beban Maks: <strong>{qrModal.max_load || '-'} kg</strong></p>
                                    </div>
                                    <div className="shrink-0 p-2 bg-white rounded-xl border border-slate-200">
                                        <QRCodeSVG
                                            id="printable-modal-qr"
                                            value={route('ladders.qr', qrModal.uuid)}
                                            size={110}
                                            level="H"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    href={route('ladders.certificate', qrModal.uuid)}
                                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> Buka Sertifikat
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handlePrintLabel(qrModal)}
                                    className="sl-btn-primary flex items-center gap-2 cursor-pointer"
                                >
                                    <Printer className="h-4 w-4" /> Cetak Label Fisik
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
