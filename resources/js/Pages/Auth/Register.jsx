import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserCheck, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'pic_safety',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Buat Akun Baru" />

            <div className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--k3-muted)] text-center">
                    Pilih Peran Akun
                </p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--k3-bg)] p-1.5 border border-[var(--k3-line)]">
                    <button
                        type="button"
                        onClick={() => setData('role', 'pic_safety')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                            data.role === 'pic_safety'
                                ? 'bg-white text-[var(--k3-brand-strong)] shadow-sm'
                                : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                        }`}
                    >
                        <UserCheck className={`w-4 h-4 ${data.role === 'pic_safety' ? 'text-[var(--k3-brand)]' : 'text-slate-400'}`} />
                        PIC Safety
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('role', 'inspector')}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold transition-all ${
                            data.role === 'inspector'
                                ? 'bg-white text-[var(--k3-brand-strong)] shadow-sm'
                                : 'text-[var(--k3-muted)] hover:text-[var(--k3-navy)]'
                        }`}
                    >
                        <ShieldCheck className={`w-4 h-4 ${data.role === 'inspector' ? 'text-[var(--k3-brand)]' : 'text-slate-400'}`} />
                        Inspektor K3
                    </button>
                </div>
                <p className="mt-2 text-center text-xs text-[var(--k3-muted)]">
                    {data.role === 'pic_safety'
                        ? 'Daftar sebagai PIC pelaksana inspeksi & penanggung jawab tangga.'
                        : 'Daftar sebagai Inspektor EHS penilai kelayakan keselamatan tangga.'}
                </p>
                {errors.role && <InputError message={errors.role} className="mt-1 text-center" />}
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)] mb-1">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <UserIcon className="h-4 w-4" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            placeholder="Contoh: Muhammad Riksa"
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="name"
                            autoFocus
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)] mb-1">
                        Alamat Email
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
                            placeholder="nama@wilmar.co.id"
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)] mb-1">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="Minimal 8 karakter"
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-[var(--k3-navy)] mb-1">
                        Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Lock className="h-4 w-4" />
                        </div>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Ulangi kata sandi"
                            className="block w-full rounded-xl border border-[var(--k3-line)] bg-[var(--k3-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--k3-navy)] placeholder-slate-400 focus:border-[var(--k3-brand)] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[var(--k3-brand)] transition"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--k3-navy)] py-3 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[var(--k3-brand-strong)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Daftar Akun {data.role === 'pic_safety' ? 'PIC Safety' : 'Inspektor'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="text-center pt-2">
                    <span className="text-xs text-[var(--k3-muted)]">Sudah punya akun? </span>
                    <Link
                        href={route('login')}
                        className="text-xs font-bold text-[var(--k3-brand)] hover:text-[var(--k3-brand-strong)] underline"
                    >
                        Masuk di sini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
