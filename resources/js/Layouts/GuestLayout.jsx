import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-6 sm:justify-center sm:pt-0 font-sans">
            {/* Logo Header Utama di Luar Kotak */}
            <div className="mb-6">
                <Link href="/" className="flex flex-col items-center text-center cursor-pointer group">
                    <div className="flex flex-col text-center leading-none">
                        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 m-0 p-0">
                            Ladder Inspection
                        </span>
                        <span className="mt-1 text-sm sm:text-base font-bold tracking-widest uppercase text-emerald-600 m-0 p-0">
                            Management
                        </span>
                    </div>
                </Link>
            </div>

            <div className="w-full overflow-hidden bg-white px-6 py-8 shadow-xl border border-slate-100 sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}