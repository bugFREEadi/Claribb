import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * POST /api/servers/[serverId]/messages
 * Send a user message to a server's chat.
 * Uses admin client to bypass RLS — membership is verified manually.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ serverId: string }> }) {
    try {
        const { serverId } = await params;

        // Auth: cookie-based first, then Bearer token fallback
        let userId: string | null = null;
        let userName = 'Researcher';

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            userId = user.id;
            userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Researcher';
        } else {
            const authHeader = req.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.slice(7);
                const admin = createAdminSupabaseClient();
                const { data: { user: tokenUser } } = await admin.auth.getUser(token);
                if (tokenUser) {
                    userId = tokenUser.id;
                    userName = tokenUser.user_metadata?.full_name || tokenUser.email?.split('@')[0] || 'Researcher';
                }
            }
        }

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminSupabaseClient();

        // Verify membership
        const { data: membership } = await admin
            .from('server_members')
            .select('role')
            .eq('server_id', serverId)
            .eq('user_id', userId)
            .maybeSingle();

        if (!membership) return NextResponse.json({ error: 'Not a member of this server' }, { status: 403 });

        const body = await req.json();
        const content = body.content?.trim();
        const displayName = body.user_name || userName; // client can override display name

        if (!content) return NextResponse.json({ error: 'content is required' }, { status: 400 });

        // Insert via admin — bypasses RLS completely
        const { data: message, error: insertErr } = await admin
            .from('server_messages')
            .insert({
                server_id: serverId,
                user_id: userId,
                user_name: displayName,
                role: 'user',
                content,
            })
            .select()
            .single();

        if (insertErr) {
            console.error('[messages POST] insert error:', insertErr);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }

        return NextResponse.json({ message });
    } catch (err) {
        console.error('[messages POST]', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
