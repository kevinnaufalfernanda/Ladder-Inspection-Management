import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    QrCode, Printer, X, PlusCircle, XCircle, AlertTriangle, ShieldCheck, ArrowUpRight, ClipboardCheck, ExternalLink
} from 'lucide-react';

export default function Dashboard({ ladders, flash }) {
    const [qrModal, setQrModal] = useState(null);

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
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
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

            <div className="min-h-screen">
                <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="k3-card p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Aset</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-slate-900">{ladders.length}</span>
                                <span className="text-xs font-medium text-slate-500">Aktif</span>
                            </div>
                        </div>
                        <div className="k3-card p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status Aman</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-emerald-600">{totalSafe}</span>
                                <span className="text-xs font-medium text-emerald-700">Valid</span>
                            </div>
                        </div>
                        <div className="k3-card p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Perlu Tindak Lanjut</p>
                            <div className="mt-3 flex items-end justify-between">
                                <span className="text-4xl font-bold text-rose-600">{totalUnsafe}</span>
                                <span className="text-xs font-medium text-rose-700">Alert</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Gambaran kondisi</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Status aset saat ini</h2>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                {[
                                    { label: 'Aman dan masih berlaku', value: totalSafe, color: 'bg-emerald-500' },
                                    { label: 'Perlu pemeriksaan ulang', value: ladders.filter((ladder) => getStatus(ladder) === 'expired').length, color: 'bg-amber-500' },
                                    { label: 'Tidak aman', value: totalUnsafe, color: 'bg-rose-500' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <span className={`h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                                        <span className="flex-1 text-slate-600">{item.label}</span>
                                        <span className="font-semibold text-slate-900">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">Aktivitas terakhir</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Pemeriksaan terbaru</h2>
                                </div>
                                <ClipboardCheck className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="mt-3 divide-y divide-slate-100">
                                {ladders.filter((ladder) => ladder.latest_inspection).slice(0, 3).map((ladder) => (
                                    <Link key={ladder.id} href={route('ladders.show', ladder.uuid)} className="flex items-center gap-3 py-3 hover:text-[var(--k3-brand-strong)]">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">{ladder.location}</p>
                                            <p className="text-xs text-slate-500">{ladder.type}</p>
                                        </div>
                                        <span className="text-xs text-slate-500">{new Date(ladder.latest_inspection.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                                    </Link>
                                ))}
                                {ladders.filter((ladder) => ladder.latest_inspection).length === 0 && (
                                    <p className="py-4 text-sm text-slate-500">Belum ada pemeriksaan tercatat.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Daftar Aset */}
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Daftar Data</p>
                                <h3 className="text-lg font-bold text-slate-900">Aset Tangga</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => window.location.href = route('ladders.create')}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)]"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Tambah aset
                            </button>
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
                                                id="printable-modal-qr"
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