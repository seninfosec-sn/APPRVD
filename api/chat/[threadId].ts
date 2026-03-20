import { neon } from '@neondatabase/serverless';
import { randomBytes } from 'crypto';

function uid() { return randomBytes(8).toString('hex'); }

export default async function handler(req: any, res: any) {
  const { threadId } = req.query;
  const sql = neon(process.env.DATABASE_URL!);

  if (req.method === 'GET') {
    try {
      const messages = await sql`
        SELECT id, thread_id as "threadId", sender_id as "senderId",
               sender_name as "senderName", content, type,
               sent_at as "sentAt", read_by as "readBy"
        FROM chat_messages
        WHERE thread_id = ${threadId}
        ORDER BY sent_at ASC
      `;
      return res.json(messages);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { senderId, senderName, content, type = 'text' } = req.body;
      const id = uid();
      const now = new Date().toISOString();
      await sql`
        INSERT INTO chat_messages (id,thread_id,sender_id,sender_name,content,type,sent_at,read_by)
        VALUES (${id},${threadId},${senderId},${senderName},${content},${type},
                ${now}::timestamptz,${JSON.stringify([senderId])})
      `;
      const rows = await sql`
        SELECT id, thread_id as "threadId", sender_id as "senderId",
               sender_name as "senderName", content, type,
               sent_at as "sentAt", read_by as "readBy"
        FROM chat_messages WHERE id = ${id}
      `;
      return res.status(201).json(rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
