'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── Typewriter hook ────────────────────────────────────────────────────
function useTypewriter(phrases: string[], speed = 55) {
    const [display, setDisplay] = useState('');
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const phrase = phrases[phraseIdx];
        let delay = deleting ? speed * 0.5 : speed;
        if (!deleting && charIdx === phrase.length) delay = 1600;
        if (deleting && charIdx === 0) delay = 400;

        const t = setTimeout(() => {
            if (!deleting && charIdx === phrase.length) {
                setDeleting(true);
            } else if (deleting && charIdx === 0) {
                setDeleting(false);
                setPhraseIdx(i => (i + 1) % phrases.length);
            } else {
                setCharIdx(i => i + (deleting ? -1 : 1));
                setDisplay(phrase.slice(0, charIdx + (deleting ? -1 : 1)));
            }
        }, delay);
        return () => clearTimeout(t);
    }, [charIdx, deleting, phraseIdx, phrases, speed]);

    return display;
}

// ── Floating geometric shapes (3 of them) ───────────────────────────
function FloatingShapes() {
    return (
        <>
            {/* Large square — top right */}
            <motion.div
                className="absolute pointer-events-none"
                style={{ top: '9%', right: '7%', width: 82, height: 82 }}
                animate={{ rotate: 360, y: [0, -14, 0] }}
                transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
            >
                <div style={{
                    width: '100%', height: '100%',
                    border: '1.5px solid rgba(232,62,140,0.32)',
                    borderRadius: 10,
                    background: 'rgba(232,62,140,0.045)',
                    boxShadow: '0 0 28px rgba(232,62,140,0.1) inset',
                }} />
            </motion.div>

            {/* Small square — mid left */}
            <motion.div
                className="absolute pointer-events-none"
                style={{ top: '38%', left: '3%', width: 38, height: 38 }}
                animate={{ rotate: -360, y: [0, -10, 0] }}
                transition={{ rotate: { duration: 14, repeat: Infinity, ease: 'linear' }, y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            >
                <div style={{
                    width: '100%', height: '100%',
                    border: '1px solid rgba(232,62,140,0.2)',
                    borderRadius: 5,
                    background: 'rgba(232,62,140,0.03)',
                }} />
            </motion.div>

            {/* Tiny diamond — bottom right area */}
            <motion.div
                className="absolute pointer-events-none"
                style={{ bottom: '22%', right: '14%', width: 24, height: 24 }}
                animate={{ rotate: 360, y: [0, -8, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{ rotate: { duration: 9, repeat: Infinity, ease: 'linear' }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }, opacity: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
            >
                <div style={{
                    width: '100%', height: '100%',
                    border: '1px solid rgba(232,62,140,0.45)',
                    borderRadius: 3,
                    background: 'rgba(232,62,140,0.08)',
                    transform: 'rotate(45deg)',
                }} />
            </motion.div>
        </>
    );
}

// ── Input ─────────────────────────────────────────────────────────────
function AuthInput({ icon: Icon, type, placeholder, value, onChange, required = false, minLength }: {
    icon: React.ElementType; type: string; placeholder: string;
    value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                style={{ color: focused ? 'rgba(232,62,140,0.7)' : 'rgba(255,255,255,0.2)' }} />
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                required={required} minLength={minLength}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused ? 'rgba(232,62,140,0.45)' : 'rgba(255,255,255,0.09)'}`,
                    color: 'rgba(255,255,255,0.85)',
                    caretColor: '#E83E8C',
                    boxShadow: focused ? '0 0 16px rgba(232,62,140,0.08)' : 'none',
                }}
            />
        </div>
    );
}

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

    const typewriter = useTypewriter([
        'Remembering your research…',
        'Building your knowledge graph…',
        'Connecting your ideas…',
        'Your intelligence, compounding…',
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/dashboard'); router.refresh();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email, password, options: { data: { full_name: name } }
                });
                if (error) throw error;
                if (data.session) { router.push('/dashboard'); router.refresh(); }
                else { setSuccess('✓ Account created! Check your email for a confirmation link.'); setMode('login'); setPassword(''); }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col lg:flex-row relative" style={{ background: '#09090c' }}>

            {/* ── LEFT: Brand panel ── */}
            <div className="flex-1 flex flex-col relative overflow-hidden px-10 py-8 lg:px-14 lg:py-8">
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
                    backgroundSize: '52px 52px',
                }} />
                {/* Pink bottom radial */}
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none" style={{
                    background: 'radial-gradient(ellipse at bottom left, rgba(232,62,140,0.07) 0%, transparent 65%)',
                }} />

                {/* Floating geometric shapes */}
                <FloatingShapes />

                {/* Logo */}
                <div className="relative z-10 mb-7">
                    <Link href="/" className="flex items-center gap-2.5 w-fit">
                        <div className="w-2 h-2 rounded-full" style={{ background: '#E83E8C', boxShadow: '0 0 8px rgba(232,62,140,0.8)' }} />
                        <span className="text-sm font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>CLARIBB</span>
                    </Link>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-between max-w-lg">
                    {/* Headline */}
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-bold leading-[1.1] mb-4"
                            style={{ color: 'rgba(255,255,255,0.92)' }}
                        >
                            Your research,<br />
                            <span style={{ color: 'rgba(255,255,255,0.88)' }}>permanently</span><br />
                            <span style={{ color: 'rgba(255,255,255,0.88)' }}>remembered.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                            className="text-xs leading-relaxed max-w-sm"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                            CLARIBB builds a persistent model of your knowledge — deploying four specialized agents that think, search, challenge, and connect on your behalf.
                        </motion.p>

                        {/* Agent live-feed card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-6 max-w-sm rounded-2xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E83E8C' }}
                                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                                <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>What CLARIBB does</span>
                            </div>
                            <div className="px-4 py-3 space-y-2.5">
                                {[
                                    { label: 'Recall', desc: 'Surfaces memories from past sessions', color: '#E83E8C', delay: 0 },
                                    { label: 'Explorer', desc: 'Searches the web, expands context', color: '#a855f7', delay: 0.4 },
                                    { label: 'Critique', desc: 'Identifies gaps, biases, blind spots', color: '#3b82f6', delay: 0.8 },
                                    { label: 'Connector', desc: 'Links ideas across sessions', color: '#10b981', delay: 1.2 },
                                ].map(a => (
                                    <div key={a.label} className="flex items-start gap-2.5">
                                        <motion.div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: a.color }}
                                            animate={{ opacity: [1, 0.25, 1], scale: [1, 0.7, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: a.delay }} />
                                        <div>
                                            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{a.label}</span>
                                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}> — {a.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="flex items-center gap-8 mt-6"
                    >
                        {[['247', '#E83E8C', 'Memories Indexed'], ['31', 'rgba(255,255,255,0.75)', 'Sessions Analyzed'], ['74', 'rgba(255,255,255,0.75)', 'Depth Score']].map(([val, color, label]) => (
                            <div key={label}>
                                <div className="text-2xl font-bold" style={{ color }}>{val}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── RIGHT: Floating auth card ── */}
            <div className="lg:w-[480px] shrink-0 flex items-center justify-center p-8 relative">
                {/* Subtle right bg */}
                <div className="absolute inset-0 pointer-events-none lg:hidden" style={{ background: '#09090c' }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }}
                    className="w-full max-w-sm rounded-3xl p-8 relative"
                    style={{
                        background: 'rgba(18,18,22,0.95)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                >
                    {/* Card top bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E83E8C', boxShadow: '0 0 6px rgba(232,62,140,0.9)' }} />
                            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>CLARIBB</span>
                        </div>
                        {/* Typewriter */}
                        <div className="flex items-center gap-1" style={{ color: '#E83E8C' }}>
                            <span className="text-[10px] font-medium">{typewriter}</span>
                            <motion.span
                                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                                className="inline-block w-px h-3 ml-0.5" style={{ background: '#E83E8C' }}
                            />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.92)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Get started'}
                    </h2>
                    <p className="text-xs mb-7" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {mode === 'login' ? 'Your research memory is waiting.' : 'Create your intelligence workspace.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                    <AuthInput icon={User} type="text" placeholder="Full name" value={name} onChange={setName} required />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <AuthInput icon={Mail} type="email" placeholder="name@company.com" value={email} onChange={setEmail} required />
                        <AuthInput icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />

                        <AnimatePresence>
                            {error && (
                                <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs"
                                    style={{ background: 'rgba(220,60,60,0.07)', border: '1px solid rgba(220,60,60,0.2)', color: 'rgba(255,110,110,0.9)' }}>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs"
                                    style={{ background: 'rgba(60,200,120,0.07)', border: '1px solid rgba(60,200,120,0.2)', color: 'rgba(90,220,150,0.9)' }}>
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 hover:scale-[1.015] disabled:opacity-40 disabled:hover:scale-100"
                            style={{
                                background: 'linear-gradient(135deg, #E83E8C 0%, #c0216a 100%)',
                                color: 'white',
                                boxShadow: '0 0 28px rgba(232,62,140,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                            }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    {/* Mode switch text */}
                    <p className="text-center text-[11px] mt-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {mode === 'login' ? (
                            <>Don&apos;t have an account?{' '}
                                <button onClick={() => { setMode('signup'); setError(''); }}
                                    className="font-semibold transition-colors hover:opacity-80"
                                    style={{ color: '#E83E8C' }}>Sign up</button>
                            </>
                        ) : (
                            <>Already have an account?{' '}
                                <button onClick={() => { setMode('login'); setError(''); }}
                                    className="font-semibold transition-colors hover:opacity-80"
                                    style={{ color: '#E83E8C' }}>Sign in</button>
                            </>
                        )}
                    </p>

                    <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.15)' }}>
                        By continuing, you agree to our{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.28)' }}>Terms</span>
                        {' '}and{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.28)' }}>Privacy Policy</span>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
