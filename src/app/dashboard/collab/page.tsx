'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Search, Users, Lock, Globe, Copy, Check, LogIn, Hash, ChevronRight } from 'lucide-react';

interface Server {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    invite_code: string;
    is_public?: boolean;
    members_count?: number;
    is_local?: boolean;
}

const SERVER_ICONS = ['🔬', '📚', '🧠', '🌍', '⚡', '🎯', '📊', '🔭', '🧬', '💡', '🏛️', '🚀'];
const LOCAL_SERVERS_KEY = 'claribb_local_servers';
const MY_SERVERS_KEY = 'claribb_my_servers';

function loadLocal<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}

type Tab = 'my' | 'discover' | 'join';

export default function CollabPage() {
    const [tab, setTab] = useState<Tab>('my');
    const [myServers, setMyServers] = useState<Server[]>([]);
    const [publicServers, setPublicServers] = useState<Server[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [serverName, setServerName] = useState('');
    const [serverDesc, setServerDesc] = useState('');
    const [serverIcon, setServerIcon] = useState('🔬');
    const [isPublic, setIsPublic] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [searchQ, setSearchQ] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [copiedCode, setCopiedCode] = useState('');
    const [joinError, setJoinError] = useState('');

    useEffect(() => {
        setMyServers(loadLocal<Server[]>(MY_SERVERS_KEY, []));
        fetchPublicServers();
    }, []);

    const fetchPublicServers = async () => {
        try {
            const res = await fetch('/api/servers' + (searchQ ? `?q=${searchQ}` : ''));
            const data = await res.json();
            setPublicServers(data.servers || []);
        } catch { setPublicServers([]); }
    };

    const createServer = async () => {
        if (!serverName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch('/api/servers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: serverName.trim(), description: serverDesc, icon: serverIcon, is_public: isPublic }),
            });
            const data = await res.json();
            const server: Server = {
                id: data.server?.id || crypto.randomUUID(),
                name: serverName.trim(),
                description: serverDesc,
                icon: serverIcon,
                invite_code: data.server?.invite_code || `CLR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                is_public: isPublic,
                members_count: 1,
            };
            const updated = [server, ...myServers];
            setMyServers(updated);
            localStorage.setItem(MY_SERVERS_KEY, JSON.stringify(updated));
            if (isPublic) {
                const pub = [server, ...publicServers];
                setPublicServers(pub);
                localStorage.setItem(LOCAL_SERVERS_KEY, JSON.stringify(pub));
            }
            setShowCreate(false);
            setServerName(''); setServerDesc(''); setServerIcon('🔬'); setIsPublic(false);
            setTab('my');
        } catch { /* ignore */ }
        finally { setCreating(false); }
    };

    const joinByCode = async () => {
        const code = joinCode.trim().toUpperCase();
        if (!code) return;
        setJoining(true); setJoinError('');
        try {
            // Check local servers first
            const allLocal: Server[] = loadLocal<Server[]>(LOCAL_SERVERS_KEY, []);
            const found = allLocal.find(s => s.invite_code === code || s.invite_code === `CLR-${code}`);
            const server = found || { id: crypto.randomUUID(), name: 'Research Server', icon: '🔬', invite_code: code, is_public: true, members_count: 1 };
            const already = myServers.find(s => s.invite_code === code || s.invite_code === `CLR-${code}`);
            if (already) { setJoinError('You already joined this server!'); return; }
            const updated = [server, ...myServers];
            setMyServers(updated);
            localStorage.setItem(MY_SERVERS_KEY, JSON.stringify(updated));
            setJoinCode('');
            setShowJoin(false);
            setTab('my');
        } catch { setJoinError('Invalid invite code. Please check and try again.'); }
        finally { setJoining(false); }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const TABS: { id: Tab; label: string }[] = [
        { id: 'my', label: 'My Servers' },
        { id: 'discover', label: 'Discover' },
        { id: 'join', label: 'Join by Code' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '2.5rem 2.5rem 4rem' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Collab</h1>
                    <p style={{ color: '#555', fontSize: '0.85rem', marginTop: 6 }}>
                        Create or join research servers — collaborate like Discord
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowJoin(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.1rem', borderRadius: 10, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#aaa', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                        <LogIn size={14} /> Join Server
                    </button>
                    <button onClick={() => setShowCreate(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.1rem', borderRadius: 10, background: '#E83E8C', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 16px rgba(232,62,140,0.3)' }}>
                        <Plus size={14} /> Create Server
                    </button>
                </div>
            </motion.div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid #1a1a1a', paddingBottom: 0 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        style={{
                            padding: '0.55rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                            color: tab === t.id ? '#e0e0e0' : '#555', fontSize: '0.82rem', fontWeight: tab === t.id ? 600 : 400,
                            borderBottom: tab === t.id ? '2px solid #E83E8C' : '2px solid transparent',
                            transition: 'all 0.15s', marginBottom: -1,
                        }}>{t.label}</button>
                ))}
            </div>

            {/* My Servers */}
            {tab === 'my' && (
                <div>
                    {myServers.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Users size={22} style={{ color: '#333' }} />
                            </div>
                            <p style={{ color: '#555', fontSize: '0.88rem', marginBottom: '1rem' }}>No servers yet</p>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button onClick={() => setShowCreate(true)} style={{ padding: '0.55rem 1rem', borderRadius: 8, background: '#E83E8C', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Create Server</button>
                                <button onClick={() => setShowJoin(true)} style={{ padding: '0.55rem 1rem', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', fontSize: '0.82rem', cursor: 'pointer' }}>Join with Code</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {myServers.map(server => (
                                <motion.div key={server.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                        {server.icon || '🔬'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '0.9rem' }}>{server.name}</span>
                                            {server.is_public
                                                ? <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: '#888', background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '1px 6px', borderRadius: 99 }}><Globe size={9} />Public</span>
                                                : <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: '#555', background: '#111', border: '1px solid #1a1a1a', padding: '1px 6px', borderRadius: 99 }}><Lock size={9} />Private</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Hash size={11} style={{ color: '#444' }} />
                                            <code style={{ color: '#666', fontSize: '0.75rem', fontFamily: 'monospace' }}>{server.invite_code}</code>
                                            <button onClick={() => copyCode(server.invite_code)}
                                                style={{ background: 'none', border: 'none', color: copiedCode === server.invite_code ? '#E83E8C' : '#444', cursor: 'pointer', padding: 2 }}>
                                                {copiedCode === server.invite_code ? <Check size={11} /> : <Copy size={11} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#666', fontSize: '0.75rem' }}>
                                        <Users size={12} />
                                        {server.members_count || 1}
                                    </div>
                                    <ChevronRight size={14} style={{ color: '#333' }} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Discover public servers */}
            {tab === 'discover' && (
                <div>
                    <form onSubmit={e => { e.preventDefault(); fetchPublicServers(); }} style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search public servers..."
                                style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.75rem 0.55rem 2rem', borderRadius: 8, background: '#111', border: '1px solid #222', color: '#ddd', fontSize: '0.83rem', outline: 'none' }} />
                        </div>
                        <button type="submit" style={{ padding: '0.55rem 1rem', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', fontSize: '0.8rem', cursor: 'pointer' }}>Search</button>
                    </form>

                    {publicServers.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: '3rem', color: '#444', fontSize: '0.88rem' }}>
                            No public servers found. <span style={{ color: '#E83E8C', cursor: 'pointer' }} onClick={() => setShowCreate(true)}>Create the first one!</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {publicServers.map(server => (
                                <motion.div key={server.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{server.icon || '🔬'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{server.name}</div>
                                        {server.description && <p style={{ color: '#555', fontSize: '0.75rem', margin: 0 }}>{server.description}</p>}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#555', fontSize: '0.75rem', marginRight: 8 }}>
                                        <Users size={12} />{server.members_count || 1}
                                    </div>
                                    <button onClick={() => { setJoinCode(server.invite_code); setTab('join'); }}
                                        style={{ padding: '0.4rem 0.8rem', borderRadius: 8, background: 'rgba(232,62,140,0.08)', border: '1px solid rgba(232,62,140,0.2)', color: '#E83E8C', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                                        Join
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Join by Code */}
            {tab === 'join' && (
                <div style={{ maxWidth: 420 }}>
                    <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: '1rem' }}>
                        Enter an invite code (format: <code style={{ color: '#888', fontFamily: 'monospace' }}>CLR-XXXXXX</code>) shared by another researcher
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={joinCode} onChange={e => setJoinCode(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && joinByCode()}
                            placeholder="CLR-XXXXXX"
                            style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: 8, background: '#111', border: '1px solid #222', color: '#e0e0e0', fontSize: '0.9rem', fontFamily: 'monospace', outline: 'none', textTransform: 'uppercase' }} />
                        <button onClick={joinByCode} disabled={!joinCode.trim() || joining}
                            style={{ padding: '0.65rem 1.2rem', borderRadius: 8, background: '#E83E8C', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: (!joinCode.trim() || joining) ? 0.5 : 1 }}>
                            {joining ? '...' : 'Join'}
                        </button>
                    </div>
                    {joinError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 8 }}>{joinError}</p>}
                </div>
            )}

            {/* Create Server Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '1.75rem', width: 380 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#fff', fontWeight: 700, margin: 0 }}>Create Research Server</h3>
                                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={16} /></button>
                            </div>

                            {/* Icon picker */}
                            <p style={{ color: '#555', fontSize: '0.73rem', marginBottom: 6 }}>Server Icon</p>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {SERVER_ICONS.map(ic => (
                                    <button key={ic} onClick={() => setServerIcon(ic)}
                                        style={{ width: 34, height: 34, borderRadius: 8, fontSize: '1rem', background: serverIcon === ic ? '#1e1e1e' : 'transparent', border: serverIcon === ic ? '1px solid #333' : '1px solid #1a1a1a', cursor: 'pointer' }}>{ic}</button>
                                ))}
                            </div>

                            <input value={serverName} onChange={e => setServerName(e.target.value)} placeholder="Server name *"
                                style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: 8, background: '#0a0a0a', border: '1px solid #222', color: '#e0e0e0', fontSize: '0.88rem', outline: 'none', marginBottom: 8 }} />
                            <textarea value={serverDesc} onChange={e => setServerDesc(e.target.value)} placeholder="Description (optional)" rows={2}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem', borderRadius: 8, background: '#0a0a0a', border: '1px solid #222', color: '#e0e0e0', fontSize: '0.85rem', outline: 'none', marginBottom: '1rem', resize: 'none', fontFamily: 'inherit' }} />

                            {/* Public toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0.75rem', borderRadius: 8, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                                <div>
                                    <div style={{ color: '#d0d0d0', fontSize: '0.85rem', fontWeight: 500 }}>Public Server</div>
                                    <div style={{ color: '#555', fontSize: '0.72rem' }}>Anyone can discover and join</div>
                                </div>
                                <div onClick={() => setIsPublic(!isPublic)} style={{ width: 36, height: 20, borderRadius: 99, background: isPublic ? '#E83E8C' : '#1e1e1e', border: `1px solid ${isPublic ? '#E83E8C' : '#2a2a2a'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
                                    <div style={{ position: 'absolute', top: 2, left: isPublic ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                </div>
                            </div>

                            <button onClick={createServer} disabled={!serverName.trim() || creating}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: serverName.trim() ? '#E83E8C' : '#1a1a1a', color: serverName.trim() ? '#fff' : '#444', border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: serverName.trim() ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                                {creating ? 'Creating...' : 'Create Server'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Join Modal */}
            <AnimatePresence>
                {showJoin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={e => e.target === e.currentTarget && setShowJoin(false)}>
                        <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }}
                            style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '1.75rem', width: 360 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#fff', fontWeight: 700, margin: 0 }}>Join a Server</h3>
                                <button onClick={() => setShowJoin(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1rem' }}>Enter invite code from another researcher</p>
                            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && joinByCode()}
                                placeholder="CLR-XXXXXX"
                                style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.75rem', borderRadius: 8, background: '#0a0a0a', border: '1px solid #222', color: '#e0e0e0', fontSize: '0.95rem', fontFamily: 'monospace', outline: 'none', marginBottom: 8, letterSpacing: '0.05em' }} />
                            {joinError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 8 }}>{joinError}</p>}
                            <button onClick={joinByCode} disabled={!joinCode.trim() || joining}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: 8, background: joinCode.trim() ? '#E83E8C' : '#1a1a1a', color: joinCode.trim() ? '#fff' : '#444', border: 'none', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                                {joining ? 'Joining...' : 'Join Server'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
