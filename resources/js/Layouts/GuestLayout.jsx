import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="k3-shell flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 font-sans">
            {/* Header Brand Seragam dengan Dashboard */}
            <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="k3-brand-mark flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-105">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="text-left leading-none">
                        <span className="block text-xl font-extrabold tracking-tight text-[var(--k3-navy)]">
                            Ladder Inspection
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--k3-brand)]">
                            Management
                        </span>
                    </div>
                </Link>
            </div>

            {/* Kotak Card Form Bertema K3 */}
            <div className="w-full max-w-md rounded-[24px] border border-[var(--k3-line)] bg-white p-6 sm:p-8 shadow-[0_12px_36px_rgba(22,37,31,0.08)]">
                {children}
            </div>
        </div>
    );
}
