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

            {/* TAB SELECTOR ROLE: BERTEMA SAFELADDER */}
            <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Masuk Sebagai
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setSelectedRole('pic_safety')}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            selectedRole === 'pic_safety'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <UserCheck className={`w-4 h-4 ${selectedRole === 'pic_safety' ? 'text-amber-400' : 'text-slate-400'}`} />
                        PIC Safety
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedRole('inspector')}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            selectedRole === 'inspector'
                                ? 'bg-[#0f172a] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <ShieldCheck className={`w-4 h-4 ${selectedRole === 'inspector' ? 'text-amber-400' : 'text-slate-400'}`} />
                        Inspektor K3
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-slate-500">
                    {selectedRole === 'pic_safety'
                        ? 'Pendaftaran aset, inspeksi rutin, & perbaikan fisik tangga.'
                        : 'Review teknis, keputusan ACC/Reject, & label sertifikasi K3.'}
                </p>
            </div>

            {/* FORM LOGIN */}
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
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
                            className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
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
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Kata Sandi
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
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
                            className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0f172a] focus:outline-none transition"
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
                            className="rounded border-slate-300 text-amber-500 shadow-xs focus:ring-amber-500"
                        />
                        <span className="ms-2 text-xs font-medium text-slate-600">
                            Ingat saya
                        </span>
                    </label>

                    <Link
                        href={route('register')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                    >
                        Daftar akun baru
                    </Link>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] py-3 px-4 text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span>Masuk sebagai {selectedRole === 'pic_safety' ? 'PIC Safety' : 'Inspektor'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
