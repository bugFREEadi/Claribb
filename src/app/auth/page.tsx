'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const supabase = createClientSupabaseClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    // Surface a cleaner error for unconfigured Supabase
                    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed')) {
                        throw new Error('Cannot connect to auth server. Make sure NEXT_PUBLIC_SUPABASE_URL is set in .env.local');
                    }
                    throw error;
                }
                router.push('/dashboard');
                router.refresh();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                if (error) {
                    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed')) {
                        throw new Error('Cannot connect to auth server. Make sure NEXT_PUBLIC_SUPABASE_URL is set in .env.local');
                    }
                    throw error;
                }
                // Supabase returns a session immediately when email confirmation is DISABLED
                // When email confirmation is ENABLED, data.session is null
                if (data.session) {
                    router.push('/dashboard');
                    router.refresh();
                } else if (data.user && !data.session) {
                    // User created but needs email confirmation
                    setSuccess('✓ Account created! Check your email for a confirmation link, then sign in.');
                    setMode('login');
                    setPassword('');
                } else {
                    setSuccess('✓ Account created! You can now sign in.');
                    setMode('login');
                    setPassword('');
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async () => {
        setLoading(true);
        setError('');
        try {
            // Call server-side API that uses admin client to bypass email confirmation
            const res = await fetch('/api/demo-login', { method: 'POST' });
            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Demo setup failed');
            }

            if (data.token) {
                // Verify the magic link token on the client to get a real session
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    token_hash: data.token,
                    type: 'magiclink',
                });
                if (verifyError) throw verifyError;
            }

            router.push('/dashboard');
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.05) 100%)',
                borderRight: '1px solid var(--border)',
            }}>
                {/* Background grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }} />

                {/* Glow orb */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]"
                    style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                            boxShadow: '0 0 30px rgba(99,102,241,0.6)',
                        }}>
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>SAGE</span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h2 className="text-4xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
                            Your research,<br />
                            <span className="text-gradient">permanently remembered.</span>
                        </h2>
                        <p className="text-lg leading-relaxed mb-12" style={{ color: 'var(--text-secondary)' }}>
                            SAGE builds a persistent model of your knowledge — deploying four specialized agents
                            that think, search, challenge, and connect on your behalf.
                        </p>

                        {/* Testimonial-style quote */}
                        <div className="p-6 rounded-2xl" style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)',
                        }}>
                            <p className="text-base italic mb-4" style={{ color: 'var(--text-secondary)' }}>
                                "SAGE found a connection between my Session 4 notes and a paper I uploaded in Session 12. I wouldn't have seen that in months of solo research."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>A</div>
                                <div>
                                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dr. Arjun Mehta</div>
                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>AI Policy Researcher</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 flex items-center gap-8">
                    {[['247', 'Memories Indexed'], ['31', 'Sessions Analyzed'], ['74', 'Depth Score']].map(([val, label]) => (
                        <div key={label}>
                            <div className="text-2xl font-bold text-gradient">{val}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>SAGE</span>
                    </Link>

                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Start researching'}
                    </h1>
                    <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                        {mode === 'login'
                            ? 'Your research memory is waiting.'
                            : 'Create your intelligence workspace.'}
                    </p>

                    {/* Tab toggle */}
                    <div className="flex p-1 rounded-xl mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        {(['login', 'signup'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: mode === m ? 'var(--accent)' : 'transparent',
                                    color: mode === m ? 'white' : 'var(--text-secondary)',
                                }}
                            >
                                {m === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e' }}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                            }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="relative flex items-center gap-4 my-6">
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>

                    <button
                        onClick={handleDemo}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <Brain className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        Try Demo Account
                    </button>

                    <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
