'use client';

import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Brain, ArrowRight, Network, Shield, Search, Database, GitBranch, TrendingUp, Zap, Lightbulb, Activity, Cpu, Sparkles, Copy, Check } from 'lucide-react';

/* ── Typewriter ──────────────────────────── */
function useTypewriter(words: string[], speed = 48, pause = 2200) {
    const [text, setText] = useState('');
    const [wi, setWi] = useState(0);
    const [del, setDel] = useState(false);
    useEffect(() => {
        const cur = words[wi];
        let t: ReturnType<typeof setTimeout>;
        if (!del && text === cur) t = setTimeout(() => setDel(true), pause);
        else if (del && text === '') { setDel(false); setWi(i => (i + 1) % words.length); }
        else t = setTimeout(() => setText(del ? cur.slice(0, text.length - 1) : cur.slice(0, text.length + 1)), del ? 26 : speed);
        return () => clearTimeout(t);
    }, [text, wi, del, words, speed, pause]);
    return text;
}

/* ── Scroll-progress line ────────────────── */
function ScrollBar() {
    const { scrollYProgress } = useScroll();
    return <motion.div className="fixed top-0 left-0 right-0 z-[100] origin-left" style={{ height: 1.5, scaleX: scrollYProgress, background: '#E83E8C' }} />;
}

/* ── Fade-up wrapper ─────────────────────── */
function FadeUp({ children, className = '', delay = 0, id = '' }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
    const ref = useRef(null);
    const vis = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div id={id} ref={ref} initial={{ opacity: 0, y: 20 }} animate={vis ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }} className={className}>
            {children}
        </motion.div>
    );
}

/* ── Eyebrow pill ────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-[0.1em] uppercase mb-5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#A1A1AA' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E83E8C' }} />
            {children}
        </div>
    );
}

/* ── Hero grid — mouse-parallax ──────────── */
function HeroGrid() {
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const gx = useSpring(mx, { stiffness: 40, damping: 20 });
    const gy = useSpring(my, { stiffness: 40, damping: 20 });
    const onMove = useCallback((e: MouseEvent) => {
        mx.set((e.clientX / window.innerWidth - 0.5) * 16);
        my.set((e.clientY / window.innerHeight - 0.5) * 10);
    }, [mx, my]);
    useEffect(() => {
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, [onMove]);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute inset-[-8%]" style={{ x: gx, y: gy }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.12) 1px,transparent 1px)`,
                    backgroundSize: '64px 64px',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 42%, black 58%, transparent 100%)',
                }} />
            </motion.div>
        </div>
    );
}

/* ── Section divider grid ────────────────── */
function SGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.072) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.072) 1px,transparent 1px)`,
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 86% 78% at 50% 50%, black 22%, transparent 82%)',
        }} />
    );
}

/* ── Animated counter ────────────────────── */
function AnimCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const ref = useRef(null);
    const vis = useInView(ref, { once: true });
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!vis) return;
        let s = 0;
        const t = setInterval(() => { s = Math.min(s + target / 45, target); setN(Math.floor(s)); if (s >= target) clearInterval(t); }, 35);
        return () => clearInterval(t);
    }, [vis, target]);
    return <span ref={ref}>{n}{suffix}</span>;
}

/* ── Neural diagram ──────────────────────── */
function NeuralDiagram() {
    const nodes = [
        { x: 55, y: 140, r: 4 }, { x: 55, y: 215, r: 3 }, { x: 55, y: 290, r: 4 },
        { x: 175, y: 95, r: 5 }, { x: 175, y: 190, r: 4 }, { x: 175, y: 280, r: 3 }, { x: 175, y: 355, r: 4 },
        { x: 305, y: 128, r: 7 }, { x: 305, y: 240, r: 5 }, { x: 305, y: 340, r: 4 },
        { x: 425, y: 175, r: 5 }, { x: 425, y: 290, r: 6 },
        { x: 520, y: 232, r: 11 },
    ];
    const edges = [[0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [2, 6], [3, 7], [3, 8], [4, 7], [4, 8], [4, 9], [5, 8], [5, 9], [6, 9], [7, 10], [7, 11], [8, 10], [8, 11], [9, 11], [10, 12], [11, 12]];
    return (
        <svg viewBox="0 0 580 450" className="w-full h-full">
            <defs>
                <radialGradient id="nd1"><stop offset="0%" stopColor="#fff" stopOpacity="0.55" /><stop offset="100%" stopColor="#fff" stopOpacity="0.04" /></radialGradient>
                <radialGradient id="nd2"><stop offset="0%" stopColor="#E83E8C" stopOpacity="0.85" /><stop offset="100%" stopColor="#fff" stopOpacity="0.06" /></radialGradient>
                <filter id="ndf"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {edges.map(([a, b], i) => (
                <motion.line key={`e${i}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
                    stroke="rgba(255,255,255,0.035)" strokeWidth="1"
                    animate={{ opacity: [0.02, 0.1, 0.02] }} transition={{ duration: 2.8 + i * 0.08, delay: i * 0.04, repeat: Infinity }} />
            ))}
            {edges.slice(0, 5).map(([a, b], i) => (
                <motion.circle key={`p${i}`} r="3.5" fill="#E83E8C" filter="url(#ndf)"
                    animate={{ opacity: [0, 1, 0], cx: [nodes[a].x, nodes[b].x], cy: [nodes[a].y, nodes[b].y] }}
                    transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity, ease: 'linear' }} />
            ))}
            {nodes.map((nd, i) => (
                <motion.circle key={`n${i}`} cx={nd.x} cy={nd.y} r={nd.r}
                    fill={i === 12 ? 'url(#nd2)' : 'url(#nd1)'} filter="url(#ndf)"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.4 + i * 0.06, delay: i * 0.07, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: `${nd.x}px ${nd.y}px` }} />
            ))}
        </svg>
    );
}

