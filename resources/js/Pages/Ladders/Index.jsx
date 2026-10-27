import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, XCircle, AlertTriangle, QrCode, Printer, X, Filter, Plus, ExternalLink } from 'lucide-react';

export default function Index({ ladders = [] }) {
    const [qrModal, setQrModal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

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

        const qrSvgElement = document.getElementById('printable-index-qr');
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
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 24px;
            background: #ffffff;
            color: #16251f;
        }
        .label-card {
            max-width: 580px;
            margin: 0 auto;
            border: 4px solid #16251f;
            border-radius: 20px;
            padding: 24px 28px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .header {
            border-bottom: 2px solid #16251f;
            padding-bottom: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .brand-sub {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #4b5563;
            text-transform: uppercase;
            margin: 0;
        }
        .brand-title {
            font-size: 20px;
            font-weight: 900;
            margin: 4px 0 0;
            color: #16251f;
            text-transform: uppercase;
        }
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: #edf8c9;
            color: #204c3b;
            border: 1px solid #39735d;
        }
        .body-layout {
            margin-top: 20px;
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .details {
            flex: 1;
        }
        .field-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #6b7280;
            margin: 0 0 2px;
        }
        .id-box {
            background: #f7f9f5;
            border: 2px solid #d9e1d7;
            border-radius: 10px;
            padding: 10px 14px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
            font-weight: 900;
            color: #16251f;
            margin: 4px 0 14px;
            word-break: break-all;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 16px;
            font-size: 13px;
        }
        .info-value {
            font-weight: 800;
            color: #16251f;
            margin: 0;
        }
        .qr-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f7f9f5;
            border: 2px solid #d9e1d7;
            border-radius: 16px;
            padding: 16px;
            text-align: center;
            min-width: 170px;
        }
        .qr-section svg {
            width: 140px;
            height: 140px;
        }
        .qr-caption {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #4b5563;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }
        .footer {
            margin-top: 18px;
            padding-top: 12px;
            border-top: 1px dashed #d9e1d7;
            font-size: 9.5px;
            font-weight: 700;
            color: #6b7280;
            text-align: center;
            letter-spacing: 0.2px;
        }
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
                    <div>
                        <p class="field-label">Jenis Tangga</p>
                        <p class="info-value">${typeLabel}</p>
                    </div>
                    <div>
                        <p class="field-label">Beban Maksimal</p>
                        <p class="info-value">${maxLoadText}</p>
                    </div>
                    <div style="grid-column: span 2;">
                        <p class="field-label">Lokasi / Area</p>
                        <p class="info-value">${ladder.location}</p>
                    </div>
                    <div>
                        <p class="field-label">Penanggung Jawab</p>
                        <p class="info-value">${ladder.responsible_name || '-'}</p>
                    </div>
                    <div>
                        <p class="field-label">Pemilik Aset</p>
                        <p class="info-value">${ladder.owner_name || '-'}</p>
                    </div>
                </div>
            </div>
            <div class="qr-section">
                ${qrSvgHtml}
                <p class="qr-caption">Scan untuk Status K3</p>
            </div>
        </div>
        <div class="footer">
            Standar Keselamatan Kerja (K3) PT Wilmar Nabati Indonesia · Wajib Diinspeksi Berkala
        </div>
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
            
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Daftar aset terdaftar</p>
                        <h1 className="mt-1 text-xl font-semibold text-slate-900">Data Aset Tangga</h1>
                    </div>
                    <Link
                        href={route('ladders.create')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah aset
                    </Link>
                </div>
                
                {/* Filter Bar */}
                <div className="k3-card flex flex-wrap items-center justify-between gap-4 p-3">
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
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                    filterStatus === item.key
                                        ? 'bg-[var(--k3-navy)] text-white shadow-sm'
                                        : 'bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] hover:bg-[var(--k3-accent)]'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {filteredLadders.map((ladder) => (
                        <article key={ladder.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{ladder.location}</p>
                                    <p className="mt-1 text-sm text-slate-500">{ladder.type}</p>
                                </div>
                                {statusBadge[getStatus(ladder)]}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                <p className="text-[10px] text-slate-400">ID: {ladder.uuid.split('-')[0]}</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQrModal(ladder)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
                                        title="Lihat QR Code"
                                    >
                                        <QrCode className="h-4 w-4" />
                                    </button>
                                    <Link
                                        href={route('ladders.show', ladder.uuid)}
                                        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Detail →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                    {filteredLadders.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 md:col-span-2">
                            Tidak ada data tangga dengan status tersebut.
                        </div>
                    )}
                </div>
            </div>

            {/* QR Modal Pratinjau Label Fisik */}
            {qrModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--k3-navy)] text-[var(--k3-accent)]">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">Label Identifikasi Fisik Tangga</h4>
                                    <p className="text-[11px] font-medium text-slate-500">PT Wilmar Nabati Indonesia · Siap Cetak</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setQrModal(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Kartu Pratinjau Label Resmi (Bukan kotak polos lagi) */}
                        <div className="p-6">
                            <div className="rounded-2xl border-2 border-slate-800 bg-[#fbfdfa] p-5 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">PT Wilmar Nabati Indonesia</p>
                                        <h5 className="text-sm font-black uppercase text-slate-900">Label Identifikasi Tangga</h5>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800 border border-emerald-300">
                                        {qrModal.latest_inspection?.status === 'safe' ? 'INSPEKSI VALID' : 'PERLU INSPEKSI'}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
                                    <div className="flex-1 space-y-2.5 w-full">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ID Unik Tangga</p>
                                            <p className="font-mono text-xs font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200 break-all mt-0.5">
                                                {qrModal.identifier || qrModal.location}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Jenis Tangga</p>
                                                <p className="font-bold text-slate-800">{qrModal.type === 'portable' ? 'Portabel (PLD)' : 'Permanen (FLD)'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Beban Maksimal</p>
                                                <p className="font-bold text-slate-800">{qrModal.max_load ? `${qrModal.max_load} KG` : '-'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Lokasi / Area</p>
                                                <p className="font-bold text-slate-800">{qrModal.location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center shrink-0">
                                        <div className="p-1">
                                            <QRCodeSVG
                                                id="printable-index-qr"
                                                value={route('ladders.qr', qrModal.uuid)}
                                                size={135}
                                                level="H"
                                            />
                                        </div>
                                        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">Scan K3</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <Link
                                    href={route('ladders.certificate', qrModal.uuid)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                                >
                                    <ExternalLink className="h-4 w-4" /> Buka Halaman Sertifikat Lengkap
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => handlePrintLabel(qrModal)}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--k3-navy)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-sm cursor-pointer"
                                >
                                    <Printer className="h-4 w-4" /> Cetak Label Fisik (1 Lembar)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}