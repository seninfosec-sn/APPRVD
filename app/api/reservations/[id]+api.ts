import { getDb } from '../../../src/lib/db';

function nanoid() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function rowToMeeting(r: any) {
  return {
    id: r.id, type: 'meeting' as const, title: r.title, description: r.description,
    status: r.status, initiator: r.initiator, invitee: r.invitee,
    slot: { startAt: r.slot_start_at, endAt: r.slot_end_at, timezone: r.slot_timezone },
    location: r.location || undefined, chatThreadId: r.chat_thread_id,
    qrToken: r.qr_token || undefined,
    confirmations: { initiator: r.confirmation_initiator, invitee: r.confirmation_invitee },
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToRoom(r: any) {
  return {
    id: r.id, type: 'room' as const, title: r.title, description: r.description,
    status: r.status, organizer: r.organizer, attendees: r.attendees || [],
    room: r.room_ref,
    slot: { startAt: r.slot_start_at, endAt: r.slot_end_at, timezone: r.slot_timezone },
    chatThreadId: r.chat_thread_id, qrToken: r.qr_token || undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

async function findReservation(sql: any, id: string) {
  const m = await sql`SELECT * FROM meeting_invites WHERE id = ${id}`;
  if (m.length) return { row: m[0], table: 'meeting' };
  const r = await sql`SELECT * FROM room_reservations WHERE id = ${id}`;
  if (r.length) return { row: r[0], table: 'room' };
  return null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const found = await findReservation(sql, params.id);
    if (!found) return Response.json({ error: 'Not found' }, { status: 404 });
    const result = found.table === 'meeting' ? rowToMeeting(found.row) : rowToRoom(found.row);
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const body = await request.json();
    const now = new Date().toISOString();
    const found = await findReservation(sql, params.id);
    if (!found) return Response.json({ error: 'Not found' }, { status: 404 });

    if (body.action === 'confirm' && found.table === 'meeting') {
      const r = found.row as any;
      const isInitiator = body.userId === r.initiator?.id;
      const newConfInit = isInitiator ? true : r.confirmation_initiator;
      const newConfInvitee = !isInitiator ? true : r.confirmation_invitee;
      const bothConfirmed = newConfInit && newConfInvitee;
      const newStatus = bothConfirmed ? 'confirmed' : r.status;
      const qrToken = bothConfirmed ? (r.qr_token || nanoid()) : r.qr_token;

      await sql`
        UPDATE meeting_invites SET
          confirmation_initiator = ${newConfInit},
          confirmation_invitee = ${newConfInvitee},
          status = ${newStatus},
          qr_token = ${qrToken},
          updated_at = ${now}::timestamptz
        WHERE id = ${params.id}
      `;
      if (bothConfirmed) {
        await sql`
          INSERT INTO chat_messages (id, thread_id, sender_id, sender_name, content, type, sent_at, read_by)
          VALUES (${nanoid()}, ${r.chat_thread_id}, 'system', 'Système',
            'Rendez-vous confirmé par les deux parties.', 'system',
            ${now}::timestamptz, '{}')
        `;
      }
    } else if (body.status === 'cancelled') {
      if (found.table === 'meeting') {
        await sql`UPDATE meeting_invites SET status = 'cancelled', updated_at = ${now}::timestamptz WHERE id = ${params.id}`;
      } else {
        await sql`UPDATE room_reservations SET status = 'cancelled', updated_at = ${now}::timestamptz WHERE id = ${params.id}`;
      }
    }

    const updated = await findReservation(sql, params.id);
    if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
    const result = updated.table === 'meeting' ? rowToMeeting(updated.row) : rowToRoom(updated.row);
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM meeting_invites WHERE id = ${params.id}`;
    await sql`DELETE FROM room_reservations WHERE id = ${params.id}`;
    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
