'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Brain, Database, BookOpen, Network, ChevronRight, TrendingUp } from 'lucide-react';
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
    const circumference = 2 * Math.PI * 30;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const scoreColor = score >= 70 ? '#4dd8cc' : score >= 40 ? '#d4a853' : '#7ae8e0';

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl cursor-pointer transition-all group"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{
                        background: `${project.color}20`,
                        border: `1px solid ${project.color}40`,
                    }}>
                        {PROJECT_ICONS[project.icon] || '🔬'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {project.name}
                        </h3>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                            {project.description || 'Research Project'}
                        </p>
                    </div>
                </div>

                {/* Depth Score Ring */}
                <div className="relative w-16 h-16 shrink-0">
                    <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(77,216,204,0.1)" strokeWidth="5" />
                        <motion.circle
                            cx="32" cy="32" r="26"
                            fill="none"
                            stroke={scoreColor}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                            animate={{ strokeDashoffset: (2 * Math.PI * 26) - (score / 100) * (2 * Math.PI * 26) }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { icon: Database, value: project.memory_count || 0, label: 'Memories', color: '#4dd8cc' },
                    { icon: BookOpen, value: project.session_count || 0, label: 'Sessions', color: '#7ae8e0' },
                    { icon: Network, value: project.concept_count || 0, label: 'Concepts', color: '#d4a853' },
                ].map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="p-3 rounded-xl text-center" style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                    }}>
                        <Icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color }} />
                        <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Depth progress bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Knowledge Depth</span>
                    <span className="text-xs font-medium" style={{ color: scoreColor }}>{score}/100</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(77,216,204,0.08)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }}
                    />
                </div>
            </div>

            {/* Open button */}
            <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(project.updated_at || project.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                    })}
                </span>
                <div className="flex items-center gap-1 text-xs font-medium transition-colors group-hover:text-white" style={{ color: 'var(--accent-light)' }}>
                    Open Workspace <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}
