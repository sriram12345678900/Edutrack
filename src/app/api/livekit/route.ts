import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username');
  if (!room || !username) {
    return NextResponse.json({ error: 'Missing "room" or "username"' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY || "APIDQveuW7GQ7yM";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "RZem9rw1NgoxSPnegpnzSjLQWezmBZAjPFSRE4jpE9gB";
  
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server misconfigured: missing keys' }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
  });

  at.addGrant({ roomJoin: true, room: room });

  return NextResponse.json({ token: await at.toJwt() });
}
