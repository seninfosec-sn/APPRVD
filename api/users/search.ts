import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const q = ((req.query.q as string) || '').toLowerCase();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, email, display_name as "displayName", avatar_url as "avatarUrl"
      FROM users
      WHERE LOWER(display_name) LIKE ${'%' + q + '%'} OR LOWER(email) LIKE ${'%' + q + '%'}
      LIMIT 10
    `;
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
