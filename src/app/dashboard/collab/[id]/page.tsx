'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Hash, Globe, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Server {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    invite_code: string;
    is_public?: boolean;
    members_count?: number;
    owner_id?: string;
    my_role?: string;
    created_at?: string;
}

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [server, setServer] = useState<Server | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        const fetchServer = async () => {
            try {
                // Fetch from my servers to get role info
                const res = await fetch('/api/servers?mine=true');
                const data = await res.json();
                const found = (data.servers || []).find((s: Server) => s.id === id);
                setServer(found || null);
            } catch {
                setServer(null);
            } finally {
                setLoading(false);
            }
        };
        fetchServer();
    }, [id]);

    const copyCode = () => {
        if (!server) return;
        navigator.clipboard.writeText(server.invite_code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={20} style={{ color: '#444', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!server) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>Server not found or you don&apos;t have access.</p>
                <button onClick={() => router.push('/dashboard/collab')}
                    style={{ padding: '0.5rem 1rem', borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', fontSize: '0.82rem', cursor: 'pointer' }}>
                    ← Back to Collab
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '2.5rem 2.5rem 4rem' }}>
            {/* Back */}
            <button onClick={() => router.push('/dashboard/collab')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#555', fontSize: '0.82rem', cursor: 'pointer', marginBottom: '1.75rem', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#888')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                <ArrowLeft size={14} /> Back to Collab
            </button>

            {/* Server header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                    {server.icon || '🔬'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{server.name}</h1>
                        {server.my_role === 'owner' && (
                            <span style={{ fontSize: '0.63rem', color: '#E83E8C', background: 'rgba(232,62,140,0.08)', border: '1px solid rgba(232,62,140,0.2)', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>Owner</span>
                        )}
                        {server.is_public
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: '#888', background: '#1a1a1a', border: '1px solid #2a2a2a', padding: '2px 7px', borderRadius: 99 }}><Globe size={9} />Public</span>
                            : <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color: '#555', background: '#111', border: '1px solid #1a1a1a', padding: '2px 7px', borderRadius: 99 }}><Lock size={9} />Private</span>}
                    </div>
                    {server.description && <p style={{ color: '#555', fontSize: '0.82rem', margin: '0 0 8px' }}>{server.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Hash size={12} style={{ color: '#333' }} />
                        <code style={{ color: '#666', fontSize: '0.78rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{server.invite_code}</code>
                        <button onClick={copyCode}
                            style={{ background: 'none', border: 'none', color: copiedCode ? '#E83E8C' : '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem' }}>
                            {copiedCode ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy invite</>}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#555' }}>
                    <Users size={14} />
                    <span>{server.members_count || 1} member{(server.members_count || 1) !== 1 ? 's' : ''}</span>
                </div>
            </motion.div>

            {/* Server content area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
                {/* Main channel */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Hash size={13} style={{ color: '#444' }} />
                        <span style={{ color: '#888', fontSize: '0.82rem', fontWeight: 600 }}>general</span>
                    </div>
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                        <p style={{ color: '#2e2e2e', fontSize: '0.85rem', marginBottom: 8 }}>Share this server&apos;s invite code to invite researchers:</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', borderRadius: 8, background: '#111', border: '1px solid #1e1e1e' }}>
                            <code style={{ color: '#888', fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{server.invite_code}</code>
                            <button onClick={copyCode}
                                style={{ background: 'none', border: 'none', color: copiedCode ? '#E83E8C' : '#444', cursor: 'pointer' }}>
                                {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                        </div>
                        <p style={{ color: '#2a2a2a', fontSize: '0.75rem', marginTop: 24 }}>
                            Collaborative research workspace — shared projects coming soon
                        </p>
                    </div>
                </motion.div>

                {/* Sidebar: info */}
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1rem' }}>
                        <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Server Info</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#444', fontSize: '0.75rem' }}>Members</span>
                                <span style={{ color: '#888', fontSize: '0.75rem' }}>{server.members_count || 1}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#444', fontSize: '0.75rem' }}>Visibility</span>
                                <span style={{ color: '#888', fontSize: '0.75rem' }}>{server.is_public ? 'Public' : 'Private'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#444', fontSize: '0.75rem' }}>Your role</span>
                                <span style={{ color: server.my_role === 'owner' ? '#E83E8C' : '#888', fontSize: '0.75rem', textTransform: 'capitalize' }}>{server.my_role || 'member'}</span>
                            </div>
                            {server.created_at && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#444', fontSize: '0.75rem' }}>Created</span>
                                    <span style={{ color: '#888', fontSize: '0.75rem' }}>{new Date(server.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
