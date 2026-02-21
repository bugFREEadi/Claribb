'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types';

interface Props {
    project: Project;
    onClick: () => void;
}

const PROJECT_ICONS: Record<string, string> = {
    '🔬': '🔬', '📚': '📚', '💡': '💡', '🧠': '🧠', '📊': '📊',
    '🌍': '🌍', '⚡': '⚡', '🎯': '🎯', '🔭': '🔭', '🧬': '🧬',
};

export default function ProjectCard({ project, onClick }: Props) {
    const score = Math.min(project.depth_score ?? 0, 100);

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            className="cursor-pointer group"
            style={{
                background: '#0f0f0f',
                border: '1px solid #222',
                borderRadius: 14,
                padding: '1.4rem 1.5rem',
                transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.background = '#141414';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.background = '#0f0f0f';
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Icon — neutral gray box */}
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: '#1a1a1a', border: '1px solid #2a2a2a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', flexShrink: 0,
                    }}>
                        {PROJECT_ICONS[project.icon] || '🔬'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        {/* White project name */}
                        <h3 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.92rem', margin: 0, lineHeight: 1.3 }}>
                            {project.name}
                        </h3>
                        {/* Gray description */}
                        <p style={{ color: '#5a5a5a', fontSize: '0.73rem', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {project.description || 'Research Project'}
                        </p>
                    </div>
                </div>

                {/* Score badge — white text on dark charcoal */}
                <div style={{
                    flexShrink: 0, padding: '0.2rem 0.55rem', borderRadius: 20,
                    background: '#1c1c1c', border: '1px solid #2e2e2e',
                }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: score >= 60 ? '#d0d0d0' : '#555' }}>
                        {score}/100
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#1a1a1a', marginBottom: '1rem' }} />

            {/* Stats row — white numbers, gray labels */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
                {[
                    { value: project.memory_count || 0, label: 'Memories' },
                    { value: project.session_count || 0, label: 'Sessions' },
                    { value: project.concept_count || 0, label: 'Concepts' },
                ].map(({ value, label }) => (
                    <div key={label} style={{
                        flex: 1, padding: '0.5rem 0', borderRadius: 8, textAlign: 'center',
                        background: '#080808', border: '1px solid #1c1c1c',
                    }}>
                        {/* Bright white number */}
                        <div style={{ color: '#e8e8e8', fontWeight: 700, fontSize: '1rem' }}>{value}</div>
                        {/* Mid-gray label */}
                        <div style={{ color: '#484848', fontSize: '0.63rem', marginTop: 2 }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    {/* Dark gray label */}
                    <span style={{ color: '#484848', fontSize: '0.68rem' }}>Knowledge Depth</span>
                    {/* Mid-gray value */}
                    <span style={{ color: '#666', fontSize: '0.68rem' }}>{score}%</span>
                </div>
                {/* Track: very dark, Fill: light gray that pops to pink at high score */}
                <div style={{ height: 3, borderRadius: 99, background: '#1c1c1c', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                        style={{
                            height: '100%', borderRadius: 99,
                            background: score >= 80
                                ? 'linear-gradient(90deg, #E83E8C, #f472b6)'   // pink — excellent
                                : score >= 50
                                    ? '#888'                                         // gray — good
                                    : '#333',                                        // dark gray — low
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Dark gray date */}
                <span style={{ color: '#3e3e3e', fontSize: '0.68rem' }}>
                    {new Date(project.updated_at || project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {/* PINK — the ONE accent in the card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', fontWeight: 600, color: '#E83E8C', opacity: 0.65, transition: 'opacity 0.2s' }}
                    className="group-hover:opacity-100">
                    Open <ArrowUpRight size={11} />
                </div>
            </div>
        </motion.div>
    );
}
