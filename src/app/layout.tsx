import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'CLARIBB — Multi-Agent Research Intelligence',
    description: 'CLARIBB is a persistent, memory-driven AI research workspace that remembers everything across sessions, surfaces relevant context automatically, and deploys 5 specialized agents to think, search, challenge, connect, and detect conflicts on your behalf.',
    keywords: ['AI research', 'knowledge management', 'RAG', 'research assistant', 'AI memory'],
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
    openGraph: {
        title: 'CLARIBB — Multi-Agent Research Intelligence',
        description: "The AI that remembers your research, so you don't have to.",
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased" suppressHydrationWarning>{children}</body>
        </html>
    );
}
