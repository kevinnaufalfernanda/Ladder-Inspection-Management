import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    LayoutGrid,
    Database,
    RotateCcw,
    CheckCheck,
    Settings,
    LogOut,
    User as UserIcon,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    Trash2,
    X,
    ExternalLink,
    Menu,
    MapPin,
    Check,
    ShieldCheck,
    Sliders,
} from 'lucide-react';

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

export default function AuthenticatedLayout({ children, breadcrumb, breadcrumbs }) {
    const user = usePage().props.auth?.user;
    const recentNotifications = usePage().props.recent_notifications;
    const pageNotifications = usePage().props.notifications;

    const notifications = Array.isArray(recentNotifications)
        ? recentNotifications
        : Array.isArray(pageNotifications)
        ? pageNotifications
        : (pageNotifications?.data && Array.isArray(pageNotifications.data))
        ? pageNotifications.data
        : [];

    const unreadCount = usePage().props.unread_notifications_count || 0;
    const pendingReviewsCount = usePage().props.pending_reviews_count || 0;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('safeladder_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [filterTab, setFilterTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userMenuRef = useRef(null);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('safeladder_sidebar_collapsed', String(next));
            }
            return next;
        });
    };

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

    const roleLabel = user?.role === 'admin'
        ? 'Admin EHS'
        : user?.role === 'inspector'
        ? 'Inspektor EHS'
        : 'PIC Safety';

    // Penentuan breadcrumb hirarkis otomatis & interaktif jika tidak disediakan manual
    const resolvedBreadcrumbs = (() => {
        if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
            return breadcrumbs.map((c) => (typeof c === 'string' ? { label: c } : c));
        }

        try {
            if (breadcrumb) {
                if (breadcrumb === 'Detail Aset') {
                    return [
                        { label: 'Data Aset', href: route('ladders.index') },
                        { label: 'Detail Aset' },
                    ];
                }
                if (breadcrumb === 'Tambah Aset' || breadcrumb === 'Identifikasi Aset') {
                    return [
                        { label: 'Data Aset', href: route('ladders.index') },
                        { label: 'Tambah Aset' },
                    ];
                }
                if (breadcrumb === 'Formulir Inspeksi') {
                    return [
                        { label: 'Data Aset', href: route('ladders.index') },
                        { label: 'Formulir Inspeksi' },
                    ];
                }
                if (breadcrumb === 'Perbaikan Aset') {
                    return [
                        { label: 'Data Aset', href: route('ladders.index') },
                        { label: 'Perbaikan Aset' },
                    ];
                }
                if (breadcrumb === 'Detail Review') {
                    return [
                        { label: 'Review Aset', href: route('inspections.review.queue') },
                        { label: 'Detail Review' },
                    ];
                }
                if (breadcrumb === 'Pusat Notifikasi') {
                    return [{ label: 'Pusat Notifikasi' }];
                }
                return [{ label: breadcrumb }];
            }

            if (route().current('ladders.show')) {
                return [
                    { label: 'Data Aset', href: route('ladders.index') },
                    { label: 'Detail Aset' },
                ];
            }
            if (route().current('ladders.create')) {
                return [
                    { label: 'Data Aset', href: route('ladders.index') },
                    { label: 'Tambah Aset' },
                ];
            }
            if (route().current('inspections.create')) {
                return [
                    { label: 'Data Aset', href: route('ladders.index') },
                    { label: 'Formulir Inspeksi' },
                ];
            }
            if (route().current('inspections.correction')) {
                return [
                    { label: 'Data Aset', href: route('ladders.index') },
                    { label: 'Perbaikan Aset' },
                ];
            }
            if (route().current('inspections.review')) {
                return [
                    { label: 'Review Aset', href: route('inspections.review.queue') },
                    { label: 'Detail Review' },
                ];
            }
            if (route().current('ladders.index')) return [{ label: 'Data Aset' }];
            if (route().current('inspections.history')) return [{ label: 'Riwayat Aset' }];
            if (route().current('inspections.review.queue')) return [{ label: 'Review Aset' }];
            if (route().current('settings.*')) return [{ label: 'Pengaturan' }];
            if (route().current('profile.edit')) return [{ label: 'Profil Pengguna' }];
        } catch (e) {
            // fallback
        }
        return [{ label: 'Dashboard' }];
    })();

    // Navigasi menu utama SafeLadder
    const navItems = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutGrid,
        },
        {
            name: 'Data Aset',
            href: route('ladders.index'),
            active:
                route().current('ladders.*') ||
                route().current('inspections.create') ||
                route().current('inspections.correction'),
            icon: Database,
        },
        {
            name: 'Riwayat Aset',
            href: route('inspections.history'),
            active: route().current('inspections.history'),
            icon: RotateCcw,
        },
        {
            name: 'Review Aset',
            href: route('inspections.review.queue'),
            active: route().current('inspections.review*'),
            icon: CheckCheck,
            badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
            visible: user?.role !== 'pic_safety',
        },
        {
            name: 'Pengaturan',
            href: route('settings.index'),
            active: route().current('settings.*'),
            icon: Settings,
            visible: user?.role !== 'pic_safety',
        },
    ].filter((item) => item.visible !== false);

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
        <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased">
            <div className="flex flex-1 w-full">

                {/* ========================================================================= */}
                {/* 1. SIDEBAR KIRI (DESKTOP) DENGAN SENTUHAN INTERAKTIF COLLAPSE/EXPAND     */}
                {/* ========================================================================= */}
                <aside
                    className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out shrink-0 z-30 sticky top-0 h-screen ${
                        isCollapsed ? 'w-20' : 'w-64'
                    }`}
                >
                    {/* Header Sidebar: Brand SafeLadder & Toggle */}
                    <div className={`h-16 flex items-center border-b border-slate-100 ${
                        isCollapsed ? 'justify-center' : 'justify-between px-5'
                    }`}>
                        {!isCollapsed ? (
                            <>
                                <Link href={route('dashboard')} className="flex items-center gap-1 group">
                                    <span className="text-xl font-black tracking-tight text-[#0f172a] group-hover:text-amber-600 transition">
                                        Safe
                                    </span>
                                    <span className="text-xl font-black tracking-tight text-[#f59e0b]">
                                        Ladder
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={toggleSidebar}
                                    title="Ciutkan Menu Sidebar"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs cursor-pointer active:scale-95"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                title="Buka / Perluas Menu Sidebar"
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs cursor-pointer active:scale-95"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Daftar Menu Navigasi Utama */}
                    <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    title={isCollapsed ? item.name : undefined}
                                    className={`relative flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                                        item.active
                                            ? 'bg-[#fff8eb] text-[#854d0e] font-bold shadow-2xs border border-amber-200/70'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                >
                                    <IconComponent
                                        className={`h-5 w-5 shrink-0 transition-transform ${
                                            item.active ? 'text-[#f59e0b] scale-105' : 'text-slate-400'
                                        }`}
                                    />
                                    {!isCollapsed && (
                                        <span className="truncate flex-1">{item.name}</span>
                                    )}
                                    {!isCollapsed && item.badge && (
                                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isCollapsed && item.badge && (
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* ========================================================================= */}
                {/* 2. AREA WORKSPACE KANAN                                                   */}
                {/* ========================================================================= */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Top Header Bar */}
                    <header className="h-16 bg-[#f8fafc] border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
                        {/* Kiri: Breadcrumb Navigasi & Mobile Toggle */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-white border border-slate-200 transition cursor-pointer"
                                aria-label="Buka Menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <Link
                                    href={route('dashboard')}
                                    className="hover:text-slate-700 hover:underline transition"
                                    title="Kembali ke Dashboard Workspace"
                                >
                                    Workspace
                                </Link>
                                {resolvedBreadcrumbs.map((crumb, idx) => {
                                    const isLast = idx === resolvedBreadcrumbs.length - 1;
                                    return (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <span className="text-slate-300">/</span>
                                            {crumb.href && !isLast ? (
                                                <Link
                                                    href={crumb.href}
                                                    className="hover:text-slate-700 hover:underline transition"
                                                    title={`Kembali ke ${crumb.label}`}
                                                >
                                                    {crumb.label}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-slate-800">
                                                    {crumb.label}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Kanan: Notifikasi & User Dropdown */}
                        <div className="flex items-center gap-3">

                            {/* Tombol Notifikasi Cepat */}
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen((prev) => !prev)}
                                className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 group ${
                                    notificationsOpen
                                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs ring-2 ring-amber-300 ring-offset-1'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/70 hover:text-amber-800'
                                }`}
                                title={notificationsOpen ? 'Tutup Notifikasi' : 'Lihat Notifikasi K3'}
                                aria-label="Notifikasi K3"
                            >
                                <Bell className={`h-4 w-4 transition-transform duration-200 ${
                                    notificationsOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'
                                }`} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white shadow-xs animate-pulse">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Pill Akun Pengguna */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white pl-2.5 pr-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--sl-navy)] text-amber-400 text-xs font-black">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="font-bold text-slate-900 text-xs leading-none">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                                            {roleLabel} • PT Wilmar Nabati
                                        </p>
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 sl-animate-pop-in">
                                        <div className="px-3 py-2.5 border-b border-slate-100">
                                            <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                                            <span className="mt-1.5 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                                                {roleLabel}
                                            </span>
                                        </div>

                                        <div className="py-1 space-y-0.5">
                                            <Link
                                                href={route('profile.edit')}
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                            >
                                                <UserIcon className="h-4 w-4 text-slate-400" /> Profil Pengguna
                                            </Link>
                                            {user?.role !== 'pic_safety' && (
                                                <Link
                                                    href={route('settings.index')}
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                                >
                                                    <Sliders className="h-4 w-4 text-slate-400" /> Pengaturan Sistem
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 pt-1">
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                                            >
                                                <LogOut className="h-4 w-4 text-rose-500" /> Keluar Sesi
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </header>

                    {/* Konten Halaman */}
                    <main className="flex-1">
                        {children}
                    </main>

                    {/* Footer Standar SafeLadder Sesuai Gambar */}
                    <footer className="px-6 sm:px-8 py-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-medium">
                        <div>
                            SafeLadder • Sistem monitoring keselamatan kerja tangga
                        </div>
                        <div>
                            Standar F-GRK/EHS Wilmar
                        </div>
                    </footer>

                </div>
            </div>

            {/* ========================================================================= */}
            {/* DRAWER MENU MOBILE (< lg)                                                */}
            {/* ========================================================================= */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-72 bg-white h-full flex flex-col p-5 shadow-2xl z-10 animate-in slide-in-from-left">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-black text-[#0f172a]">Safe</span>
                                <span className="text-xl font-black text-[#f59e0b]">Ladder</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="mt-4 space-y-1.5 flex-1">
                            {navItems.map((item) => {
                                const IconComp = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                                            item.active
                                                ? 'bg-[#fff8eb] text-[#854d0e] font-bold border border-amber-200'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconComp className={`h-5 w-5 ${item.active ? 'text-[#f59e0b]' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-4 border-t border-slate-100">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut className="h-4 w-4" /> Keluar
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FLOATING NOTIFICATIONS DRAWER                                             */}
            {/* ========================================================================= */}
            {notificationsOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs sl-animate-fade-in"
                        onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="fixed top-3 right-3 bottom-3 z-50 w-[420px] max-w-[calc(100vw-1.5rem)] rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden sl-animate-drawer-in">
                        <div className="bg-slate-50/80 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-black text-slate-900">Notifikasi K3</h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                                {unreadCount} baru
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500">Log aktivitas inspeksi dan review K3</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filter tabs & Tandai Semua Dibaca */}
                        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('all')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer transition active:scale-95 ${
                                        filterTab === 'all'
                                            ? 'bg-[#0f172a] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Semua ({notifications.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('unread')}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer transition active:scale-95 ${
                                        filterTab === 'unread'
                                            ? 'bg-[#0f172a] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Belum Dibaca ({unreadCount})
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <Link
                                    href={route('notifications.markAllRead')}
                                    method="post"
                                    as="button"
                                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                                    title="Tandai seluruh notifikasi telah dibaca"
                                >
                                    Tandai semua dibaca
                                </Link>
                            )}
                        </div>

                        {/* Notification list */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {filteredNotifications.length === 0 ? (
                                <div className="py-16 text-center space-y-2">
                                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-slate-600">
                                        Tidak ada notifikasi {filterTab === 'unread' ? 'yang belum dibaca' : ''}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Aktivitas inspeksi dan review terbaru akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => {
                                    const meta = getNotificationMeta(notif);
                                    return (
                                        <Link
                                            key={notif.id}
                                            href={route('notifications.read', notif.id)}
                                            method="post"
                                            as="button"
                                            onClick={() => setNotificationsOpen(false)}
                                            className={`w-full text-left p-3.5 rounded-2xl transition-all duration-150 flex items-start gap-3 cursor-pointer group active:scale-[0.99] border ${
                                                notif.read_at
                                                    ? 'bg-white hover:bg-slate-50/90 border-slate-100 hover:border-slate-200'
                                                    : 'bg-amber-50/50 hover:bg-amber-50/90 border-amber-200/80 shadow-2xs'
                                            }`}
                                        >
                                            {/* Status Dot */}
                                            <div className="mt-1.5 shrink-0">
                                                {!notif.read_at ? (
                                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                                                ) : (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-slate-300" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold ${meta.badgeClass}`}>
                                                        {meta.tagLabel}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {formatNotificationTime(notif.created_at)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-snug line-clamp-2 ${
                                                    notif.read_at ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'
                                                }`}>
                                                    {notif.data?.message || 'Pemberitahuan K3'}
                                                </p>
                                                <div className="flex items-center justify-between pt-0.5">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 group-hover:text-amber-800">
                                                        <span>Buka halaman terkait</span>
                                                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                                    </span>
                                                    {!notif.read_at && (
                                                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                                            Baru
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
