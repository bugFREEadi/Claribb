'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── Animated particle graph ───────────────────────────────────────────
function ParticleGraph() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animFrame: number;

        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const NODES = 22;
        const nodes = Array.from({ length: NODES }, () => ({
            x: Math.random(), y: Math.random(),
            vx: (Math.random() - 0.5) * 0.0004,
            vy: (Math.random() - 0.5) * 0.0004,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2,
            bright: Math.random() > 0.7,
        }));

        const LABELS = ['Recall', 'Explorer', 'Critique', 'Connector'];
        const labelPos = [{ rx: 0.12, ry: 0.22 }, { rx: 0.78, ry: 0.18 }, { rx: 0.15, ry: 0.68 }, { rx: 0.75, ry: 0.72 }];
        let t = 0;

        const draw = () => {
            const W = canvas.width, H = canvas.height;
            ctx.clearRect(0, 0, W, H);
            t += 0.01;
            nodes.forEach(n => {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
                if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
                n.pulse += 0.025;
            });
            // Edges
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const ax = nodes[i].x * W, ay = nodes[i].y * H;
                    const bx = nodes[j].x * W, by = nodes[j].y * H;
                    const d = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
                    const MAX = Math.min(W, H) * 0.28;
                    if (d < MAX) {
                        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
                        ctx.strokeStyle = `rgba(200,200,220,${(1 - d / MAX) * 0.16})`; ctx.lineWidth = 0.6; ctx.stroke();
                    }
                }
            }
            // Nodes
            nodes.forEach(n => {
                const p = 0.7 + 0.3 * Math.sin(n.pulse);
                const x = n.x * W, y = n.y * H;
                ctx.beginPath(); ctx.arc(x, y, n.r * p, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200,200,230,${n.bright ? 0.75 * p : 0.4 * p})`; ctx.fill();
            });
            // Labels
            LABELS.forEach((label, i) => {
                const px = labelPos[i].rx * W, py = labelPos[i].ry * H + Math.sin(t + i * 1.3) * 3;
                const pw = ctx.measureText(label).width + 20;
                ctx.beginPath(); ctx.roundRect(px - pw / 2, py - 11, pw, 22, 6);
                ctx.fillStyle = 'rgba(16,16,20,0.85)'; ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.09)'; ctx.lineWidth = 0.75; ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.textAlign = 'center'; ctx.fillText(label, px, py + 4);
            });
            ctx.globalAlpha = 1;
            animFrame = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ── Focused input ───────────────────────────────────────────────────
function AuthInput({ icon: Icon, type, placeholder, value, onChange, required = false, minLength }: {
    icon: React.ElementType; type: string; placeholder: string;
    value: string; onChange: (v: string) => void; required?: boolean; minLength?: number;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: focused ? 'rgba(160,130,220,0.8)' : 'rgba(255,255,255,0.2)' }} />
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={e => onChange(e.target.value)}
                required={required} minLength={minLength}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                    background: focused ? 'rgba(109,78,185,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${focused ? 'rgba(109,78,185,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    color: 'rgba(255,255,255,0.85)',
                    caretColor: '#A07BE0',
                    boxShadow: focused ? '0 0 20px rgba(109,78,185,0.1)' : 'none',
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
        setError(''); setSuccess(''); setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                router.push('/dashboard'); router.refresh();
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
                if (error) throw error;
                if (data.session) { router.push('/dashboard'); router.refresh(); }
                else { setSuccess('✓ Account created! Check your email for a confirmation link.'); setMode('login'); setPassword(''); }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#07070a' }}>

            {/* ── LEFT PANEL ── */}
            <div className="hidden lg:flex flex-1 flex-col overflow-hidden relative" style={{
                background: '#060609',
                borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }} />

                {/* Logo */}
                <div className="relative z-10 p-10 shrink-0">
                    <Link href="/" className="flex items-center gap-3 w-fit">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Brain className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </div>
                        <span className="text-xl font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.82)' }}>CLARIBB</span>
                    </Link>
                </div>

                {/* Canvas — upper portion only */}
                <div className="relative shrink-0" style={{ height: '44%' }}>
                    <ParticleGraph />
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #060609)' }} />
                </div>

                {/* Text — fully below canvas */}
                <div className="relative z-10 px-10 pb-10 flex-1 flex flex-col justify-between">
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.55 }}>
                        <h2 className="text-3xl font-bold mb-3 leading-tight">
                            <span style={{ color: 'rgba(255,255,255,0.88)' }}>Research that</span><br />
                            <span style={{ color: 'rgba(255,255,255,0.38)' }}>remembers everything.</span>
                        </h2>
                        <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
                            Four specialized AI agents. One persistent memory graph. Every session makes you sharper than the last.
                        </p>
                    </motion.div>

                    {/* Quote */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.55 }}
                        className="mt-8 p-5 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="w-4 h-px mb-3" style={{ background: 'rgba(109,78,185,0.6)' }} />
                        <p className="text-sm italic leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.42)' }}>
                            &ldquo;The mind is not a vessel to be filled, but a fire to be kindled — and knowledge compounds when you never forget.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'rgba(109,78,185,0.2)', color: 'rgba(170,145,220,0.8)', border: '1px solid rgba(109,78,185,0.25)' }}>P</div>
                            <div>
                                <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Plutarch</div>
                                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Adapted</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-8">
                        {[['4', 'AI Agents'], ['100+', 'Memory depth'], ['<1s', 'Recall speed']].map(([val, label]) => (
                            <div key={label}>
                                <div className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.65)' }}>{val}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden" style={{ background: '#08080b' }}>
                {/* Top radial glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[380px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(109,78,185,0.1) 0%, transparent 65%)' }} />
                {/* Bottom-right accent */}
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(90,60,160,0.07) 0%, transparent 65%)' }} />

                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm relative z-10">

                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden w-fit">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)' }}>
                            <Brain className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.65)' }} />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.82)' }}>CLARIBB</span>
                    </Link>

                    {/* Brain icon with decorative rings */}
                    <div className="flex justify-center mb-8">
                        <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
                            {/* Faint outer ring */}
                            <div className="absolute rounded-full" style={{ inset: -14, border: '1px solid rgba(109,78,185,0.15)' }} />
                            {/* Mid ring */}
                            <div className="absolute rounded-full" style={{ inset: -7, border: '1px solid rgba(109,78,185,0.22)' }} />
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                                background: 'linear-gradient(135deg, rgba(109,78,185,0.25), rgba(65,42,120,0.2))',
                                border: '1px solid rgba(109,78,185,0.35)',
                                boxShadow: '0 0 36px rgba(109,78,185,0.18)',
                            }}>
                                <Brain className="w-7 h-7" style={{ color: 'rgba(175,148,228,0.9)' }} />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-1.5 text-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Get started'}
                    </h1>
                    <p className="text-sm mb-8 text-center" style={{ color: 'rgba(255,255,255,0.32)' }}>
                        {mode === 'login' ? 'Your research memory is waiting.' : 'Create your intelligence workspace.'}
                    </p>

                    {/* Tab toggle */}
                    <div className="flex p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {(['login', 'signup'] as const).map(m => (
                            <button key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: mode === m ? 'linear-gradient(135deg, rgba(109,78,185,0.45), rgba(80,55,150,0.38))' : 'transparent',
                                    color: mode === m ? 'rgba(200,180,245,0.95)' : 'rgba(255,255,255,0.28)',
                                    border: mode === m ? '1px solid rgba(109,78,185,0.4)' : '1px solid transparent',
                                    boxShadow: mode === m ? '0 0 18px rgba(109,78,185,0.18)' : 'none',
                                }}>
                                {m === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                    <AuthInput icon={User} type="text" placeholder="Full name" value={name} onChange={setName} required />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AuthInput icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
                        <AuthInput icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} required minLength={6} />

                        <AnimatePresence>
                            {error && (
                                <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs" style={{ background: 'rgba(220,60,60,0.07)', border: '1px solid rgba(220,60,60,0.18)', color: 'rgba(255,110,110,0.9)' }}>
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl text-xs" style={{ background: 'rgba(60,200,120,0.07)', border: '1px solid rgba(60,200,120,0.18)', color: 'rgba(90,220,150,0.9)' }}>
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 hover:scale-[1.012] disabled:opacity-40 disabled:hover:scale-100 mt-2"
                            style={{
                                background: 'linear-gradient(135deg, #6D4EB9 0%, #4B2EA8 100%)',
                                border: '1px solid rgba(109,78,185,0.45)',
                                color: 'rgba(220,205,255,0.95)',
                                boxShadow: '0 0 28px rgba(109,78,185,0.22), inset 0 1px 0 rgba(255,255,255,0.07)',
                            }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    {/* Feature pills */}
                    <div className="mt-8 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center justify-center gap-5 flex-wrap">
                            {['Persistent Memory', 'Multi-Agent AI', 'Knowledge Graph'].map(f => (
                                <div key={f} className="flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(109,78,185,0.65)' }} />
                                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.14)' }}>
                        By continuing you agree to our{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.28)' }}>Terms</span>
                        {' '}and{' '}
                        <span className="underline cursor-pointer" style={{ color: 'rgba(255,255,255,0.28)' }}>Privacy Policy</span>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