/* Dracula syntax palette — softened / desaturated */
const SYN: Record<string, string> = {
    k: '#A78BD4', // keywords — muted violet (was #BD93F9)
    m: '#72B8CC', // module names — muted teal-blue (was #8BE9FD)
    n: '#C8C8C0', // identifiers — off-white (was #F8F8F2)
    s: '#6BAF7E', // strings — muted sage green (was #50FA7B)
    c: '#555E7A', // comments — dark slate (was #6272A4)
    f: '#C49A5A', // function names — muted amber (was #FFB86C)
    p: '#C47AA0', // properties — muted rose (was #FF79C6)
    d: '#B8B8B2', // default / operators — soft gray-white
};

/* Per-language code definitions */
const LANG_CODE: Record<string, Array<{ t: string; v: string }[]>> = {
    python: [
        [{ t: 'k', v: 'from ' }, { t: 'm', v: 'sage' }, { t: 'k', v: ' import ' }, { t: 'f', v: 'SAGE' }],
        [],
        [{ t: 'c', v: '# research with compounding memory' }],
        [],
        [{ t: 'n', v: 'client' }, { t: 'd', v: ' = ' }, { t: 'f', v: 'SAGE' }, { t: 'd', v: '(' }],
        [{ t: 'd', v: '    ' }, { t: 'p', v: 'memory' }, { t: 'd', v: '=' }, { t: 's', v: '"persistent"' }, { t: 'd', v: ',' }],
        [{ t: 'd', v: '    ' }, { t: 'p', v: 'agents' }, { t: 'd', v: '=' }, { t: 's', v: '"all"' }],
        [{ t: 'd', v: ')' }],
    ],
    node: [
        [{ t: 'k', v: 'import ' }, { t: 'm', v: 'SAGE' }, { t: 'k', v: ' from ' }, { t: 's', v: "'@sage/client'" }],
        [],
        [{ t: 'c', v: '// research with compounding memory' }],
        [],
        [{ t: 'k', v: 'const ' }, { t: 'n', v: 'client' }, { t: 'd', v: ' = ' }, { t: 'k', v: 'new ' }, { t: 'f', v: 'SAGE' }, { t: 'd', v: '({' }],
        [{ t: 'd', v: '  ' }, { t: 'p', v: 'memory' }, { t: 'd', v: ': ' }, { t: 's', v: "'persistent'" }, { t: 'd', v: ',' }],
        [{ t: 'd', v: '  ' }, { t: 'p', v: 'agents' }, { t: 'd', v: ': ' }, { t: 's', v: "'all'" }],
        [{ t: 'd', v: '})' }],
    ],
    curl: [
        [{ t: 'f', v: 'curl ' }, { t: 'd', v: '-X ' }, { t: 's', v: 'POST' }, { t: 'd', v: ' \\' }],
        [{ t: 'd', v: '  ' }, { t: 's', v: '"https://api.sage.ai/research"' }, { t: 'd', v: ' \\' }],
        [{ t: 'd', v: '  -H ' }, { t: 's', v: '"Authorization: Bearer $SAGE_KEY"' }, { t: 'd', v: ' \\' }],
        [{ t: 'd', v: '  -H ' }, { t: 's', v: '"Content-Type: application/json"' }, { t: 'd', v: ' \\' }],
        [{ t: 'd', v: '  -d ' }, { t: 'd', v: "'" }, { t: 'd', v: '{' }],
        [{ t: 'd', v: '    ' }, { t: 'p', v: '"memory"' }, { t: 'd', v: ': ' }, { t: 's', v: '"persistent"' }, { t: 'd', v: ',' }],
        [{ t: 'd', v: '    ' }, { t: 'p', v: '"agents"' }, { t: 'd', v: ': ' }, { t: 's', v: '"all"' }],
        [{ t: 'd', v: "  }'" }],
    ],
};
const CLIPBOARD_CODE: Record<string, (q: string) => string> = {
    python: q => `from sage import SAGE\n\nclient = SAGE(memory="persistent", agents="all")\n\nresponse = client.research("${q}")`,
    node: q => `import SAGE from '@sage/client'\n\nconst client = new SAGE({ memory: 'persistent', agents: 'all' })\n\nconst response = await client.research("${q}")`,
    curl: q => `curl -X POST "https://api.sage.ai/research" \\\n  -H "Authorization: Bearer $SAGE_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"memory":"persistent","agents":"all","query":"${q}"}'`,
};

