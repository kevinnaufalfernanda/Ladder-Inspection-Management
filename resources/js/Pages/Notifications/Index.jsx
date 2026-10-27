import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell, Check, CheckCheck, Clock, ExternalLink, ShieldCheck, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Index({ notifications, unreadCount = 0 }) {
    const [filterTab, setFilterTab] = useState('all'); // 'all', 'unread', 'read'

    const notifList = Array.isArray(notifications)
        ? notifications
        : (notifications?.data && Array.isArray(notifications.data))
        ? notifications.data
        : [];

    const filteredNotifs = notifList.filter((notif) => {
        if (filterTab === 'unread') return !notif.read_at;
        if (filterTab === 'read') return Boolean(notif.read_at);
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Notifikasi K3" />

            <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--k3-line)] pb-5">
                    <div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)] mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pusat Notifikasi K3</h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Log seluruh pemberitahuan pengajuan inspeksi, instruksi perbaikan fisik, dan hasil review K3.
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Link
                            href={route('notifications.markAllRead')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--k3-navy)] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-sm cursor-pointer"
                        >
                            <CheckCheck className="h-4 w-4 text-[var(--k3-accent)]" /> Tandai Semua Telah Dibaca
                        </Link>
                    )}
                </div>

                {/* Filter Tab */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setFilterTab('all')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                filterTab === 'all'
                                    ? 'bg-[var(--k3-navy)] text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Semua Notifikasi ({notifList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('unread')}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                filterTab === 'unread'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                        >
                            Belum Dibaca ({unreadCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab('read')}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                filterTab === 'read'
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Sudah Dibaca ({notifList.filter(n => n.read_at).length})
                        </button>
                    </div>
                </div>

                {/* Daftar Notifikasi */}
                <div className="k3-panel overflow-hidden rounded-2xl">
                    {filteredNotifs.length === 0 ? (
                        <div className="px-6 py-16 text-center text-slate-400">
                            <Bell className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-base font-bold text-slate-700">Tidak ada notifikasi dalam filter ini.</p>
                            <p className="text-xs text-slate-400 mt-1">Pemberitahuan baru akan muncul otomatis saat ada aktivitas workflow K3.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredNotifs.map((notif) => {
                                const isUnread = !notif.read_at;
                                const formattedTime = new Date(notif.created_at).toLocaleString('id-ID', {
                                    dateStyle: 'long',
                                    timeStyle: 'short',
                                });

                                return (
                                    <div
                                        key={notif.id}
                                        className={`flex flex-wrap items-center justify-between gap-4 p-5 transition ${
                                            isUnread ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
                                            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                                                isUnread
                                                    ? 'bg-[var(--k3-navy)] text-[var(--k3-accent)]'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <Bell className="h-5 w-5" />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className={`text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                        {notif.data?.message}
                                                    </p>
                                                    {isUnread ? (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800 border border-emerald-300">
                                                            Belum Dibaca
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                                                            Sudah Dibaca
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                    <Clock className="h-3.5 w-3.5" /> {formattedTime} WIB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={route('notifications.read', notif.id)}
                                                method="post"
                                                as="button"
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--k3-navy)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-sm cursor-pointer"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> Buka / Tindak Lanjuti
                                            </Link>

                                            <Link
                                                href={route('notifications.destroy', notif.id)}
                                                method="delete"
                                                as="button"
                                                className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                                                title="Hapus notifikasi"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications.links && notifications.links.length > 3 && (
                    <div className="flex justify-center gap-1 pt-2">
                        {notifications.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    link.active
                                        ? 'bg-[var(--k3-navy)] text-white'
                                        : link.url
                                        ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        : 'text-slate-400 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
