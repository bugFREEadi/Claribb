'use client';
/**
 * SAGE Landing Page — entry point
 *
 * We use `ssr: false` to completely skip server-side rendering for the
 * animated landing page. This is the definitive fix for React 19 /
 * Next.js 15 hydration errors caused by framer-motion motion components
 * rendering differently on server vs client (initial/animate values,
 * MotionValue styles, useScroll, useInView etc).
 *
 * Trade-off: no SSR for the landing page content.
 * Mitigation: dark background shown instantly while JS loads (< 100ms).
 */
import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('./page-client'), {
    ssr: false,
    loading: () => (
        <div style={{
            background: '#000000',
            minHeight: '100vh',
            fontFamily: "'Inter', system-ui, sans-serif",
        }} />
    ),
});

export default function Page() {
    return <LandingPage />;
}
