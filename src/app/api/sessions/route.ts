import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import { storeMemory } from '@/lib/memory/store';

export const runtime = 'nodejs';

// GET: list sessions for a project
export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        const { data: sessions, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ sessions: sessions || [] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST: create a new session
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { projectId } = await req.json();

        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        const { data: session, error } = await supabase
            .from('sessions')
            .insert({
                project_id: projectId,
                user_id: user.id,
                title: `Session — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ session });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to create session';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PATCH: end a session + generate summary
export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { sessionId, projectId, conversationHistory } = await req.json();

        if (!sessionId || !conversationHistory?.length) {
            return NextResponse.json({ error: 'sessionId and conversationHistory required' }, { status: 400 });
        }

        // Generate session summary using GPT-4o-mini
        const conversationText = conversationHistory
            .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n\n');

        const response = await openai.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `Analyze this research conversation and generate a structured summary. Return JSON only.`,
                },
                {
                    role: 'user',
                    content: `Research conversation:\n\n${conversationText.slice(0, 6000)}\n\nReturn JSON: {
  "title": "brief session title (max 60 chars)",
  "summary": "2-3 sentence research summary",
  "resolved": ["what was answered/resolved"],
  "open_questions": ["what questions remain unanswered"],
  "key_insights": ["most important insights from this session"]
}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');

        // Update session with summary
        const { error: updateError } = await supabase
            .from('sessions')
            .update({
                title: parsed.title || 'Research Session',
                summary: parsed.summary || '',
                open_questions: parsed.open_questions || [],
                resolved_questions: parsed.resolved || [],
                ended_at: new Date().toISOString(),
            })
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Store session summary as memory
        if (parsed.summary && projectId) {
            const sessionTitle = parsed.title || 'Session';
            await storeMemory({
                userId: user.id,
                projectId,
                content: `Session Summary: ${parsed.summary}\n\nKey Insights:\n${(parsed.key_insights || []).join('\n')}`,
                sourceType: 'session',
                sourceLabel: sessionTitle,
                importanceScore: 0.8,
            });
        }

        return NextResponse.json({
            success: true,
            summary: parsed.summary,
            openQuestions: parsed.open_questions || [],
            resolved: parsed.resolved || [],
            title: parsed.title,
        });

    } catch (error: unknown) {
        console.error('Session end error:', error);
        const message = error instanceof Error ? error.message : 'Failed to end session';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