function CodePanel({ query }: { query: string }) {
    const [lang, setLang] = useState<'python' | 'node' | 'curl'>('python');
    const [copied, setCopied] = useState(false);
    const code = LANG_CODE[lang];
    const copy = () => {
        navigator.clipboard.writeText(CLIPBOARD_CODE[lang](query));
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };
    const tabs: Array<{ id: 'python' | 'node' | 'curl'; label: string }> = [
        { id: 'python', label: 'Python' },
        { id: 'node', label: 'Node.js' },
        { id: 'curl', label: 'cURL' },
    ];
    const liveCallStr = lang === 'python'
        ? 'response = client.research('
        : lang === 'node' ? 'const response = await client.research(' : '';
    return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(9,9,12,0.78)', border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}>
            {/* Tab bar */}
            <div className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-5">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setLang(tab.id)}
                            className="text-[12.5px] transition-colors" style={{
                                color: lang === tab.id ? '#F8F8F2' : '#6272A4',
                                fontWeight: lang === tab.id ? 600 : 400,
                                borderBottom: lang === tab.id ? '1.5px solid #F8F8F2' : '1.5px solid transparent',
                                paddingBottom: 2,
                            }}>{tab.label}</button>
                    ))}
                </div>
                <button onClick={copy} className="transition-opacity hover:opacity-70" style={{ color: copied ? '#50FA7B' : '#6272A4' }}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            {/* Code body */}
            <div className="px-5 py-4 font-mono text-[12.5px] leading-[1.85]">
                {code.map((line, i) => (
                    <div key={`${lang}${i}`} className="empty:h-[1.85em]">
                        {line.map((seg, j) => <span key={j} style={{ color: SYN[seg.t] }}>{seg.v}</span>)}
                    </div>
                ))}
                {/* Live typewriter line (only Python + Node) */}
                {lang !== 'curl' && (
                    <div className="mt-1">
                        <span style={{ color: '#909090' }}>{liveCallStr}</span>
                        <span style={{ color: '#6BAF7E' }}>&#34;{query}</span>
                        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.52, repeat: Infinity }} style={{ color: '#A78BD4' }}>▊</motion.span>
                        <span style={{ color: '#6BAF7E' }}>&#34;</span>
                        <span style={{ color: '#909090' }}>)</span>
                    </div>
                )}
            </div>
        </div>
    );
}


