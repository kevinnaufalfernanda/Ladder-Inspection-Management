import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell, CheckCheck, Clock, ExternalLink, Trash2 } from 'lucide-react';
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
        <AuthenticatedLayout breadcrumb="Pusat Notifikasi">
            <Head title="Pusat Notifikasi K3" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="sl-btn-back"
                            title="Kembali ke Dashboard"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Pusat Notifikasi K3
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                Log pemberitahuan pengajuan inspeksi, instruksi perbaikan fisik, dan hasil review K3.
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <Link
                            href={route('notifications.markAllRead')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition shadow-2xs cursor-pointer active:scale-[0.98]"
                        >
                            <CheckCheck className="h-4 w-4" /> Tandai Semua Dibaca
                        </Link>
                    )}
                </div>

                {/* Filter Tab */}
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            filterTab === 'all'
                                ? 'bg-[#0f172a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Semua ({notifList.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('unread')}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            filterTab === 'unread'
                                ? 'bg-[#0f172a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Belum Dibaca ({unreadCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('read')}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            filterTab === 'read'
                                ? 'bg-[#0f172a] text-white shadow-2xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Sudah Dibaca ({notifList.filter(n => n.read_at).length})
                    </button>
                </div>

                {/* Daftar Notifikasi */}
                <div className="sl-card overflow-hidden">
                    {filteredNotifs.length === 0 ? (
                        <div className="px-6 py-16 text-center text-slate-400">
                            <Bell className="mx-auto h-9 w-9 text-slate-300 mb-2.5" />
                            <p className="text-sm font-semibold text-slate-700">Tidak ada notifikasi dalam filter ini.</p>
                            <p className="text-xs text-slate-400 mt-0.5">Pemberitahuan baru akan muncul otomatis saat ada aktivitas workflow K3.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredNotifs.map((notif) => {
                                const isUnread = !notif.read_at;
                                const formattedTime = new Date(notif.created_at).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                });

                                return (
                                    <div
                                        key={notif.id}
                                        className={`flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 transition ${
                                            isUnread ? 'bg-amber-50/20' : 'hover:bg-slate-50/60'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
                                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
                                                isUnread
                                                    ? 'bg-[#0f172a] text-amber-400'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <Bell className="h-4 w-4" />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className={`text-xs sm:text-sm ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                        {notif.data?.message}
                                                    </p>
                                                    {isUnread && (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                            Baru
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                                                    <Clock className="h-3 w-3" /> {formattedTime} WIB
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={route('notifications.read', notif.id)}
                                                method="post"
                                                as="button"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" /> Buka
                                            </Link>

                                            <Link
                                                href={route('notifications.destroy', notif.id)}
                                                method="delete"
                                                as="button"
                                                className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100 cursor-pointer"
                                                title="Hapus notifikasi"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
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
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                                    link.active
                                        ? 'bg-[#0f172a] text-white'
                                        : link.url
                                        ? 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
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
