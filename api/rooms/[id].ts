import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM rooms WHERE id = ${id}`;
    if ((rows as any[]).length === 0) return res.status(404).json({ error: 'Room not found' });
    const r = rows[0] as any;
    const dayStart = `${date}T00:00:00Z`;
    const dayEnd = `${date}T23:59:59Z`;
    const busySlots = await sql`
      SELECT slot_start_at as "startAt", slot_end_at as "endAt", id as "reservationId"
      FROM room_reservations
      WHERE room_ref->>'id' = ${id}
        AND status NOT IN ('cancelled','expired')
        AND slot_start_at < ${dayEnd}::timestamptz
        AND slot_end_at > ${dayStart}::timestamptz
    `;
    const now = new Date().toISOString();
    const isAvailableNow = !(busySlots as any[]).some(
      (s: any) => s.startAt <= now && s.endAt > now
    );
    return res.json({
      id: r.id, name: r.name, building: r.building, floor: r.floor,
      capacity: r.capacity, equipment: r.equipment || [], photos: r.photos || [],
      description: r.description, isActive: r.is_active, tags: r.tags || [],
      rules: r.rules, isAvailableNow, busySlots,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
