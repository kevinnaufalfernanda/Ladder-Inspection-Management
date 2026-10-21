import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Menu, X, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Navbar - full width, deep navy */}
            <nav className="sticky top-0 z-50 w-full bg-slate-900 shadow-lg">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Brand / Logo Stacked (Sangat Dempet Atas Bawah & Tanpa Hover Color Change) */}
                        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                            <div className="flex flex-col text-left leading-none">
                                <span className="text-sm sm:text-base font-extrabold tracking-tight text-white m-0 p-0">
                                    Ladder Inspection
                                </span>
                                <span className="text-[10px] sm:text-xs font-light tracking-widest uppercase text-emerald-400 m-0 p-0">
                                    Management
                                </span>
                            </div>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-1 sm:flex">
                            <Link
                                href={route('dashboard')}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                                    route().current('dashboard')
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('ladders.index')}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                                    route().current('ladders.*')
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Data Aset
                            </Link>
                            <Link
                                href="/inspections/history"
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                                    window.location.pathname.includes('/inspections/history')
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                Riwayat Inspeksi
                            </Link>
                        </div>

                        {/* User menu */}
                        <div className="hidden sm:block relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600">
                                    <UserIcon className="h-3.5 w-3.5 text-slate-200" />
                                </div>
                                <span>{user.name}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white sm:hidden cursor-pointer"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="border-t border-white/10 bg-slate-800 sm:hidden">
                        <div className="space-y-1 px-4 py-3">
                            <Link href={route('dashboard')} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
                                Dashboard
                            </Link>
                            <Link href={route('ladders.index')} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
                                Data Aset
                            </Link>
                            <Link href="/inspections/history" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
                                Riwayat Inspeksi
                            </Link>
                            <Link href={route('profile.edit')} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
                                Profil Saya
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300 hover:bg-white/5 cursor-pointer">
                                <LogOut className="h-4 w-4" /> Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            <main>{children}</main>
        </div>
    );
}