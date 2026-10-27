import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    Menu,
    X,
    LogOut,
    User as UserIcon,
    ChevronDown,
    ShieldCheck,
    Bell,
    Search,
    Trash2,
    Clock,
    ExternalLink,
} from 'lucide-react';

// Format waktu standar K3 Indonesia: e.g. "25 Okt 2026, 18.18 WIB"
function formatNotificationTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return (
        date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' WIB'
    );
}

// Meta badge dan pengirim selaras dengan status K3 pada aplikasi
function getNotificationMeta(notif) {
    const msg = (notif.data?.message || '').toLowerCase();
    const isUnread = !notif.read_at;

    if (msg.includes('koreksi') || msg.includes('tolak') || msg.includes('reject') || msg.includes('tidak aman')) {
        return {
            sender: 'Review K3 (Perlu Koreksi)',
            badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
            tagLabel: 'Perlu Koreksi',
        };
    }

    if (msg.includes('setuju') || msg.includes('approved') || msg.includes('aman') || msg.includes('acc')) {
        return {
            sender: 'Review K3 (Inspeksi Valid)',
            badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            tagLabel: 'Disetujui (ACC)',
        };
    }

    if (msg.includes('pengajuan') || msg.includes('inspeksi') || msg.includes('review')) {
        return {
            sender: 'Pengajuan Inspeksi Baru',
            badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
            tagLabel: 'Menunggu Review',
        };
    }

    return {
        sender: 'Pemberitahuan Sistem K3',
        badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
        tagLabel: isUnread ? 'Belum Dibaca' : 'Sudah Dibaca',
    };
}

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth?.user;
    const recentNotifications = usePage().props.recent_notifications;
    const pageNotifications = usePage().props.notifications;

    // Menjamin notifications selalu berupa array aman
    const notifications = Array.isArray(recentNotifications)
        ? recentNotifications
        : Array.isArray(pageNotifications)
        ? pageNotifications
        : (pageNotifications?.data && Array.isArray(pageNotifications.data))
        ? pageNotifications.data
        : [];

    const unreadCount = usePage().props.unread_notifications_count || 0;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Filter tab: 'all', 'unread', 'read' (selaras dengan filter K3 sebelumnya)
    const [filterTab, setFilterTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userMenuRef = useRef(null);

    // Close user menu on outside click & Escape key
    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setNotificationsOpen(false);
                setUserMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Filter notifikasi sesuai tab 'all', 'unread', 'read' dan search query
    const filteredNotifications = notifications.filter((notif) => {
        if (filterTab === 'unread' && notif.read_at) return false;
        if (filterTab === 'read' && !notif.read_at) return false;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const msg = (notif.data?.message || '').toLowerCase();
            if (!msg.includes(query)) return false;
        }

        return true;
    });

    return (
        <div className="k3-shell font-sans text-[var(--k3-text)]">
            <nav className="k3-topbar sticky top-0 z-40 w-full">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="k3-brand-mark flex h-9 w-9 items-center justify-center rounded-xl shadow-xs">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="leading-none">
                                <span className="block text-sm font-extrabold tracking-tight text-[var(--k3-navy)]">
                                    Ladder Inspection
                                </span>
                                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--k3-brand)]">
                                    Management
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-1 sm:flex">
                            <Link
                                href={route('dashboard')}
                                className={`k3-nav-link rounded-xl px-4 py-2 text-sm font-semibold ${
                                    route().current('dashboard') ? 'k3-nav-link-active' : ''
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('ladders.index')}
                                className={`k3-nav-link rounded-xl px-4 py-2 text-sm font-semibold ${
                                    route().current('ladders.*') ? 'k3-nav-link-active' : ''
                                }`}
                            >
                                Data Aset
                            </Link>
                            <Link
                                href="/inspections/history"
                                className={`k3-nav-link rounded-xl px-4 py-2 text-sm font-semibold ${
                                    window.location.pathname.includes('/inspections/history')
                                        ? 'k3-nav-link-active'
                                        : ''
                                }`}
                            >
                                Riwayat Inspeksi
                            </Link>
                            {(user?.role === 'admin' || user?.role === 'inspector') && (
                                <Link
                                    href={route('inspections.review.queue')}
                                    className={`k3-nav-link rounded-xl px-4 py-2 text-sm font-semibold ${
                                        route().current('inspections.review*') ? 'k3-nav-link-active' : ''
                                    }`}
                                >
                                    Review Inspeksi
                                </Link>
                            )}
                        </div>

                        {/* User menu & Notifikasi Trigger Desktop */}
                        <div className="hidden items-center gap-2 sm:flex">
                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationsOpen(true);
                                    setUserMenuOpen(false);
                                }}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition cursor-pointer ${
                                    notificationsOpen
                                        ? 'border-[var(--k3-brand-strong)] bg-emerald-50 text-[var(--k3-brand-strong)]'
                                        : 'border-[var(--k3-line)] bg-white text-[var(--k3-brand-strong)] hover:border-[var(--k3-brand)]'
                                }`}
                                title="Buka Notifikasi K3"
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Menu Akun Pengguna */}
                            <div ref={userMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUserMenuOpen((prev) => !prev);
                                        setNotificationsOpen(false);
                                    }}
                                    className="flex items-center gap-2 rounded-xl border border-[var(--k3-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--k3-text)] shadow-sm transition hover:border-[var(--k3-brand)] cursor-pointer"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--k3-accent-soft)]">
                                        <UserIcon className="h-3.5 w-3.5 text-[var(--k3-brand-strong)]" />
                                    </div>
                                    <span>{user?.name}</span>
                                    <ChevronDown className="h-3.5 w-3.5 text-[var(--k3-muted)]" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                                        >
                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                            Profil Saya
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Keluar
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Actions: Notifikasi & Hamburger */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(true)}
                                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--k3-line)] bg-white text-[var(--k3-brand-strong)] shadow-sm cursor-pointer"
                                title="Buka Notifikasi K3"
                            >
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--k3-line)] bg-white text-[var(--k3-navy)] cursor-pointer"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="border-t border-white/10 bg-slate-800 sm:hidden">
                        <div className="space-y-1 px-4 py-3">
                            <Link
                                href={route('dashboard')}
                                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('ladders.index')}
                                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                            >
                                Data Aset
                            </Link>
                            <Link
                                href="/inspections/history"
                                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                            >
                                Riwayat Inspeksi
                            </Link>
                            {(user?.role === 'admin' || user?.role === 'inspector') && (
                                <Link
                                    href={route('inspections.review.queue')}
                                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                                >
                                    Review Inspeksi
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setNotificationsOpen(true);
                                    setMobileOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-200 hover:bg-white/5 cursor-pointer"
                            >
                                <span>Pusat Notifikasi K3</span>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <Link
                                href={route('profile.edit')}
                                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
                            >
                                Profil Saya
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300 hover:bg-white/5 cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" /> Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* FLOATING RIGHT NOTIFICATIONS DRAWER (TEMA & TYPOGRAFI K3) */}
            {notificationsOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] transition-opacity animate-in fade-in"
                        onClick={() => setNotificationsOpen(false)}
                    />

                    {/* Floating Panel on the Right */}
                    <div
                        className="fixed top-3 right-3 bottom-3 z-50 w-[420px] sm:w-[460px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-[var(--k3-line)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
                    >
                        {/* Header Panel K3 */}
                        <div className="bg-[var(--k3-surface)] border-b border-[var(--k3-line)] px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="k3-brand-mark flex h-8 w-8 items-center justify-center rounded-xl shadow-xs">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-[var(--k3-navy)]">Notifikasi Masuk</h2>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                {unreadCount} baru
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[var(--k3-muted)]">Log aktivitas inspeksi dan review K3</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                {unreadCount > 0 && (
                                    <Link
                                        href={route('notifications.markAllRead')}
                                        method="post"
                                        as="button"
                                        className="text-xs font-bold text-[var(--k3-brand-strong)] hover:text-[var(--k3-navy)] hover:underline cursor-pointer"
                                    >
                                        Tandai semua dibaca
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setNotificationsOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--k3-line)] bg-white text-slate-500 hover:text-[var(--k3-navy)] hover:border-[var(--k3-brand)] transition cursor-pointer"
                                    title="Tutup Notifikasi"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs (Sesuai K3: Semua, Belum Dibaca, Sudah Dibaca) */}
                        <div className="bg-white border-b border-[var(--k3-line)] px-5 py-3">
                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('all')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                        filterTab === 'all'
                                            ? 'bg-[var(--k3-navy)] text-white shadow-xs'
                                            : 'bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] hover:bg-[var(--k3-accent)]'
                                    }`}
                                >
                                    Semua ({notifications.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('unread')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                        filterTab === 'unread'
                                            ? 'bg-[var(--k3-navy)] text-white shadow-xs'
                                            : 'bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] hover:bg-[var(--k3-accent)]'
                                    }`}
                                >
                                    Belum Dibaca ({unreadCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('read')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                        filterTab === 'read'
                                            ? 'bg-[var(--k3-navy)] text-white shadow-xs'
                                            : 'bg-[var(--k3-accent-soft)] text-[var(--k3-brand-strong)] hover:bg-[var(--k3-accent)]'
                                    }`}
                                >
                                    Sudah Dibaca ({notifications.filter((n) => n.read_at).length})
                                </button>
                            </div>
                        </div>

                        {/* Search Bar K3 */}
                        <div className="bg-[var(--k3-surface)] border-b border-[var(--k3-line)] px-5 py-2.5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari riwayat notifikasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-[var(--k3-line)] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[var(--k3-brand)] focus:ring-1 focus:ring-[var(--k3-brand)] focus:outline-none transition"
                                />
                            </div>
                        </div>

                        {/* List Notifikasi K3 */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-slate-100 space-y-2 bg-[var(--k3-bg)]/40">
                            {filteredNotifications.length === 0 ? (
                                <div className="py-20 text-center text-slate-400">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                                        <Bell className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Tidak ada notifikasi</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {searchQuery || filterTab !== 'all'
                                            ? 'Tidak ada notifikasi yang sesuai filter ini.'
                                            : 'Pemberitahuan baru akan muncul otomatis di sini.'}
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => {
                                    const meta = getNotificationMeta(notif);
                                    const isUnread = !notif.read_at;
                                    const formattedTime = formatNotificationTime(notif.created_at);

                                    return (
                                        <div
                                            key={notif.id}
                                            className={`rounded-xl border p-4 transition shadow-2xs ${
                                                isUnread
                                                    ? 'bg-white border-[var(--k3-brand)]/40 shadow-xs ring-1 ring-[var(--k3-brand)]/15'
                                                    : 'bg-white/80 border-[var(--k3-line)] hover:bg-white'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                                                        isUnread
                                                            ? 'k3-brand-mark'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    <Bell className="h-4 w-4" />
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-xs font-bold text-[var(--k3-navy)]">
                                                            {meta.sender}
                                                        </p>
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-medium">
                                                            <Clock className="h-3 w-3" />
                                                            {formattedTime}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                                        {notif.data?.message}
                                                    </p>

                                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.badgeClass}`}
                                                        >
                                                            {meta.tagLabel}
                                                        </span>

                                                        <div className="flex items-center gap-1.5">
                                                            <Link
                                                                href={route('notifications.read', notif.id)}
                                                                method="post"
                                                                as="button"
                                                                onClick={() => setNotificationsOpen(false)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-[var(--k3-navy)] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[var(--k3-brand-strong)] shadow-xs cursor-pointer"
                                                            >
                                                                Buka / Tindak Lanjuti{' '}
                                                                <ExternalLink className="h-3 w-3 text-[var(--k3-accent)]" />
                                                            </Link>
                                                            <Link
                                                                href={route('notifications.destroy', notif.id)}
                                                                method="delete"
                                                                as="button"
                                                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                                                                title="Hapus notifikasi"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}

            <main>{children}</main>
        </div>
    );
}
