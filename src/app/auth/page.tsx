'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── Animated particle graph — top-half canvas only ────────────────────
function ParticleGraph() {
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

        const NODES = 22;
        const nodes = Array.from({ length: NODES }, () => ({
            x: Math.random() * 1,   // relative 0-1
            y: Math.random() * 1,
            vx: (Math.random() - 0.5) * 0.0004,
            vy: (Math.random() - 0.5) * 0.0004,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2,
            bright: Math.random() > 0.7, // some nodes brighter
        }));

        const LABELS = ['Recall', 'Explorer', 'Critique', 'Connector'];
        const labelPos = [
            { rx: 0.12, ry: 0.2 },
            { rx: 0.78, ry: 0.15 },
            { rx: 0.15, ry: 0.7 },
            { rx: 0.75, ry: 0.72 },
        ];

        let t = 0;
        const draw = () => {
            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            t += 0.01;

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
                if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
                n.pulse += 0.025;
            });

            // Edges
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const ax = nodes[i].x * W, ay = nodes[i].y * H;
                    const bx = nodes[j].x * W, by = nodes[j].y * H;
                    const dx = ax - bx, dy = ay - by;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    const MAX_D = Math.min(W, H) * 0.28;
                    if (d < MAX_D) {
                        const a = (1 - d / MAX_D) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(ax, ay);
                        ctx.lineTo(bx, by);
                        ctx.strokeStyle = `rgba(200,200,220,${a})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            // Nodes
            nodes.forEach(n => {
                const pulse = 0.7 + 0.3 * Math.sin(n.pulse);
                const x = n.x * W, y = n.y * H;
                const alpha = n.bright ? 0.8 * pulse : 0.45 * pulse;
                ctx.beginPath();
                ctx.arc(x, y, n.r * pulse, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,220,230,${alpha})`;
                ctx.fill();
            });

            // Agent pill labels — positioned in safe zones
            LABELS.forEach((label, i) => {
                const px = labelPos[i].rx * W;
                const py = labelPos[i].ry * H;
                const wave = Math.sin(t + i * 1.3) * 3;
                const fy = py + wave;

                // Pill background
                const pw = ctx.measureText(label).width + 20;
                ctx.beginPath();
                ctx.roundRect(px - pw / 2, fy - 11, pw, 22, 6);
                ctx.fillStyle = 'rgba(18,18,22,0.82)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                ctx.lineWidth = 0.75;
                ctx.stroke();

                ctx.fillStyle = 'rgba(255,255,255,0.55)';
                ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(label, px, fy + 4);
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

    return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ── Input component ────────────────────────────────────────────────────
function AuthInput({
    icon: Icon, type, placeholder, value, onChange, required = false, minLength,
}: {
    icon: React.ElementType; type: string; placeholder: string;
    value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: focused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }} />
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                minLength={minLength}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                    background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    color: 'rgba(255,255,255,0.85)',
                    caretColor: 'white',
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
        <div className="min-h-screen flex" style={{ background: '#080809' }}>

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex flex-1 flex-col overflow-hidden" style={{
                borderRight: '1px solid rgba(255,255,255,0.05)',
                background: '#060608',
            }}>
                {/* Subtle grid */}
                <div className="absolute inset-y-0 left-0 w-[52%] pointer-events-none" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px',
                }} />

                {/* Logo */}
                <div className="relative z-10 p-10 shrink-0">
                    <Link href="/" className="flex items-center gap-3 w-fit group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}>
                            <Brain className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.75)' }} />
                        </div>
                        <span className="text-xl font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>CLARIBB</span>
                    </Link>
                </div>

                {/* Animated graph — upper 55% */}
                <div className="relative shrink-0" style={{ height: '46%' }}>
                    <ParticleGraph />
                    {/* Fade bottom of canvas into background */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{
                        background: 'linear-gradient(to bottom, transparent, #060608)',
                    }} />
                </div>

                {/* Text content — lower area, fully separated from canvas */}
                <div className="relative z-10 px-10 pb-10 flex-1 flex flex-col justify-between">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                        <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
                            Research that<br />
                            <span style={{ color: 'rgba(255,255,255,0.45)' }}>remembers everything.</span>
                        </h2>
                        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            Four specialized AI agents. One persistent memory graph. Every session makes you sharper than the last.
                        </p>
                    </motion.div>

                    {/* Quote / thought */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.6 }}
                        className="mt-8 p-5 rounded-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}
                    >
                        <p className="text-sm italic leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            &ldquo;The mind is not a vessel to be filled, but a fire to be kindled. CLARIBB keeps that fire burning across every session.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>P</div>
                            <div>
                                <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Plutarch</div>
                                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Adapted</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-8">
                        {[['4', 'AI Agents'], ['100+', 'Memory depth'], ['<1s', 'Recall speed']].map(([val, label]) => (
                            <div key={label}>
                                <div className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{val}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Auth Form ── */}
            <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#080809' }}>
                <motion.div
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden w-fit">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Brain className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>CLARIBB</span>
                    </Link>

                    <h1 className="text-2xl font-bold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Get started'}
                    </h1>
                    <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {mode === 'login'
                            ? 'Your research memory is waiting.'
                            : 'Create your intelligence workspace.'}
                    </p>

                    {/* Tab toggle */}
                    <div className="flex p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {(['login', 'signup'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: mode === m ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                                    border: mode === m ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
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
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <AuthInput icon={User} type="text" placeholder="Full name" value={name} onChange={setName} required />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AuthInput icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
                        <AuthInput icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />

                        <AnimatePresence>
                            {error && (
                                <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs"
                                    style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.18)', color: 'rgba(255,120,120,0.9)' }}>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs"
                                    style={{ background: 'rgba(80,200,140,0.07)', border: '1px solid rgba(80,200,140,0.18)', color: 'rgba(100,220,160,0.9)' }}>
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.015] disabled:opacity-40 disabled:hover:scale-100 mt-2"
                            style={{
                                background: 'rgba(255,255,255,0.09)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: 'rgba(255,255,255,0.85)',
                            }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.18)' }}>
                        By continuing you agree to our{' '}
                        <span className="underline cursor-pointer hover:text-white/40 transition-colors">Terms</span>
                        {' '}and{' '}
                        <span className="underline cursor-pointer hover:text-white/40 transition-colors">Privacy Policy</span>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
