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

async function find(sql: any, id: string) {
  const m = await sql`SELECT * FROM meeting_invites WHERE id = ${id}`;
  if ((m as any[]).length) return { row: m[0], table: 'meeting' };
  const r = await sql`SELECT * FROM room_reservations WHERE id = ${id}`;
  if ((r as any[]).length) return { row: r[0], table: 'room' };
  return null;
}

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === 'GET') {
    try {
      const found = await find(sql, id);
      if (!found) return res.status(404).json({ error: 'Non trouvé' });
      return res.json(found.table === 'meeting' ? rowToMeeting(found.row) : rowToRoom(found.row));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = req.body;
      const now = new Date().toISOString();
      const found = await find(sql, id);
      if (!found) return res.status(404).json({ error: 'Non trouvé' });

      if (body.action === 'confirm' && found.table === 'meeting') {
        const r = found.row as any;
        const isInitiator = body.userId === r.initiator?.id;
        const newConfInit = isInitiator ? true : r.confirmation_initiator;
        const newConfInvitee = !isInitiator ? true : r.confirmation_invitee;
        const bothConfirmed = newConfInit && newConfInvitee;
        const newStatus = bothConfirmed ? 'confirmed' : r.status;
        const qrToken = bothConfirmed ? (r.qr_token || uid()) : r.qr_token;
        await sql`
          UPDATE meeting_invites SET
            confirmation_initiator=${newConfInit},
            confirmation_invitee=${newConfInvitee},
            status=${newStatus}, qr_token=${qrToken},
            updated_at=${now}::timestamptz
          WHERE id=${id}
        `;
        if (bothConfirmed) {
          await sql`
            INSERT INTO chat_messages (id,thread_id,sender_id,sender_name,content,type,sent_at,read_by)
            VALUES (${uid()},${r.chat_thread_id},'system','Système',
              'Rendez-vous confirmé par les deux parties.','system',
              ${now}::timestamptz,'{}')
          `;
        }
      } else if (body.status === 'cancelled') {
        if (found.table === 'meeting') {
          await sql`UPDATE meeting_invites SET status='cancelled', updated_at=${now}::timestamptz WHERE id=${id}`;
        } else {
          await sql`UPDATE room_reservations SET status='cancelled', updated_at=${now}::timestamptz WHERE id=${id}`;
        }
      }

      const updated = await find(sql, id);
      if (!updated) return res.status(404).json({ error: 'Non trouvé' });
      return res.json(updated.table === 'meeting' ? rowToMeeting(updated.row) : rowToRoom(updated.row));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM meeting_invites WHERE id=${id}`;
      await sql`DELETE FROM room_reservations WHERE id=${id}`;
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
