import { getDb } from '../../src/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rooms = await sql`SELECT * FROM rooms WHERE is_active = true ORDER BY name`;

    // Check current availability for each room
    const now = new Date().toISOString();
    const busy = await sql`
      SELECT room_ref->>'id' as room_id
      FROM room_reservations
      WHERE status NOT IN ('cancelled','expired')
        AND slot_start_at <= ${now}::timestamptz
        AND slot_end_at > ${now}::timestamptz
    `;
    const busyIds = new Set(busy.map((r: any) => r.room_id));

    const result = rooms.map((r: any) => ({
      id: r.id,
      name: r.name,
      building: r.building,
      floor: r.floor,
      capacity: r.capacity,
      equipment: r.equipment || [],
      photos: r.photos || [],
      description: r.description,
      isActive: r.is_active,
      tags: r.tags || [],
      rules: r.rules,
      isAvailableNow: !busyIds.has(r.id),
    }));
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
