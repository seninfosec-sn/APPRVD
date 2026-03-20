import { getDb } from '../../../src/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    const sql = getDb();
    const rows = await sql`
      SELECT id, email, display_name as "displayName", avatar_url as "avatarUrl"
      FROM users
      WHERE LOWER(display_name) LIKE ${'%' + q + '%'} OR LOWER(email) LIKE ${'%' + q + '%'}
      LIMIT 10
    `;
    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
