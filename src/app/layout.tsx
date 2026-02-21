import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'SAGE — Multi-Agent Research Intelligence',
    description: 'SAGE is a persistent, memory-driven AI research workspace that remembers everything across sessions, surfaces relevant context automatically, and deploys 4 specialized agents to think, search, challenge, and connect on your behalf.',
    keywords: ['AI research', 'knowledge management', 'RAG', 'research assistant', 'AI memory'],
    openGraph: {
        title: 'SAGE — Multi-Agent Research Intelligence',
        description: 'The AI that remembers your research, so you don\'t have to.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
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
