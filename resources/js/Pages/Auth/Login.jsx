import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login({ status, canResetPassword, loginRole, loginRoute }) {
    const [selectedRole, setSelectedRole] = useState(loginRole || 'pic_safety');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        const targetRoute = selectedRole ? route('login.role', selectedRole) : (loginRoute || route('login'));

        post(targetRoute, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={`Masuk ${selectedRole === 'pic_safety' ? 'PIC Safety' : 'Inspektor K3'}`} />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 border border-emerald-200">
                    {status}
                </div>
            )}

            {/* TAB SELECTOR ROLE: BERTEMA INDUSTRIAL K3 */}
            <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--k3-muted)] text-center">
                    Masuk Sebagai
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--k3-bg)] p-1.5 border border-[var(--k3-line)]">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('pic_safety')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                            selectedRole === 'pic_safety'
                                ? 'bg-white text-[var(--k3-brand-strong)] shadow-sm'
                                : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                        }`}
                    >
                        <UserCheck className={`w-4 h-4 ${selectedRole === 'pic_safety' ? 'text-[var(--k3-brand)]' : 'text-slate-400'}`} />
                        PIC Safety
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('inspector')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                            selectedRole === 'inspector'
                                ? 'bg-white text-[var(--k3-brand-strong)] shadow-sm'
                                : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                        }`}
                    >
                        <ShieldCheck className={`w-4 h-4 ${selectedRole === 'inspector' ? 'text-[var(--k3-brand)]' : 'text-slate-400'}`} />
                        Inspektor K3
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-[var(--k3-muted)]">
                    {selectedRole === 'pic_safety'
                        ? 'Pengajuan inspeksi & perbaikan temuan fisik tangga.'
                        : 'Review, approval, dan penerbitan label sertifikasi K3.'}
                </p>
            </div>

            {/* FORM LOGIN */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)] mb-1">
                        Email Akun {selectedRole === 'pic_safety' ? 'PIC Safety' : 'Inspektor'}
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Mail className="h-4 w-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder={selectedRole === 'pic_safety' ? 'pic@example.com' : 'inspector@example.com'}
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)]">
                            Kata Sandi
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-[var(--k3-brand)] hover:text-[var(--k3-brand-strong)] underline"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-[var(--k3-line)] text-[var(--k3-brand)] shadow-sm focus:ring-[var(--k3-brand)]"
                        />
                        <span className="ms-2 text-xs font-medium text-[var(--k3-muted)]">
                            Ingat saya
                        </span>
                    </label>

                    <Link
                        href={route('register')}
                        className="text-xs font-semibold text-[var(--k3-muted)] hover:text-[var(--k3-navy)] underline"
                    >
                        Daftar akun baru
                    </Link>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--k3-navy)] py-3 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--k3-brand-strong)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Masuk sebagai {selectedRole === 'pic_safety' ? 'PIC Safety' : 'Inspektor'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
