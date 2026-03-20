import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rooms = await sql`SELECT * FROM rooms WHERE is_active = true ORDER BY name`;
    const now = new Date().toISOString();
    const busy = await sql`
      SELECT room_ref->>'id' as room_id FROM room_reservations
      WHERE status NOT IN ('cancelled','expired')
        AND slot_start_at <= ${now}::timestamptz
        AND slot_end_at > ${now}::timestamptz
    `;
    const busyIds = new Set((busy as any[]).map((r: any) => r.room_id));
    const result = (rooms as any[]).map((r: any) => ({
      id: r.id, name: r.name, building: r.building, floor: r.floor,
      capacity: r.capacity, equipment: r.equipment || [], photos: r.photos || [],
      description: r.description, isActive: r.is_active, tags: r.tags || [],
      rules: r.rules, isAvailableNow: !busyIds.has(r.id),
    }));
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
