import { getDb } from '../../src/lib/db';

export async function GET() {
  try {
    const sql = getDb();

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building TEXT NOT NULL,
        floor INTEGER DEFAULT 0,
        capacity INTEGER NOT NULL,
        equipment TEXT[] DEFAULT '{}',
        photos TEXT[] DEFAULT '{}',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        tags TEXT[] DEFAULT '{}',
        rules JSONB NOT NULL DEFAULT '{}'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS meeting_invites (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        initiator JSONB NOT NULL,
        invitee JSONB NOT NULL,
        slot_start_at TIMESTAMPTZ NOT NULL,
        slot_end_at TIMESTAMPTZ NOT NULL,
        slot_timezone TEXT DEFAULT 'Africa/Dakar',
        location JSONB,
        chat_thread_id TEXT NOT NULL,
        qr_token TEXT,
        confirmation_initiator BOOLEAN DEFAULT TRUE,
        confirmation_invitee BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS room_reservations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed',
        organizer JSONB NOT NULL,
        attendees JSONB DEFAULT '[]',
        room_ref JSONB NOT NULL,
        slot_start_at TIMESTAMPTZ NOT NULL,
        slot_end_at TIMESTAMPTZ NOT NULL,
        slot_timezone TEXT DEFAULT 'Africa/Dakar',
        chat_thread_id TEXT NOT NULL,
        qr_token TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        read_by TEXT[] DEFAULT '{}',
        proposed_slot JSONB
      )
    `;

    // Seed users
    await sql`
      INSERT INTO users (id, email, display_name, avatar_url, role) VALUES
        ('u1','aissatou.diallo@entreprise.sn','Aissatou Diallo',NULL,'admin'),
        ('u2','mamadou.konate@entreprise.sn','Mamadou Konaté',NULL,'user'),
        ('u3','fatou.mbaye@entreprise.sn','Fatou Mbaye',NULL,'user'),
        ('u4','oumar.traore@entreprise.sn','Oumar Traoré',NULL,'user'),
        ('u5','kadiatou.bah@entreprise.sn','Kadiatou Bah',NULL,'user')
      ON CONFLICT (id) DO NOTHING
    `;

    // Seed rooms
    const roomsCount = await sql`SELECT COUNT(*) as c FROM rooms`;
    if (Number(roomsCount[0].c) === 0) {
      await sql`
        INSERT INTO rooms (id, name, building, floor, capacity, equipment, tags, rules) VALUES
          ('r1','Salle Baobab','Bâtiment A',1,10,
            ARRAY['projector','whiteboard','videoconference','wifi','air_conditioning'],
            ARRAY['réunion','formation'],
            '{"minDurationMinutes":30,"maxDurationMinutes":480,"openingTime":"08:00","closingTime":"19:00","openDays":[1,2,3,4,5]}'::jsonb),
          ('r2','Salle Manguier','Bâtiment A',2,6,
            ARRAY['whiteboard','wifi','tv_screen'],
            ARRAY['petite salle','brainstorming'],
            '{"minDurationMinutes":30,"maxDurationMinutes":240,"openingTime":"08:00","closingTime":"18:00","openDays":[1,2,3,4,5]}'::jsonb),
          ('r3','Salle Téranga','Bâtiment B',0,20,
            ARRAY['projector','videoconference','wifi','air_conditioning','accessibility'],
            ARRAY['grande salle','événement'],
            '{"minDurationMinutes":60,"maxDurationMinutes":600,"openingTime":"07:30","closingTime":"20:00","openDays":[1,2,3,4,5,6]}'::jsonb),
          ('r4','Espace Détente','Bâtiment C',1,4,
            ARRAY['wifi','coffee'],
            ARRAY['informel','détente'],
            '{"minDurationMinutes":15,"maxDurationMinutes":120,"openingTime":"07:00","closingTime":"20:00","openDays":[1,2,3,4,5]}'::jsonb)
      `;
    }

    return Response.json({ ok: true, message: 'DB initialized successfully' });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
