import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// POST /api/servers/join  { invite_code: "CLR-XXXXXX" }
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { invite_code } = await req.json();
        if (!invite_code) return NextResponse.json({ error: 'invite_code required' }, { status: 400 });

        // Find the server
        const { data: server, error: findErr } = await supabase
            .from('research_servers')
            .select('*')
            .eq('invite_code', (invite_code as string).toUpperCase())
            .single();

        if (findErr || !server) {
            return NextResponse.json({ error: 'Invalid invite code. Server not found.' }, { status: 404 });
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from('server_members')
            .select('id')
            .eq('server_id', server.id)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ server, already_member: true });
        }

        // Insert membership
        const { error: joinErr } = await supabase
            .from('server_members')
            .insert({ server_id: server.id, user_id: user.id, role: 'member' });

        if (joinErr) throw joinErr;

        return NextResponse.json({ server, joined: true });
    } catch (err) {
        console.error('[servers/join POST]', err);
        return NextResponse.json({ error: 'Failed to join server' }, { status: 500 });
    }
}
