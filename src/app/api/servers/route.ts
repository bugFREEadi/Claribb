import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine') === 'true';
    const isPublic = searchParams.get('public') === 'true';
    const search = searchParams.get('q') || '';
    const code = searchParams.get('code') || '';

    try {
        // Verify user via cookie-based auth
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Use admin client for DB queries (bypasses RLS reliably)
        const admin = createAdminSupabaseClient();

        if (code) {
            const { data } = await admin
                .from('research_servers')
                .select('*')
                .eq('invite_code', code.toUpperCase())
                .single();
            return NextResponse.json({ server: data || null });
        }

        if (mine) {
            const { data, error } = await admin
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

        if (isPublic) {
            let query = admin
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
        return NextResponse.json({ servers: [], error: String(err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Verify identity first
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        if (!body.name?.trim()) return NextResponse.json({ error: 'Server name is required' }, { status: 400 });

        // Use admin client — bypasses RLS, no auth context issues
        const admin = createAdminSupabaseClient();
        const code = `CLR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Insert server — start members_count at 0, trigger will increment to 1 on member insert
        const { data: server, error: serverErr } = await admin
            .from('research_servers')
            .insert({
                name: body.name.trim(),
                description: body.description || '',
                icon: body.icon || '🔬',
                owner_id: user.id,
                invite_code: code,
                is_public: body.is_public ?? false,
                members_count: 0,
            })
            .select()
            .single();

        if (serverErr) throw serverErr;

        // Auto-join owner as member (trigger updates members_count to 1)
        const { error: memberErr } = await admin
            .from('server_members')
            .insert({ server_id: server.id, user_id: user.id, role: 'owner' });

        if (memberErr) throw memberErr;

        return NextResponse.json({ server: { ...server, my_role: 'owner' } });
    } catch (err) {
        console.error('[servers POST]', err);
        return NextResponse.json({ error: `Failed to create server: ${String(err)}` }, { status: 500 });
    }
}
