import { getDb } from '../../src/lib/db';

function nanoid() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function rowToMeeting(r: any) {
  return {
    id: r.id, type: 'meeting' as const, title: r.title, description: r.description,
    status: r.status,
    initiator: r.initiator, invitee: r.invitee,
    slot: { startAt: r.slot_start_at, endAt: r.slot_end_at, timezone: r.slot_timezone },
    location: r.location || undefined,
    chatThreadId: r.chat_thread_id, qrToken: r.qr_token || undefined,
    confirmations: { initiator: r.confirmation_initiator, invitee: r.confirmation_invitee },
    expiresAt: r.expires_at || undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToRoom(r: any) {
  return {
    id: r.id, type: 'room' as const, title: r.title, description: r.description,
    status: r.status,
    organizer: r.organizer, attendees: r.attendees || [],
    room: r.room_ref,
    slot: { startAt: r.slot_start_at, endAt: r.slot_end_at, timezone: r.slot_timezone },
    chatThreadId: r.chat_thread_id, qrToken: r.qr_token || undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const meetings = await sql`
      SELECT * FROM meeting_invites
      WHERE initiator->>'id' = ${userId} OR invitee->>'id' = ${userId}
      ORDER BY slot_start_at DESC
    `;
    const rooms = await sql`
      SELECT * FROM room_reservations
      WHERE organizer->>'id' = ${userId}
      ORDER BY slot_start_at DESC
    `;

    const all = [
      ...(meetings as any[]).map(rowToMeeting),
      ...(rooms as any[]).map(rowToRoom),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return Response.json(all);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = nanoid();
    const threadId = nanoid();
    const now = new Date().toISOString();

    if (body.type === 'meeting') {
      const { title, description, initiator, invitee, slot, location } = body;
      const expires = new Date(new Date(slot.startAt).getTime() + 48 * 60 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO meeting_invites
          (id, title, description, status, initiator, invitee,
           slot_start_at, slot_end_at, slot_timezone, location,
           chat_thread_id, confirmation_initiator, confirmation_invitee, expires_at,
           created_at, updated_at)
        VALUES (
          ${id}, ${title}, ${description || null}, 'pending',
          ${JSON.stringify(initiator)}, ${JSON.stringify(invitee)},
          ${slot.startAt}::timestamptz, ${slot.endAt}::timestamptz,
          ${slot.timezone || 'Africa/Dakar'},
          ${location ? JSON.stringify(location) : null},
          ${threadId}, true, false, ${expires}::timestamptz,
          ${now}::timestamptz, ${now}::timestamptz
        )
      `;
      // System message
      await sql`
        INSERT INTO chat_messages (id, thread_id, sender_id, sender_name, content, type, sent_at, read_by)
        VALUES (${nanoid()}, ${threadId}, 'system', 'Système',
          ${'Invitation envoyée par ' + initiator.displayName}, 'system',
          ${now}::timestamptz, ${JSON.stringify([initiator.id])})
      `;

      const rows = await sql`SELECT * FROM meeting_invites WHERE id = ${id}`;
      return Response.json(rowToMeeting(rows[0]), { status: 201 });

    } else if (body.type === 'room') {
      const { title, description, organizer, room, slot } = body;
      const qrToken = nanoid();

      // Conflict check
      const conflicts = await sql`
        SELECT id FROM room_reservations
        WHERE room_ref->>'id' = ${room.id}
          AND status NOT IN ('cancelled','expired')
          AND slot_start_at < ${slot.endAt}::timestamptz
          AND slot_end_at > ${slot.startAt}::timestamptz
      `;
      if ((conflicts as any[]).length > 0) {
        return Response.json({ error: 'Conflit de réservation pour cette salle.', code: 'CONFLICT' }, { status: 409 });
      }

      await sql`
        INSERT INTO room_reservations
          (id, title, description, status, organizer, attendees, room_ref,
           slot_start_at, slot_end_at, slot_timezone, chat_thread_id, qr_token,
           created_at, updated_at)
        VALUES (
          ${id}, ${title}, ${description || null}, 'confirmed',
          ${JSON.stringify(organizer)}, '[]'::jsonb, ${JSON.stringify(room)},
          ${slot.startAt}::timestamptz, ${slot.endAt}::timestamptz,
          ${slot.timezone || 'Africa/Dakar'},
          ${threadId}, ${qrToken},
          ${now}::timestamptz, ${now}::timestamptz
        )
      `;
      // System message
      await sql`
        INSERT INTO chat_messages (id, thread_id, sender_id, sender_name, content, type, sent_at, read_by)
        VALUES (${nanoid()}, ${threadId}, 'system', 'Système',
          ${'Salle réservée par ' + organizer.displayName}, 'system',
          ${now}::timestamptz, ${JSON.stringify([organizer.id])})
      `;

      const rows = await sql`SELECT * FROM room_reservations WHERE id = ${id}`;
      return Response.json(rowToRoom(rows[0]), { status: 201 });

    } else {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
