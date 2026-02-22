import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/servers
// ?mine=true  → servers the authenticated user belongs to
// ?public=true&q=xxx → public servers with optional search
// ?code=CLR-XXX → find server by invite code
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine') === 'true';
    const isPublic = searchParams.get('public') === 'true';
    const search = searchParams.get('q') || '';
    const code = searchParams.get('code') || '';

    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Look up by invite code
        if (code) {
            const { data } = await supabase
                .from('research_servers')
                .select('*')
                .eq('invite_code', code.toUpperCase())
                .single();
            return NextResponse.json({ server: data || null });
        }

        // My servers — joined or owned
        if (mine) {
            const { data, error } = await supabase
                .from('server_members')
                .select('role, research_servers(*)')
                .eq('user_id', user.id)
                .order('joined_at', { ascending: false });
            if (error) throw error;
            const servers = (data || []).map((row: { role: string; research_servers: unknown }) => ({
                ...(row.research_servers as Record<string, unknown>),
                my_role: row.role,
            }));
            return NextResponse.json({ servers });
        }

        // Public servers discovery
        if (isPublic) {
            let query = supabase
                .from('research_servers')
                .select('*')
                .eq('is_public', true)
                .order('members_count', { ascending: false })
                .limit(20);
            if (search) query = query.ilike('name', `%${search}%`);
            const { data, error } = await query;
            if (error) throw error;
            return NextResponse.json({ servers: data || [] });
        }

        return NextResponse.json({ servers: [] });
    } catch (err) {
        console.error('[servers GET]', err);
        return NextResponse.json({ servers: [], error: 'Failed to fetch servers' }, { status: 500 });
    }
}

// POST /api/servers — create a new server
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const code = `CLR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const { data: server, error } = await supabase
            .from('research_servers')
            .insert({
                name: body.name?.trim(),
                description: body.description || '',
                icon: body.icon || '🔬',
                owner_id: user.id,
                invite_code: code,
                is_public: body.is_public ?? false,
                members_count: 1,
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-join as owner
        await supabase.from('server_members').insert({
            server_id: server.id,
            user_id: user.id,
            role: 'owner',
        });

        return NextResponse.json({ server });
    } catch (err) {
        console.error('[servers POST]', err);
        return NextResponse.json({ error: 'Failed to create server' }, { status: 500 });
    }
}