/* ── Data ────────────────────────────────── */
const AGENTS = [
    { id: 'recall', n: '01', name: 'Recall', icon: Brain, desc: 'Semantic memory search across every session. Instant, vector-indexed retrieval from your entire research history.', tags: ['pgvector', 'cosine similarity', 'cross-session'] },
    { id: 'explorer', n: '02', name: 'Explorer', icon: Search, desc: 'Live web research when memory has gaps. Crawls, extracts, and embeds new knowledge in real time.', tags: ['live crawling', 'auto-embed', 'gap detection'] },
    { id: 'critique', n: '03', name: 'Critique', icon: Shield, desc: "Devil's advocate. Surfaces counterarguments, hidden assumptions, and logical weaknesses in every response.", tags: ['steelmanning', 'bias detection', 'assumption audit'] },
    { id: 'connector', n: '04', name: 'Connector', icon: Network, desc: "Discovers non-obvious links across domains. Finds connections you didn't know you were looking for.", tags: ['cross-domain', 'serendipity', 'pattern synthesis'] },
];
const TICKER = ['semantic vector memory', '4 parallel agents', 'knowledge graph time machine', 'live chain of thought', 'steelman engine', 'belief evolution tracker', 'trajectory prediction', 'cross-project serendipity'];

/* ── Shared style constants ──────────────── */
const C = {
    black: '#000000',
    layer: '#0B0B0D',
    border: 'rgba(255,255,255,0.06)',
    borderM: 'rgba(255,255,255,0.10)',
    text: '#FFFFFF',
    sec: '#A1A1AA',
    muted: '#71717A',
    faint: '#3F3F46',
    pink: '#E83E8C',
};

