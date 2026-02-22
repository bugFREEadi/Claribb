import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        // Verify user
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { invite_code } = await req.json();
        if (!invite_code) return NextResponse.json({ error: 'invite_code required' }, { status: 400 });

        const admin = createAdminSupabaseClient();

        // Find server by invite code
        const { data: server, error: findErr } = await admin
            .from('research_servers')
            .select('*')
            .eq('invite_code', (invite_code as string).trim().toUpperCase())
            .single();

        if (findErr || !server) {
            return NextResponse.json({ error: 'Invalid invite code. Server not found.' }, { status: 404 });
        }

        // Check if already a member
        const { data: existing } = await admin
            .from('server_members')
            .select('id')
            .eq('server_id', server.id)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ server, already_member: true });
        }

        // Join
        const { error: joinErr } = await admin
            .from('server_members')
            .insert({ server_id: server.id, user_id: user.id, role: 'member' });

        if (joinErr) throw joinErr;

        return NextResponse.json({ server, joined: true });
    } catch (err) {
        console.error('[servers/join POST]', err);
        return NextResponse.json({ error: `Failed to join: ${String(err)}` }, { status: 500 });
    }
}
