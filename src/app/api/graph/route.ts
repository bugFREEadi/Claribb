import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get('projectId');

        if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

        // Fetch concepts (nodes)
        const { data: concepts, error: conceptsError } = await supabase
            .from('concepts')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .order('weight', { ascending: false })
            .limit(80);

        if (conceptsError) throw conceptsError;

        // Fetch relationships (edges) 
        const { data: relationships, error: relError } = await supabase
            .from('concept_relationships')
            .select('*')
            .eq('project_id', projectId)
            .limit(200);

        if (relError) throw relError;

        return NextResponse.json({
            nodes: concepts || [],
            edges: relationships || [],
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch graph';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
