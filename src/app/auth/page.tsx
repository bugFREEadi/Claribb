'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════════════
   BORDER EDGE HIGHLIGHT
═══════════════════════════════════════════════════════════════ */
const EDGE_CSS = `
  @keyframes edgeTravel {
    to { stroke-dashoffset: var(--perim-neg); }
  }
  .edge-segment {
    animation: edgeTravel 6s linear infinite;
  }
`;

function InjectCSS({ css }: { css: string }) {
    useEffect(() => {
        const tag = document.createElement('style');
        tag.textContent = css;
        document.head.appendChild(tag);
        return () => { document.head.removeChild(tag); };
    }, [css]);
    return null;
}

function BorderEdge({ cardRef }: { cardRef: React.RefObject<HTMLDivElement | null> }) {
    const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        if (!cardRef.current) return;
        const measure = () => {
            if (!cardRef.current) return;
            setDims({ w: cardRef.current.offsetWidth, h: cardRef.current.offsetHeight });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(cardRef.current);
        return () => ro.disconnect();
    }, [cardRef]);

    if (!dims) return null;
    const { w, h } = dims;
    const r = 16;
    const perim = Math.round(2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r);
    const seg = Math.round(perim * 0.09);
    const gap = perim - seg;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2, overflow: 'hidden', borderRadius: 16 }}>
            <defs>
                <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <rect x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={r} ry={r} fill="none" stroke="rgba(232,62,140,0.10)" strokeWidth="1" />
            <rect className="edge-segment" x={0.75} y={0.75} width={w - 1.5} height={h - 1.5} rx={r} ry={r}
                fill="none" stroke="#E83E8C" strokeWidth="1.5" strokeOpacity="0.72" strokeLinecap="round"
                strokeDasharray={`${seg} ${gap}`} strokeDashoffset="0" filter="url(#neon)"
                style={{ '--perim-neg': `-${perim}px` } as React.CSSProperties} />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════════════════ */
const PHRASES = ['Thinking deeper...', 'Connecting ideas...', 'Creating intelligence...'];

