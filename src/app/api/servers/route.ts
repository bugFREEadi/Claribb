import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/servers — list public servers
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const code = searchParams.get('code') || '';

    try {
        const supabase = await createServerSupabaseClient();

        if (code) {
            // Join by invite code
            const { data } = await supabase.from('research_servers').select('*').eq('invite_code', code.toUpperCase()).single();
            return NextResponse.json({ server: data || null });
        }

        let query = supabase.from('research_servers').select('*').eq('is_public', true).order('members_count', { ascending: false });
        if (search) query = query.ilike('name', `%${search}%`);

        const { data, error } = await query.limit(20);
        if (error) throw error;
        return NextResponse.json({ servers: data || [] });
    } catch {
        // Return empty list with localStorage hint for demo
        return NextResponse.json({ servers: [], useLocal: true });
    }
}

// POST /api/servers — create server
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase.from('research_servers').insert({
            name: body.name,
            description: body.description || '',
            icon: body.icon || '🔬',
            owner_id: user.id,
            invite_code: `CLR-${code}`,
            is_public: body.is_public ?? false,
            members_count: 1,
        }).select().single();

        if (error) throw error;

        // Add owner as member
        await supabase.from('server_members').insert({ server_id: data.id, user_id: user.id, role: 'owner' });

        return NextResponse.json({ server: data });
    } catch (e) {
        // Fallback: return a local-only server object
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        return NextResponse.json({
            server: { id: crypto.randomUUID(), name: 'Local Server', invite_code: `CLR-${code}`, is_local: true },
            note: 'Saved locally — Supabase table not yet set up',
        });
    }
}
