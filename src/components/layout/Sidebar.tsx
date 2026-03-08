'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, LayoutDashboard, FolderOpen, Network, Settings,
    LogOut, ChevronLeft, ChevronRight, Plus,
    Globe, FolderKanban, Users, X, Menu
} from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
    { href: '/dashboard/groups', label: 'Groups', icon: FolderKanban },
    { href: '/dashboard/discover', label: 'Discover', icon: Globe },
    { href: '/dashboard/collab', label: 'Collab', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// Mobile bottom nav shows only the core 4 items
const mobileNavItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
    { href: '/dashboard/discover', label: 'Discover', icon: Globe },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null);
    // Track last visited project so Knowledge Graph link goes somewhere useful
    const [lastProjectId, setLastProjectId] = useState<string | null>(null);
    const supabase = createClientSupabaseClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser({ email: user.email || '', full_name: user.user_metadata?.full_name });
            }
        });
    }, [supabase]);

    // Extract projectId from URL when visiting workspace/graph
    useEffect(() => {
        const workspaceMatch = pathname.match(/\/dashboard\/workspace\/([^/]+)/);
        const graphMatch = pathname.match(/\/dashboard\/graph\/([^/]+)/);
        const id = workspaceMatch?.[1] || graphMatch?.[1];
        if (id) setLastProjectId(id);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : user?.email?.slice(0, 2).toUpperCase() || 'SG';

    // Knowledge Graph href: last visited project → localStorage project → projects list
    const graphHref = (() => {
        if (lastProjectId) return `/dashboard/graph/${lastProjectId}`;
        try {
            const local = JSON.parse(localStorage.getItem('claribb_local_projects') || '[]');
            if (local.length > 0) return `/dashboard/graph/${local[0].id}`;
        } catch { /* ignore */ }
        return '/dashboard/projects';
    })();

    const isGraphActive = pathname.startsWith('/dashboard/graph');

    return (
        <>
            {/* ══ DESKTOP SIDEBAR (md+) ══════════════════════════════ */}
            <motion.aside
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="relative hidden md:flex flex-col h-screen shrink-0"
                style={{
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)', textDecoration: 'none' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{
                        background: 'rgba(79,124,255,0.1)',
                        border: '1px solid rgba(79,124,255,0.25)',
                    }}>
                        <Brain className="w-5 h-5" style={{ color: '#4F7CFF' }} />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-lg font-bold"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            CLARIBB
                        </motion.span>
                    )}
                </Link>

                {/* New Project button */}
                <div className="px-3 pt-4 pb-2">
                    <Link href="/dashboard?create=1" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                        style={{
                            background: 'rgba(79,124,255,0.06)',
                            border: '1px solid rgba(79,124,255,0.16)',
                            color: '#7B9FFF',
                        }}
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>New Project</span>}
                    </Link>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-2 space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link key={href} href={href}>
                                <div
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                                    style={{
                                        background: isActive ? 'rgba(79,124,255,0.08)' : 'transparent',
                                        color: isActive ? '#7B9FFF' : 'var(--text-secondary)',
                                        border: isActive ? '1px solid rgba(79,124,255,0.18)' : '1px solid transparent',
                                    }}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {!collapsed && <span>{label}</span>}
                                    {!collapsed && isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                                    )}
                                </div>
                            </Link>
                        );
                    })}

                    {/* Knowledge Graph — only shown once a project is open */}
                    {lastProjectId && (
                        <Link href={graphHref}>
                            <div
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                                style={{
                                    background: isGraphActive ? 'rgba(79,124,255,0.08)' : 'transparent',
                                    color: isGraphActive ? '#7B9FFF' : 'var(--text-secondary)',
                                    border: isGraphActive ? '1px solid rgba(79,124,255,0.18)' : '1px solid transparent',
                                }}
                            >
                                <Network className="w-4 h-4 shrink-0" />
                                {!collapsed && <span>Knowledge Graph</span>}
                                {!collapsed && isGraphActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                                )}
                            </div>
                        </Link>
                    )}
                </nav>

                {/* User section */}
                <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all hover:scale-[1.02]"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{
                            background: 'rgba(79,124,255,0.1)',
                            border: '1px solid rgba(79,124,255,0.22)',
                            color: '#4F7CFF',
                        }}>
                            {initials}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 text-left min-w-0">
                                <div className="truncate font-medium" style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                                    {user?.full_name || user?.email?.split('@')[0] || 'Researcher'}
                                </div>
                            </div>
                        )}
                        {!collapsed && <LogOut className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
                    style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </motion.aside>

            {/* ══ MOBILE TOP HEADER + BOTTOM NAV ════════════════════ */}
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
                style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
                <Link href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                        background: 'rgba(79,124,255,0.1)',
                        border: '1px solid rgba(79,124,255,0.25)',
                    }}>
                        <Brain className="w-4 h-4" style={{ color: '#4F7CFF' }} />
                    </div>
                    <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>CLARIBB</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard?create=1"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.18)', color: '#7B9FFF' }}>
                        <Plus className="w-3.5 h-3.5" /> New
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(o => !o)}
                        className="flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                    >
                        {mobileMenuOpen ? <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> : <Menu className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                    </button>
                </div>
            </div>

            {/* Mobile full nav overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22 }}
                        className="md:hidden fixed top-14 left-0 right-0 z-40 overflow-y-auto"
                        style={{ background: 'rgba(8,8,10,0.98)', borderBottom: '1px solid var(--border)', maxHeight: 'calc(100vh - 56px)' }}
                    >
                        <div className="px-4 py-4">
                            <nav className="flex flex-col gap-1 mb-4">
                                {navItems.map(({ href, label, icon: Icon }) => {
                                    const isActive = href === '/dashboard'
                                        ? pathname === '/dashboard'
                                        : pathname === href || pathname.startsWith(href + '/');
                                    return (
                                        <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors"
                                                style={{
                                                    background: isActive ? 'rgba(79,124,255,0.08)' : 'transparent',
                                                    color: isActive ? '#7B9FFF' : 'var(--text-secondary)',
                                                    border: isActive ? '1px solid rgba(79,124,255,0.18)' : '1px solid transparent',
                                                }}>
                                                <Icon className="w-4 h-4 shrink-0" />
                                                {label}
                                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
                                            </div>
                                        </Link>
                                    );
                                })}
                                {lastProjectId && (
                                    <Link href={graphHref} onClick={() => setMobileMenuOpen(false)}>
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium"
                                            style={{ color: isGraphActive ? '#7B9FFF' : 'var(--text-secondary)', border: '1px solid transparent' }}>
                                            <Network className="w-4 h-4 shrink-0" />
                                            Knowledge Graph
                                        </div>
                                    </Link>
                                )}
                            </nav>
                            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <button onClick={handleSignOut}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[14px]"
                                    style={{ color: 'var(--text-muted)' }}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                        style={{ background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.22)', color: '#4F7CFF' }}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-[13px]" style={{ color: 'var(--text-primary)' }}>
                                            {user?.full_name || user?.email?.split('@')[0] || 'Researcher'}
                                        </div>
                                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Sign out</div>
                                    </div>
                                    <LogOut className="w-4 h-4 shrink-0" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile bottom tab bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pb-safe"
                style={{
                    background: 'rgba(8,8,10,0.96)',
                    borderTop: '1px solid var(--border)',
                    backdropFilter: 'blur(16px)',
                    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                    paddingTop: 8,
                }}>
                {mobileNavItems.map(({ href, label, icon: Icon }) => {
                    const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link key={href} href={href} className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-colors"
                            style={{ color: isActive ? '#7B9FFF' : 'var(--text-muted)' }}>
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
                {lastProjectId && (
                    <Link href={graphHref} className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-colors"
                        style={{ color: isGraphActive ? '#7B9FFF' : 'var(--text-muted)' }}>
                        <Network className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Graph</span>
                    </Link>
                )}
            </div>
        </>
    );
}
