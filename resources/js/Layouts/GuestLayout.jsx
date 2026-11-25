import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f8fafc] font-sans">
            {/* SafeLadder Brand */}
            <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-black tracking-tight text-[#0f172a]">
                        Safe<span className="text-[#f59e0b]">Ladder</span>
                    </span>
                </Link>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                    Sistem Monitoring & Inspeksi Keselamatan Kerja Tangga
                </p>
            </div>

            {/* Kotak Card Form Bertema SafeLadder */}
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-400">
                SafeLadder • Standar F-GRK/EHS Wilmar
            </div>
        </div>
    );
}
