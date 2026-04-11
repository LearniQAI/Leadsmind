import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { workspaceId } = await req.json();

  const cookieStore = await cookies();

  cookieStore.set('active_workspace_id', workspaceId, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  return NextResponse.json({ success: true });
}