import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;

        // Auth check
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminSupabaseClient();

        // Verify user is a member of this server
        const { data: membership } = await admin
            .from('server_members')
            .select('role')
            .eq('server_id', serverId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (!membership) return NextResponse.json({ error: 'Not a server member' }, { status: 403 });

        const { question, serverName, history } = await req.json();
        if (!question?.trim()) return NextResponse.json({ error: 'question required' }, { status: 400 });

        // Build context from recent chat history
        const recentHistory = (history || []).slice(-10).map((m: { role: string; content: string; user_name?: string }) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.role === 'user' ? `${m.user_name || 'Researcher'}: ${m.content}` : m.content,
        }));

        const response = await openai.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are CLARIBB, an AI research assistant embedded in a collaborative research server called "${serverName || 'Research Server'}". 
You are helping a group of researchers collaborate and think together.
Be concise, insightful, and engage with the group's discussion.
When answering, address the group — you can say "Great question" or "Building on what was discussed..." to feel collaborative.
Keep responses focused and under 300 words unless deep analysis is explicitly needed.`,
                },
                ...recentHistory,
                { role: 'user', content: question },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const aiContent = response.choices[0].message.content || 'I could not generate a response.';

        // Save AI message to server_messages
        await admin.from('server_messages').insert({
            server_id: serverId,
            user_id: user.id, // AI message attributed to triggering user's account
            user_name: 'CLARIBB AI',
            role: 'ai',
            content: aiContent,
        });

        return NextResponse.json({ content: aiContent });
    } catch (err) {
        console.error('[server chat AI]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
