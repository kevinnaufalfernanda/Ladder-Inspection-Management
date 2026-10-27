<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response
    {
        $role = $request->route('role');

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'loginRole' => $role,
            'loginRoute' => $role ? route('login.role', $role) : route('login'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $requiredRole = $request->route('role');
        if ($requiredRole) {
            $user = Auth::user();
            // Admin diizinkan login sebagai inspektor maupun PIC Safety
            $isAllowed = ($user->role === $requiredRole) || ($user->role === 'admin');

            if (! $isAllowed) {
                Auth::logout();

                throw ValidationException::withMessages([
                    'email' => 'Akun ini terdaftar sebagai '.($user->role === 'pic_safety' ? 'PIC Safety' : 'Inspektor').', silakan pilih tab peran yang sesuai.',
                ]);
            }
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
