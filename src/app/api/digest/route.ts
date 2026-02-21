import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { projectId } = await req.json();
        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        // Get recent unread sessions
        const { data: sessions } = await supabase
            .from('sessions')
            .select('summary, open_questions, title, created_at')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .not('ended_at', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5);

        if (!sessions?.length) {
            return NextResponse.json({ digest: null, reason: 'Not enough session data' });
        }

        // Get concept clusters for gap analysis
        const { data: concepts } = await supabase
            .from('concepts')
            .select('label, weight, cluster')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .order('weight', { ascending: false })
            .limit(30);

        const allOpenQuestions = sessions.flatMap(s => s.open_questions || []);
        const sessionSummaries = sessions.map(s => s.summary).filter(Boolean).join('\n');
        const conceptList = concepts?.map(c => `${c.label} (weight: ${c.weight})`).join(', ') || '';

        // Generate digest with GPT-4o-mini
        // openai shim routes to Groq llama-3.3-70b-versatile automatically
        const response = await openai.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a proactive research intelligence system. Analyze the user's research patterns and generate actionable insights. Return JSON only.`,
                },
                {
                    role: 'user',
                    content: `Recent session summaries:\n${sessionSummaries}\n\nKnown concepts: ${conceptList}\n\nOpen questions: ${allOpenQuestions.slice(0, 10).join(', ')}\n\nGenerate a research digest. Return JSON: {
  "connections_found": [{"concept_a": "...", "concept_b": "...", "description": "...", "similarity": 0.85}],
  "gaps_detected": ["underexplored area 1", "underexplored area 2"],
  "suggested_questions": ["...", "..."]
}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.6,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');

        // Store digest
        const { data: digest } = await supabase
            .from('research_digests')
            .insert({
                project_id: projectId,
                user_id: user.id,
                connections_found: parsed.connections_found || [],
                gaps_detected: parsed.gaps_detected || [],
                open_questions: allOpenQuestions.slice(0, 5),
            })
            .select()
            .single();

        return NextResponse.json({
            digest: {
                ...digest,
                suggested_questions: parsed.suggested_questions || [],
            },
        });

    } catch (error: unknown) {
        console.error('Digest error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate digest';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        const { data: digest } = await supabase
            .from('research_digests')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return NextResponse.json({ digest: digest || null });
    } catch {
        return NextResponse.json({ digest: null });
    }
}
