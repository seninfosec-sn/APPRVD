import { getDb } from '../../../src/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const rows = await sql`SELECT * FROM rooms WHERE id = ${params.id}`;
    if (rows.length === 0) return Response.json({ error: 'Room not found' }, { status: 404 });

    const r = rows[0] as any;

    // Get busy slots for the requested date
    const dayStart = `${date}T00:00:00Z`;
    const dayEnd = `${date}T23:59:59Z`;
    const busySlots = await sql`
      SELECT slot_start_at as "startAt", slot_end_at as "endAt", id as "reservationId"
      FROM room_reservations
      WHERE room_ref->>'id' = ${params.id}
        AND status NOT IN ('cancelled','expired')
        AND slot_start_at < ${dayEnd}::timestamptz
        AND slot_end_at > ${dayStart}::timestamptz
    `;

    const now = new Date().toISOString();
    const isAvailableNow = !(busySlots as any[]).some((s: any) =>
      s.startAt <= now && s.endAt > now
    );

    return Response.json({
      id: r.id, name: r.name, building: r.building, floor: r.floor,
      capacity: r.capacity, equipment: r.equipment || [], photos: r.photos || [],
      description: r.description, isActive: r.is_active, tags: r.tags || [],
      rules: r.rules, isAvailableNow,
      busySlots,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