function Typewriter() {
    const [text, setText] = useState('');
    const [idx, setIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [pausing, setPausing] = useState(false);

    useEffect(() => {
        const phrase = PHRASES[idx];
        if (pausing) {
            const t = setTimeout(() => { setPausing(false); setDeleting(true); }, 1200);
            return () => clearTimeout(t);
        }
        if (!deleting) {
            if (text.length < phrase.length) {
                const t = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 72);
                return () => clearTimeout(t);
            }
            setPausing(true);
        } else {
            if (text.length > 0) {
                const t = setTimeout(() => setText(text.slice(0, -1)), 26);
                return () => clearTimeout(t);
            }
            setDeleting(false);
            setIdx(i => (i + 1) % PHRASES.length);
        }
    }, [text, deleting, pausing, idx]);

    return (
        <div style={{ height: 22, display: 'flex', alignItems: 'center', marginBottom: '1.6rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', color: 'rgba(232,62,140,0.6)', fontFamily: 'inherit' }}>
                {text}
            </span>
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ display: 'inline-block', width: 1.5, height: 11, background: '#E83E8C', marginLeft: 3, borderRadius: 1, verticalAlign: 'middle' }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ORBITER — pure CSS (GPU-accelerated, zero JS overhead)
═══════════════════════════════════════════════════════════════ */
const ORBIT_CSS = `
  @keyframes spinCW  { to { transform: rotate(360deg);  } }
  @keyframes spinCCW { to { transform: rotate(-360deg); } }
  .spin-cw  { animation: spinCW  var(--dur, 60s) linear infinite; will-change: transform; }
  .spin-ccw { animation: spinCCW var(--dur, 60s) linear infinite; will-change: transform; }
`;

function CSSOrbiters() {
    return (
        <>
            {/* Large circle — top-left */}
            <div className="spin-ccw" style={{ position: 'absolute', top: -240, left: -240, width: 580, height: 580, ['--dur' as string]: '70s', pointerEvents: 'none' }}>
                <svg width="580" height="580" viewBox="0 0 580 580" fill="none">
                    <circle cx="290" cy="290" r="288" stroke="rgba(232,62,140,0.06)" strokeWidth="1" strokeDasharray="3 20" />
                    <circle cx="290" cy="2" r="3.5" fill="rgba(232,62,140,0.5)" />
                </svg>
            </div>
            {/* Medium circle — bottom-right */}
            <div className="spin-cw" style={{ position: 'absolute', bottom: -210, right: -210, width: 500, height: 500, ['--dur' as string]: '55s', pointerEvents: 'none' }}>
                <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
                    <circle cx="250" cy="250" r="248" stroke="rgba(230,244,239,0.04)" strokeWidth="0.8" strokeDasharray="2 16" />
                    <circle cx="498" cy="250" r="3" fill="rgba(232,62,140,0.38)" />
                </svg>
            </div>
            {/* Small square — top right */}
            <div className="spin-ccw" style={{ position: 'absolute', top: 55, right: 70, width: 150, height: 150, ['--dur' as string]: '32s', pointerEvents: 'none' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                    <rect x="10" y="10" width="130" height="130" fill="rgba(232,62,140,0.04)" stroke="rgba(232,62,140,0.18)" strokeWidth="1" strokeDasharray="5 10" />
                    <circle cx="10" cy="10" r="2.5" fill="rgba(232,62,140,0.55)" />
                </svg>
            </div>
            {/* Triangle — bottom */}
            <div className="spin-cw" style={{ position: 'absolute', top: 160, left: '18%', width: 72, height: 72, ['--dur' as string]: '21s', pointerEvents: 'none' }}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                    <polygon points="36,4 68,64 4,64" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.28)" strokeWidth="1.2" strokeLinejoin="round" />
                    <circle cx="36" cy="4" r="2.5" fill="rgba(239,68,68,0.6)" />
                </svg>
            </div>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════
   INPUT FIELD
═══════════════════════════════════════════════════════════════ */
function Field({ icon: Icon, type, placeholder, value, onChange, right }: {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string; style?: React.CSSProperties }>;
    type: string; placeholder: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    right?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.72rem 0.9rem', borderRadius: 9,
            border: `1px solid ${focused ? 'rgba(232,62,140,0.35)' : '#16231F'}`,
            background: focused ? 'rgba(232,62,140,0.025)' : 'rgba(10,18,16,0.4)',
            transition: 'border 0.18s, background 0.18s, box-shadow 0.18s',
            boxShadow: focused ? '0 0 0 3px rgba(232,62,140,0.05)' : 'none',
        }}>
            <Icon size={13} strokeWidth={1.8} color={focused ? 'rgba(232,62,140,0.65)' : 'rgba(230,244,239,0.2)'}
                style={{ flexShrink: 0, transition: 'color 0.18s' }} />
            <input type={type} placeholder={placeholder} value={value} onChange={onChange}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#E6F4EF', fontSize: '0.82rem', fontFamily: 'inherit' }} />
            {right}
        </div>
    );
}

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [done, setDone] = useState(false);
    const router = useRouter();
    const supabase = createClientSupabaseClient();
    const cardRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setDone(true);
                setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 600);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email, password, options: { data: { full_name: name } }
                });
                if (error) throw error;
                if (data.session) {
                    setDone(true);
                    setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 600);
                } else if (data.user && !data.session) {
                    setSuccess('✓ Account created! Check your email for a confirmation link, then sign in.');
                    setMode('login'); setPassword('');
                } else {
                    setSuccess('✓ Account created! You can now sign in.');
                    setMode('login'); setPassword('');
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally { setLoading(false); }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
            });
            if (error) throw error;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
            setGoogleLoading(false);
        }
    };

    return (
        <>
            <InjectCSS css={EDGE_CSS + ORBIT_CSS} />
            {/* Single scrollable container — no nested flex centering */}
            <div style={{
                minHeight: '100dvh', background: '#000000', color: '#E6F4EF',
                fontFamily: "'Inter', system-ui, sans-serif",
                overflowX: 'hidden', overflowY: 'auto',
                position: 'relative',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: 'max(env(safe-area-inset-top),32px) 16px max(env(safe-area-inset-bottom),40px)',
                boxSizing: 'border-box',
            } as React.CSSProperties}>
                {/* Ambient top glow */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 30% at 50% 0%, rgba(232,62,140,0.05) 0%, transparent 100%)' }} />

                {/* Falling stars */}
                {[
                    { startX: '88%', size: 4, dur: 5.5, delay: 0, tailLen: 22, drift: -340 },
                    { startX: '72%', size: 3, dur: 4.8, delay: 1.6, tailLen: 16, drift: -300 },
                ].map((st, i) => (
                    <motion.div key={`fstar-${i}`}
                        style={{ position: 'fixed', left: st.startX, top: 0, rotate: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 0, willChange: 'transform' }}
                        animate={{ y: ['-5vh', '110vh'], x: [0, st.drift] }}
                        transition={{ duration: st.dur, delay: st.delay, repeat: Infinity, ease: 'linear' }}>
                        <div style={{ width: 1.5, height: st.tailLen, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.65))' }} />
                        <div style={{ width: st.size, height: st.size, borderRadius: '50%', background: '#ffffff', boxShadow: `0 0 ${st.size * 2}px ${st.size}px rgba(255,255,255,0.95)` }} />
                    </motion.div>
                ))}
                <CSSOrbiters />

                {/* Inner wrapper */}
                <style>{`
                    .auth-sidebar { display: none; }
                    @media(min-width: 768px) { .auth-sidebar { display: flex; } }
                `}</style>
                <div style={{
                    position: 'relative', zIndex: 10, width: '100%', maxWidth: 1100,
                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2.5rem',
                    justifyContent: 'center',
                }}>
                    {/* ── LEFT SIDEBAR (desktop only) ── */}
                    <div className="auth-sidebar" style={{ flex: '1 1 340px', maxWidth: 460, flexDirection: 'column', justifyContent: 'center' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.8rem', textDecoration: 'none' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E83E8C', boxShadow: '0 0 12px rgba(232,62,140,0.9)' }} />
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.08em', color: '#E6F4EF' }}>CLARIBB</span>
                        </Link>
                        <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#E6F4EF', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                            Your research,<br />permanently remembered.
                        </h1>
                        <p style={{ fontSize: '0.88rem', color: 'rgba(230,244,239,0.55)', marginBottom: '1.75rem', lineHeight: 1.7 }}>
                            CLARIBB builds a persistent model of your knowledge — deploying four specialized agents that think, search, challenge, and connect on your behalf.
                        </p>
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ borderRadius: 12, border: '1px solid rgba(232,62,140,0.15)', background: 'rgba(10,18,16,0.4)', marginBottom: '2rem', backdropFilter: 'blur(8px)', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(232,62,140,0.08)' }}>
                                <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E83E8C' }}
                                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(230,244,239,0.35)' }}>What CLARIBB does</span>
                            </div>
                            <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {[
                                    { label: 'Recall', desc: 'Surfaces relevant memories from past sessions', color: '#E83E8C', delay: 0 },
                                    { label: 'Explorer', desc: 'Searches the web and expands your context', color: '#a855f7', delay: 0.4 },
                                    { label: 'Critique', desc: 'Identifies gaps, biases, and blind spots', color: '#3b82f6', delay: 0.8 },
                                    { label: 'Connector', desc: 'Links ideas across sessions and sources', color: '#10b981', delay: 1.2 },
                                ].map(a => (
                                    <div key={a.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                                        <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, marginTop: 4, flexShrink: 0 }}
                                            animate={{ opacity: [1, 0.25, 1], scale: [1, 0.7, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: a.delay }} />
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(230,244,239,0.55)', lineHeight: 1.5 }}>
                                            <span style={{ fontWeight: 600, color: 'rgba(230,244,239,0.75)' }}>{a.label}</span> — {a.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                            {[['247', 'Memories Indexed'], ['31', 'Sessions Analyzed'], ['74', 'Depth Score']].map(([val, label]) => (
                                <div key={label}>
                                    <p style={{ fontSize: '2rem', fontWeight: 700, color: '#E83E8C', margin: 0 }}>{val}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(230,244,239,0.35)', marginTop: '0.3rem' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── AUTH CARD ── */}
                    <motion.div ref={cardRef} className="auth-card"
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'relative', zIndex: 10,
                            flex: '1 1 300px', maxWidth: 480, width: '100%',
                            borderRadius: 14, background: '#1a0f14',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                            padding: 'clamp(1.5rem,5vw,2.25rem) clamp(1.25rem,5vw,2.52rem)',
                            overflow: 'hidden',
                        }}>
                        <BorderEdge cardRef={cardRef} />

                        {done ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280, delay: 0.08 }}>
                                    <CheckCircle size={44} color="#E83E8C" strokeWidth={1.5} style={{ margin: '0 auto 1rem' }} />
                                </motion.div>
                                <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem', color: '#E6F4EF' }}>
                                    {mode === 'login' ? 'Signed in' : 'Account created'}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'rgba(230,244,239,0.38)' }}>Redirecting to workspace…</p>
                            </motion.div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.54rem' }}>
                                    <div style={{ width: 5.4, height: 5.4, borderRadius: '50%', background: '#E83E8C', boxShadow: '0 0 7px rgba(232,62,140,0.85)' }} />
                                    <span style={{ fontSize: '0.612rem', fontWeight: 500, letterSpacing: '0.13em', color: 'rgba(230,244,239,0.28)', textTransform: 'uppercase' }}>CLARIBB</span>
                                </div>
                                <Typewriter />
                                <h2 style={{ fontSize: 'clamp(1.2rem,4vw,1.35rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#E6F4EF', marginBottom: '0.315rem', lineHeight: 1.3 }}>
                                    {mode === 'login' ? 'Welcome back' : 'Start researching'}
                                </h2>
                                <p style={{ fontSize: '0.738rem', color: 'rgba(230,244,239,0.33)', marginBottom: '1.62rem', lineHeight: 1.5 }}>
                                    {mode === 'login' ? 'Your research memory is waiting.' : 'Create your intelligence workspace.'}
                                </p>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.585rem' }}>
                                    {mode === 'signup' && (
                                        <Field icon={User} type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
                                    )}
                                    <Field icon={Mail} type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                                    <Field icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                                        right={
                                            <button type="button" onClick={() => setShowPw(v => !v)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'rgba(230,244,239,0.2)' }}>
                                                {showPw ? <EyeOff size={13} strokeWidth={1.8} /> : <Eye size={13} strokeWidth={1.8} />}
                                            </button>
                                        }
                                    />
                                    {error && (
                                        <div style={{ padding: '0.5rem 0.7rem', borderRadius: 9, fontSize: '0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div style={{ padding: '0.5rem 0.7rem', borderRadius: 9, fontSize: '0.8rem', background: 'rgba(232,62,140,0.08)', border: '1px solid rgba(232,62,140,0.3)', color: '#E83E8C' }}>
                                            {success}
                                        </div>
                                    )}
                                    <motion.button type="submit" whileHover={{ boxShadow: '0 2px 20px rgba(232,62,140,0.28)' }} whileTap={{ scale: 0.99 }}
                                        disabled={loading}
                                        style={{ width: '100%', padding: '0.75rem 0.9rem', marginTop: '0.18rem', borderRadius: 8.1, border: 'none', background: '#E83E8C', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.36rem', fontFamily: 'inherit', boxShadow: '0 1px 12px rgba(232,62,140,0.18)', transition: 'box-shadow 0.2s, opacity 0.2s', opacity: loading ? 0.72 : 1 }}>
                                        {loading ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.7 }}
                                                style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                                        ) : (
                                            <>{mode === 'login' ? 'Sign in' : 'Create Account'} <ArrowRight size={14} strokeWidth={2.5} /></>
                                        )}
                                    </motion.button>
                                </form>

                                {/* ── OR divider ── */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.1rem 0 0.9rem' }}>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(230,244,239,0.25)', letterSpacing: '0.1em', fontWeight: 500 }}>OR</span>
                                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                </div>

                                {/* ── Google Sign In ── */}
                                <motion.button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={googleLoading || loading}
                                    whileHover={{ boxShadow: '0 2px 16px rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.99 }}
                                    style={{
                                        width: '100%', padding: '0.7rem 1rem',
                                        borderRadius: 8.1, border: '1px solid rgba(255,255,255,0.12)',
                                        background: 'rgba(255,255,255,0.04)',
                                        color: '#E6F4EF', fontWeight: 600, fontSize: '0.82rem',
                                        cursor: googleLoading ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                                        fontFamily: 'inherit',
                                        transition: 'background 0.18s, border 0.18s',
                                        opacity: (googleLoading || loading) ? 0.6 : 1,
                                    }}
                                >
                                    {googleLoading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 0.7 }}
                                            style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                                </motion.button>

                                <p style={{ marginTop: '1.1rem', fontSize: '0.75rem', color: 'rgba(230,244,239,0.35)', textAlign: 'center' }}>
                                    {mode === 'login' ? (
                                        <>Don&apos;t have an account?{' '}
                                            <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E83E8C', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}>
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>Already have an account?{' '}
                                            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E83E8C', fontWeight: 600, fontSize: '0.75rem', fontFamily: 'inherit', padding: 0 }}>
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </p>
                                <p style={{ marginTop: '0.9rem', fontSize: '0.684rem', color: 'rgba(230,244,239,0.22)', textAlign: 'center' }}>
                                    By continuing, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
}
