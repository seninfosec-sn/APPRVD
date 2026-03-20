import { getDb } from '../../../src/lib/db';

function nanoid() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export async function GET(_req: Request, { params }: { params: { threadId: string } }) {
  try {
    const sql = getDb();
    const messages = await sql`
      SELECT id, thread_id as "threadId", sender_id as "senderId", sender_name as "senderName",
             content, type, sent_at as "sentAt", read_by as "readBy", proposed_slot as "proposedSlot"
      FROM chat_messages
      WHERE thread_id = ${params.threadId}
      ORDER BY sent_at ASC
    `;
    return Response.json(messages);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const sql = getDb();
    const { senderId, senderName, content, type = 'text' } = await request.json();
    const id = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO chat_messages (id, thread_id, sender_id, sender_name, content, type, sent_at, read_by)
      VALUES (${id}, ${params.threadId}, ${senderId}, ${senderName}, ${content}, ${type},
              ${now}::timestamptz, ${JSON.stringify([senderId])})
    `;
    const rows = await sql`
      SELECT id, thread_id as "threadId", sender_id as "senderId", sender_name as "senderName",
             content, type, sent_at as "sentAt", read_by as "readBy"
      FROM chat_messages WHERE id = ${id}
    `;
    return Response.json(rows[0], { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