/* ════════════════════════════════════════════
   PAGE
════════════════════════════════════════════ */
export default function LandingPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
    const heroOp = useTransform(scrollYProgress, [0, 0.72], [1, 0]);

    const query = useTypewriter([
        'What are the tensions between AI safety and capabilities?',
        'How does transformers architecture compare to SSMs?',
        'Find connections between RLHF and constitutional AI...',
        'What did I read last week about mechanistic interpretability?',
    ], 48, 2100);

    const [active, setActive] = useState(0);
    useEffect(() => { const t = setInterval(() => setActive(i => (i + 1) % 4), 2200); return () => clearInterval(t); }, []);

    return (
        <div style={{ background: C.black, color: C.text, fontFamily: "'Inter',system-ui,sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
            <ScrollBar />

            {/* ═══ ANNOUNCEMENT BAR ════════════════ */}
            <div className="flex items-center justify-center gap-2.5 py-1.5 text-[12px] font-medium"
                style={{ background: '#CD3775', borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70" />
                <span style={{ color: 'rgba(255,255,255,0.92)' }}>SPEEDRUN 2026 · Track 3 — Multi-Agent Research Intelligence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                    style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.28)' }}>BETA</span>
            </div>

            {/* ═══ NAVBAR ════════════════════════════ */}
            <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}
                className="sticky top-0 z-50 flex items-center justify-between px-8 h-14 max-w-screen-xl mx-auto"
                style={{ background: 'rgba(0,0,0,0.92)', borderBottom: `1px solid ${C.border}`, backdropFilter: 'blur(18px)' }}>
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <Brain className="w-5 h-5" style={{ color: C.sec }} />
                    <span className="text-[15px] font-semibold tracking-tight">SAGE</span>
                </div>
                {/* Links */}
                <div className="hidden md:flex items-center gap-8 text-[13.5px]" style={{ color: C.muted }}>
                    {[['Agents', '#agents'], ['How it Works', '#how-it-works'], ['Features', '#features']].map(([l, h]) => (
                        <a key={l} href={h} className="hover:text-white transition-colors duration-150">{l}</a>
                    ))}
                </div>
                {/* CTAs */}
                <div className="flex items-center gap-3">
                    <Link href="/auth" className="text-[13.5px] transition-colors hover:text-white" style={{ color: C.muted }}>Sign in</Link>
                    <Link href="/auth" className="flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] text-[13.5px] font-medium hover:opacity-90 transition-opacity"
                        style={{ background: C.text, color: C.black }}>
                        Get started <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.nav>

            {/* ═══ HERO ══════════════════════════════ */}
            <section ref={heroRef} className="relative min-h-[88vh] flex items-center overflow-hidden">
                <HeroGrid />
                {/* very subtle glow blob behind heading */}
                <div className="absolute pointer-events-none" style={{ width: 580, height: 420, top: '10%', left: '8%', background: 'radial-gradient(ellipse,rgba(255,255,255,0.02) 0%,transparent 70%)', borderRadius: '50%' }} />

                <div className="relative z-10 w-full max-w-screen-xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center py-14">
                    {/* Left */}
                    <motion.div style={{ y: heroY, opacity: heroOp }}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                            <Eyebrow>Multi-Agent Research Intelligence</Eyebrow>
                        </motion.div>

                        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.65 }}
                            className="font-bold leading-[1.06] mb-5"
                            style={{ fontSize: 'clamp(34px,4.6vw,56px)', letterSpacing: '-0.025em' }}>
                            <span style={{
                                background: 'linear-gradient(180deg, #3A3A3A 0%, #FFFFFF 55%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Research that</span><br />
                            <span style={{ color: C.text }}>remembers<br />
                                everything</span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
                            className="text-[15.5px] font-light leading-[1.74] mb-8" style={{ color: C.sec, maxWidth: 500 }}>
                            Four specialized AI agents. One persistent memory graph.
                            SAGE builds a compounding knowledge model — so every session makes you sharper than the last.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="flex flex-wrap items-center gap-3 mb-10">
                            <Link href="/auth" className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:opacity-90 transition-opacity"
                                style={{ background: C.text, color: C.black }}>
                                Get started <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#how-it-works" className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-white/[0.05] transition-colors"
                                style={{ border: `1px solid rgba(255,255,255,0.18)`, color: C.text }}>
                                View models
                            </a>
                        </motion.div>

                        {/* Tag row — like MegaLLM "Use it with" */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
                            className="flex flex-wrap items-center gap-2">
                            <span className="text-[12px] font-light" style={{ color: C.faint }}>Works with</span>
                            {['Groq', 'Cohere', 'pgvector', 'OpenAI'].map(t => (
                                <span key={t} className="text-[11px] px-2.5 py-1 rounded-md font-medium"
                                    style={{ background: 'rgba(255,255,255,0.05)', color: C.sec, border: `1px solid ${C.border}` }}>{t}</span>
                            ))}
                        </motion.div>

                        {/* Divider + stats */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                            className="flex items-center gap-10 mt-9 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
                            {[{ val: 4, s: '', lbl: 'AI Agents' }, { val: 100, s: '+', lbl: 'Depth score scale' }, { custom: '<1s', lbl: 'Memory recall' }].map((st, i) => (
                                <div key={i}>
                                    <div className="text-[22px] font-bold" style={{ color: C.text }}>{st.custom ?? <><AnimCounter target={st.val!} />{st.s}</>}</div>
                                    <div className="text-[12px] mt-0.5" style={{ color: C.muted }}>{st.lbl}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.75 }}
                        className="hidden lg:flex flex-col gap-3">
                        {/* Neural diagram — no border, transparent, blends into black */}
                        <div className="relative overflow-hidden" style={{ height: 300, background: 'transparent', border: 'none' }}>
                            <NeuralDiagram />
                            {/* Agent floating tags */}
                            {AGENTS.map((ag, i) => {
                                const pos = [{ top: '8%', left: '3%' }, { top: '8%', right: '3%' }, { bottom: '10%', left: '3%' }, { bottom: '10%', right: '3%' }];
                                return (
                                    <div key={ag.id} className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11.5px] font-semibold"
                                        style={{ ...pos[i], background: active === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active === i ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.10)'}`, color: active === i ? '#FFFFFF' : '#8A8A8A', transition: 'all 0.3s ease' }}>
                                        {active === i && <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: C.pink }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />}
                                        {ag.name}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Code panel */}
                        <CodePanel query={query} />
                    </motion.div>
                </div>
            </section>

            {/* ═══ TICKER ════════════════════════════ */}
            <div className="relative overflow-hidden py-2.5 border-y" style={{ borderColor: C.border }}>
                <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: [0, -1040] }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}>
                    {[0, 1, 2].flatMap(o => TICKER.map((t, i) => (
                        <span key={`tk${o}${i}`} className="flex items-center gap-3 text-[11px]" style={{ color: C.faint }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: C.pink, opacity: 0.5 }} />{t}
                        </span>
                    )))}
                </motion.div>
            </div>

            {/* ═══ AGENTS ═══════════════════════════ */}
            <section id="agents" className="relative py-28 overflow-hidden" style={{ background: C.layer }}>
                <div className="relative z-10 max-w-screen-xl mx-auto px-8">
                    <FadeUp className="text-center mb-14">
                        <Eyebrow>The Four Agents</Eyebrow>
                        <h2 className="text-[40px] font-bold mb-4" style={{ letterSpacing: '-0.023em' }}>
                            Four <span style={{ color: '#BD93F9' }}>specialists</span>. One unified mind.
                        </h2>
                        <p className="text-[15px] font-light max-w-[540px] mx-auto" style={{ color: C.sec }}>Every query activates all four agents simultaneously. They compete, collaborate, and synthesize — producing answers no single model can match.</p>
                    </FadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2px]" style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                        {AGENTS.map((ag, i) => {
                            const Icon = ag.icon;
                            return (
                                <motion.div key={ag.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    whileHover={{ background: 'rgba(255,255,255,0.025)', transition: { duration: 0.15 } }}
                                    className="relative p-6 group cursor-default"
                                    style={{ background: 'rgba(11,11,13,0.9)', borderRight: i < 3 ? `1px solid ${C.border}` : 'none' }}>
                                    <div className="absolute top-3 right-4 text-[32px] font-black opacity-[0.035]">{ag.n}</div>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}>
                                        <Icon className="w-4.5 h-4.5" style={{ color: C.sec, width: 18, height: 18 }} />
                                    </div>
                                    <h3 className="font-semibold text-[14.5px] mb-2">{ag.name} Agent</h3>
                                    <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: C.muted }}>{ag.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ag.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid ${C.border}` }}>{t}</span>)}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ══════════════════════ */}
            <section id="how-it-works" className="relative py-28 overflow-hidden" style={{ background: C.black }}>
                <div className="relative z-10 max-w-screen-xl mx-auto px-8">
                    <FadeUp className="text-center mb-20">
                        <Eyebrow>The Pipeline</Eyebrow>
                        <h2 className="text-[40px] font-bold mb-4" style={{ letterSpacing: '-0.023em' }}>
                            From question to <span style={{ color: '#50FA7B' }}>insight</span> in under a second.
                        </h2>
                    </FadeUp>
                    <div className="relative">
                        <div className="hidden lg:block absolute top-[50px] left-[8%] right-[8%] h-px" style={{ background: `linear-gradient(90deg,transparent,${C.border},${C.border},transparent)` }} />
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {[
                                { n: '01', icon: Cpu, title: 'Query arrives', desc: 'Intent understood. Context from every past session loaded instantly.' },
                                { n: '02', icon: Activity, title: '4 agents activate', desc: 'Recall, Explorer, Critique, Connector — all run in parallel.' },
                                { n: '03', icon: GitBranch, title: 'Synthesis happens', desc: 'Results merge. Memory graph updates. New relationships extracted.' },
                                { n: '04', icon: Sparkles, title: 'Deep answer', desc: 'Response grounded in your full history. Knowledge compounds.' },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <motion.div key={`s${i}`} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                                        <div className="w-[100px] h-[100px] rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                                            <Icon className="w-9 h-9" style={{ color: C.sec }} />
                                            <div className="absolute -top-3 -right-3 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                                                style={{ background: C.layer, color: C.muted, border: `1px solid ${C.border}` }}>{s.n}</div>
                                        </div>
                                        <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
                                        <p className="text-[13px]" style={{ color: C.muted }}>{s.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ══════════════════════════ */}
            <section id="features" className="relative py-28 overflow-hidden" style={{ background: C.layer }}>
                <div className="relative z-10 max-w-screen-xl mx-auto px-8">
                    <FadeUp className="text-center mb-14">
                        <Eyebrow>Core Capabilities</Eyebrow>
                        <h2 className="text-[40px] font-bold mb-4" style={{ letterSpacing: '-0.023em' }}>
                            Everything serious <span style={{ color: '#8BE9FD' }}>researchers</span> need.
                        </h2>
                    </FadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Wide */}
                        <FadeUp className="md:col-span-2">
                            <motion.div whileHover={{ y: -2 }} className="p-7 rounded-xl h-full" style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}` }}>
                                <div className="flex gap-7">
                                    <div className="flex-1">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}><Database className="w-4 h-4" style={{ color: C.sec }} /></div>
                                        <h3 className="text-[16px] font-semibold mb-2">Semantic Vector Memory</h3>
                                        <p className="text-[13px] leading-relaxed mb-4" style={{ color: C.muted }}>Every note and conversation embedded via pgvector. SAGE retrieves the right context from months ago — in milliseconds, no manual tagging.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['pgvector', 'cosine similarity', 'auto-chunking', 'cross-session recall'].map(t => (
                                                <span key={t} className="text-[11px] px-2.5 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid ${C.border}` }}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col justify-end gap-1.5 w-14 pb-1">
                                        {[0.35, 0.62, 0.48, 0.82, 0.58, 0.72, 0.44].map((h, i) => (
                                            <motion.div key={i} className="rounded-sm" style={{ height: 4, background: `rgba(255,255,255,${h * 0.18})` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.36 }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </FadeUp>
                        {/* Tall */}
                        <FadeUp delay={0.07} className="row-span-2">
                            <motion.div whileHover={{ y: -2 }} className="p-6 rounded-xl h-full" style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}` }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}><Network className="w-4 h-4" style={{ color: C.sec }} /></div>
                                <h3 className="text-[16px] font-semibold mb-2">Living Knowledge Graph</h3>
                                <p className="text-[13px] leading-relaxed mb-5" style={{ color: C.muted }}>Every concept and relationship extracted automatically. Watch your research domain grow visually — session by session.</p>
                                <div className="relative" style={{ height: 190 }}>
                                    <svg className="absolute inset-0 w-full h-full">
                                        {([[60, 70, 150, 40], [60, 70, 145, 110], [150, 40, 145, 110], [60, 145, 150, 145]] as number[][]).map((l, i) => (
                                            <motion.line key={`ml${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke="rgba(255,255,255,0.08)" strokeWidth="1"
                                                animate={{ opacity: [0.04, 0.32, 0.04] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }} />
                                        ))}
                                    </svg>
                                    {[{ x: 34, y: 54, r: 21, lbl: 'RAG' }, { x: 124, y: 19, r: 17, lbl: 'RLHF' }, { x: 116, y: 90, r: 15, lbl: 'Safety' }, { x: 34, y: 124, r: 13, lbl: 'SSM' }].map((nd, i) => (
                                        <motion.div key={`mn${i}`} className="absolute flex items-center justify-center rounded-full"
                                            style={{ width: nd.r * 2, height: nd.r * 2, left: nd.x, top: nd.y, background: `rgba(255,255,255,${0.03 + i * 0.01})`, border: `1px solid rgba(255,255,255,${0.08 + i * 0.02})`, color: C.muted, fontSize: 8, fontFamily: 'inherit', fontWeight: 500 }}
                                            animate={{ y: [0, -3, 0] }} transition={{ duration: 2.4 + i * 0.38, repeat: Infinity, delay: i * 0.28 }}>{nd.lbl}</motion.div>
                                    ))}
                                </div>
                                <p className="text-[11px] mt-4" style={{ color: C.faint }}>+ Time Machine: replay belief graph evolution</p>
                            </motion.div>
                        </FadeUp>
                        {/* 2 small */}
                        {[
                            { icon: GitBranch, title: 'Session Intelligence', desc: 'AI summaries, open questions, gaps resolved. Return weeks later and pick up exactly where you left off.' },
                            { icon: Lightbulb, title: 'Research Hypotheses', desc: 'SAGE generates testable hypotheses from your corpus — ideas you might not have connected yourself.' },
                        ].map((fc, i) => (
                            <FadeUp key={`fc${i}`} delay={0.09 + i * 0.05}>
                                <motion.div whileHover={{ y: -2 }} className="p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}` }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}><fc.icon className="w-4 h-4" style={{ color: C.sec }} /></div>
                                    <h3 className="text-[15px] font-semibold mb-2">{fc.title}</h3>
                                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{fc.desc}</p>
                                </motion.div>
                            </FadeUp>
                        ))}
                        {/* Wide bottom */}
                        <FadeUp className="md:col-span-2" delay={0.11}>
                            <motion.div whileHover={{ y: -2 }} className="p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${C.border}` }}>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { icon: Zap, title: 'Cross-Project Serendipity', desc: 'Unexpected connections across all your projects — insights only the full picture reveals.' },
                                        { icon: TrendingUp, title: 'Trajectory Prediction', desc: "AI predicts where your research is headed and what foundational concepts you'll need next." },
                                    ].map((f, i) => (
                                        <div key={i}>
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}` }}><f.icon className="w-4 h-4" style={{ color: C.sec }} /></div>
                                            <h3 className="text-[15px] font-semibold mb-2">{f.title}</h3>
                                            <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* ═══ STATS ══════════════════════════════ */}
            <section className="relative py-20 border-y overflow-hidden" style={{ background: C.black, borderColor: C.border }}>
                <div className="max-w-screen-xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 divide-x" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                    {[{ n: 4, s: '', lbl: 'AI Agents' }, { n: 100, s: '+', lbl: 'Depth Score Scale' }, { n: 5, s: '', lbl: 'Core Features' }, { n: 36, s: 'h', lbl: 'Built in' }].map((st, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            className="text-center py-2 px-6" style={{ borderColor: C.border }}>
                            <div className="text-[30px] font-bold mb-1"><AnimCounter target={st.n} />{st.s}</div>
                            <div className="text-[12px]" style={{ color: C.muted }}>{st.lbl}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ USE CASES ══════════════════════════ */}
            <section className="relative py-28 overflow-hidden" style={{ background: C.layer }}>
                <div className="relative z-10 max-w-screen-xl mx-auto px-8">
                    <FadeUp className="text-center mb-14">
                        <Eyebrow>Built For</Eyebrow>
                        <h2 className="text-[40px] font-bold mb-4" style={{ letterSpacing: '-0.023em' }}>Who uses <span style={{ color: '#E83E8C' }}>SAGE</span>?</h2>
                    </FadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { e: '🔬', title: 'PhD Researchers', desc: 'Never lose track of 3 years of papers. Surface the connection your advisor missed.', tags: ['Literature Review', 'Concept Mapping'] },
                            { e: '🏢', title: 'Strategy Analysts', desc: 'Build compounding competitive intelligence. Connect every insight across sprints.', tags: ['Market Research', 'Trend Detection'] },
                            { e: '⚖️', title: 'Legal Professionals', desc: 'Track case law and precedent across months. SAGE never forgets a ruling.', tags: ['Case Law', 'Precedent Cross-Reference'] },
                            { e: '💡', title: 'Innovation Teams', desc: 'Detect convergence patterns across disciplines before they become obvious.', tags: ['Tech Scouting', 'Pattern Synthesis'] },
                        ].map((uc, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -3, transition: { duration: 0.16 } }} className="p-6 rounded-xl group"
                                style={{ background: 'rgba(0,0,0,0.55)', border: `1px solid ${C.border}` }}>
                                <div className="text-[26px] mb-4 group-hover:scale-110 transition-transform duration-200">{uc.e}</div>
                                <h3 className="font-semibold text-[14.5px] mb-2">{uc.title}</h3>
                                <p className="text-[13px] leading-relaxed mb-4" style={{ color: C.muted }}>{uc.desc}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {uc.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid ${C.border}` }}>{t}</span>)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ════════════════════════════════ */}
            <section className="relative py-32 overflow-hidden border-t" style={{ background: C.black, borderColor: C.border }}>
                <div className="relative z-10 max-w-[720px] mx-auto px-8 text-center">
                    <FadeUp>
                        <Brain className="w-9 h-9 mx-auto mb-6" style={{ color: C.muted }} />
                        <h2 className="text-[48px] font-bold mb-4" style={{ letterSpacing: '-0.028em' }}>
                            <span style={{ color: '#E83E8C' }}>Stop starting</span> from zero.
                        </h2>
                        <p className="text-[15.5px] font-light mb-10" style={{ color: C.sec }}>
                            Build a research brain that compounds with every session. The longer you use SAGE, the more irreplaceable it becomes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href="/auth" className="flex items-center gap-2 px-7 py-3 rounded-[8px] text-[14.5px] font-medium hover:opacity-90 transition-opacity"
                                style={{ background: C.text, color: C.black }}>
                                Start for free <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#agents" className="flex items-center gap-2 px-7 py-3 rounded-[8px] text-[14.5px] font-medium hover:bg-white/[0.05] transition-colors"
                                style={{ border: `1px solid rgba(255,255,255,0.16)`, color: C.text }}>
                                Explore agents
                            </a>
                        </div>
                        <p className="mt-5 text-[12px]" style={{ color: C.faint }}>No credit card required · Works instantly</p>
                    </FadeUp>
                </div>
            </section>

            {/* ═══ FOOTER ════════════════════════════ */}
            <footer className="border-t py-7 px-8" style={{ borderColor: C.border, background: C.black }}>
                <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Brain className="w-4 h-4" style={{ color: C.faint }} />
                        <span className="font-semibold text-[14px]">SAGE</span>
                        <span className="text-[13px]" style={{ color: C.faint }}> — Multi-Agent Research Intelligence</span>
                    </div>
                    <div className="flex items-center gap-5 text-[12.5px]" style={{ color: C.faint }}>
                        <span>Groq · Cohere · pgvector · Next.js 15</span>
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: 'rgba(232,62,140,0.06)', color: C.pink, border: '1px solid rgba(232,62,140,0.16)' }}>SPEEDRUN 2026</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
