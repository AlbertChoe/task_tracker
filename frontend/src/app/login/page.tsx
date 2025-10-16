'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { saveTokenToCookie } from '@/lib/auth';
import { api } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveTokenToCookie(data.access_token);
      router.push(next);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Team Task Tracker</h1>
          <p className="text-slate-400 text-sm">
            Sign in to access the project manager panel.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/5 shadow-2xl ring-1 ring-white/10 backdrop-blur p-6">
          {error && (
            <div className="mb-4 text-sm rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">Email</label>
              <Input
                type="text"
                inputMode="email"
                autoComplete="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="bg-white/10 border border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-indigo-400/60"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-400 pr-10 focus-visible:ring-indigo-400/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-2 inline-flex items-center px-2 text-slate-300 hover:text-slate-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="opacity-80"
                  >
                    {showPw ? (
                      <path d="M3 3l18 18M10.6 10.7A2 2 0 0012 14a2 2 0 001.4-3.4M9.9 5.5A10.2 10.2 0 0121 12c-1.6 2.8-4.9 5-9 5-1.2 0-2.4-.2-3.5-.6" />
                    ) : (
                      <>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3.2" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium shadow-lg shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-slate-200">
      <div className="animate-pulse text-sm uppercase tracking-[0.3em]">
        Loading...
      </div>
    </div>
  );
}
