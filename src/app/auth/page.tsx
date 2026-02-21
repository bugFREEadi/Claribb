'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Loader2, Chrome } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Animated knowledge graph dots ─────────────────────────────────────
function KnowledgeOrb() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animFrame: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Nodes
        const NODES = 28;
        const nodes = Array.from({ length: NODES }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 3 + 1.5,
            hue: Math.random() > 0.5 ? '#E83E8C' : '#A78BD4',
            pulse: Math.random() * Math.PI * 2,
        }));

        // Agent labels
        const agents = [
            { label: 'Recall', x: 0.15, y: 0.25, color: '#E83E8C' },
            { label: 'Explorer', x: 0.78, y: 0.2, color: '#A78BD4' },
            { label: 'Critique', x: 0.18, y: 0.72, color: '#E83E8C' },
            { label: 'Connector', x: 0.75, y: 0.75, color: '#A78BD4' },
        ];

        let t = 0;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t += 0.012;

            // Move nodes
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
                n.pulse += 0.03;
            });

            // Draw edges
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        const alpha = (1 - dist / 110) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(232,62,140,${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach(n => {
                const pulse = 0.6 + 0.4 * Math.sin(n.pulse);
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
                ctx.fillStyle = n.hue;
                ctx.globalAlpha = 0.7 * pulse;
                ctx.fill();

                // Glow
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4 * pulse);
                grad.addColorStop(0, n.hue === '#E83E8C' ? 'rgba(232,62,140,0.3)' : 'rgba(167,139,212,0.3)');
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * 4 * pulse, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 1;
                ctx.fill();
            });

            // Agent labels
            agents.forEach((a, idx) => {
                const ax = a.x * canvas.width;
                const ay = a.y * canvas.height;
                const wave = Math.sin(t + idx * 1.5) * 4;

                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.roundRect(ax - 36, ay + wave - 14, 72, 26, 8);
                ctx.fillStyle = 'rgba(10,10,12,0.85)';
                ctx.fill();
                ctx.strokeStyle = a.color + '55';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = a.color;
                ctx.font = '11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(a.label, ax, ay + wave + 4);
            });

            ctx.globalAlpha = 1;
            animFrame = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animFrame);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Google SVG icon ────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A9 9 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClientSupabaseClient();

    // Handle oauth error from callback
    useEffect(() => {
        if (searchParams.get('error') === 'oauth_error') {
            setError('Google sign-in failed. Please try again.');
        }
    }, [searchParams]);

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/dashboard');
                router.refresh();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                if (error) throw error;
                if (data.session) {
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    setSuccess('✓ Account created! Check your email for a confirmation link.');
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

    return (
        <div className="min-h-screen flex" style={{ background: '#08080a' }}>
            {/* ── LEFT: Animated Knowledge Graph Visualization ── */}
            <div className="hidden lg:flex flex-1 flex-col relative overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `
                        linear-gradient(rgba(232,62,140,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(232,62,140,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '44px 44px',
                }} />

                {/* Animated canvas */}
                <KnowledgeOrb />

                {/* Pink radial glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none" style={{
                    background: 'radial-gradient(ellipse, rgba(232,62,140,0.08) 0%, transparent 70%)',
                }} />

                {/* Top logo */}
                <div className="relative z-10 p-10">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #E83E8C, #A78BD4)',
                            boxShadow: '0 0 24px rgba(232,62,140,0.4)',
                        }}>
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>CLARIBB</span>
                    </Link>
                </div>

                {/* Bottom text */}
                <div className="relative z-10 p-10 mt-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">
                            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Research that</span><br />
                            <span style={{
                                background: 'linear-gradient(90deg, #E83E8C, #A78BD4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>remembers everything.</span>
                        </h2>
                        <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            Four specialized AI agents. One persistent memory graph. CLARIBB builds a compounding knowledge model — every session makes you sharper.
                        </p>
                        <div className="flex items-center gap-8">
                            {[['4', 'AI Agents'], ['100+', 'Depth score scale'], ['<1s', 'Memory recall']].map(([val, label]) => (
                                <div key={label}>
                                    <div className="text-xl font-bold" style={{
                                        background: 'linear-gradient(90deg, #E83E8C, #A78BD4)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}>{val}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Edge fade overlay */}
                <div className="absolute inset-y-0 right-0 w-24 pointer-events-none" style={{
                    background: 'linear-gradient(to right, transparent, #08080a)',
                }} />
            </div>

            {/* ── RIGHT: Auth Form ── */}
            <div className="flex-1 flex items-center justify-center p-8" style={{
                background: '#0a0a0c',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
            }}>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden w-fit">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, #E83E8C, #A78BD4)',
                        }}>
                            <Brain className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>CLARIBB</span>
                    </Link>

                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Get started'}
                    </h1>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {mode === 'login' ? 'Your research memory is waiting.' : 'Create your intelligence workspace.'}
                    </p>

                    {/* Google Sign-In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 mb-6"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.85)',
                        }}
                    >
                        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>or continue with email</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Tab toggle */}
                    <div className="flex p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {(['login', 'signup'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: mode === m
                                        ? 'linear-gradient(135deg, #E83E8C, #A78BD4)'
                                        : 'transparent',
                                    color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                                    boxShadow: mode === m ? '0 0 20px rgba(232,62,140,0.3)' : 'none',
                                }}
                            >
                                {m === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative"
                                >
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.85)',
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'rgba(232,62,140,0.5)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.85)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(232,62,140,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.85)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(232,62,140,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs" style={{ background: 'rgba(232,62,140,0.08)', border: '1px solid rgba(232,62,140,0.25)', color: '#E83E8C' }}>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-2"
                            style={{
                                background: 'linear-gradient(135deg, #E83E8C, #A78BD4)',
                                boxShadow: '0 0 28px rgba(232,62,140,0.35)',
                            }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        By continuing, you agree to our{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms</span>
                        {' '}and{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy Policy</span>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
