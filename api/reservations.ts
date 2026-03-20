import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

function uid() { return randomBytes(8).toString('hex'); }

function rowToMeeting(r: any) {
  return {
    id: r.id, type: 'meeting', title: r.title, description: r.description,
    status: r.status, initiator: r.initiator, invitee: r.invitee,
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
    id: r.id, type: 'room', title: r.title, description: r.description,
    status: r.status, organizer: r.organizer, attendees: r.attendees || [],
    room: r.room_ref,
    slot: { startAt: r.slot_start_at, endAt: r.slot_end_at, timezone: r.slot_timezone },
    chatThreadId: r.chat_thread_id, qrToken: r.qr_token || undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export default async function handler(req: any, res: any) {
  const sql = neon(process.env.DATABASE_URL!);

  // GET /api/reservations?userId=xxx
  if (req.method === 'GET') {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId requis' });
    try {
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
      return res.json(all);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/reservations
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const id = uid();
      const threadId = uid();
      const now = new Date().toISOString();

      if (body.type === 'meeting') {
        const { title, description, initiator, invitee, slot, location } = body;
        const expires = new Date(new Date(slot.startAt).getTime() + 48 * 3600000).toISOString();
        await sql`
          INSERT INTO meeting_invites
            (id,title,description,status,initiator,invitee,
             slot_start_at,slot_end_at,slot_timezone,location,
             chat_thread_id,confirmation_initiator,confirmation_invitee,expires_at,
             created_at,updated_at)
          VALUES (
            ${id},${title},${description || null},'pending',
            ${JSON.stringify(initiator)},${JSON.stringify(invitee)},
            ${slot.startAt}::timestamptz,${slot.endAt}::timestamptz,
            ${slot.timezone || 'Africa/Dakar'},
            ${location ? JSON.stringify(location) : null},
            ${threadId},true,false,${expires}::timestamptz,
            ${now}::timestamptz,${now}::timestamptz
          )
        `;
        await sql`
          INSERT INTO chat_messages (id,thread_id,sender_id,sender_name,content,type,sent_at,read_by)
          VALUES (${uid()},${threadId},'system','Système',
            ${'Invitation envoyée par ' + initiator.displayName},'system',
            ${now}::timestamptz,${[initiator.id]})
        `;
        const rows = await sql`SELECT * FROM meeting_invites WHERE id = ${id}`;
        return res.status(201).json(rowToMeeting(rows[0]));

      } else if (body.type === 'room') {
        const { title, description, organizer, room, slot } = body;
        const conflicts = await sql`
          SELECT id FROM room_reservations
          WHERE room_ref->>'id' = ${room.id}
            AND status NOT IN ('cancelled','expired')
            AND slot_start_at < ${slot.endAt}::timestamptz
            AND slot_end_at > ${slot.startAt}::timestamptz
        `;
        if ((conflicts as any[]).length > 0) {
          return res.status(409).json({ error: 'Conflit de réservation pour cette salle.', code: 'CONFLICT' });
        }
        const qrToken = uid();
        await sql`
          INSERT INTO room_reservations
            (id,title,description,status,organizer,attendees,room_ref,
             slot_start_at,slot_end_at,slot_timezone,chat_thread_id,qr_token,
             created_at,updated_at)
          VALUES (
            ${id},${title},${description || null},'confirmed',
            ${JSON.stringify(organizer)},'[]'::jsonb,${JSON.stringify(room)},
            ${slot.startAt}::timestamptz,${slot.endAt}::timestamptz,
            ${slot.timezone || 'Africa/Dakar'},
            ${threadId},${qrToken},
            ${now}::timestamptz,${now}::timestamptz
          )
        `;
        await sql`
          INSERT INTO chat_messages (id,thread_id,sender_id,sender_name,content,type,sent_at,read_by)
          VALUES (${uid()},${threadId},'system','Système',
            ${'Salle réservée par ' + organizer.displayName},'system',
            ${now}::timestamptz,${[organizer.id]})
        `;
        const rows = await sql`SELECT * FROM room_reservations WHERE id = ${id}`;
        return res.status(201).json(rowToRoom(rows[0]));

      } else {
        return res.status(400).json({ error: 'Type invalide' });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
