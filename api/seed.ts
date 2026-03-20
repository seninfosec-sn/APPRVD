import { neon } from '@neondatabase/serverless';
import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // ── Tables ──────────────────────────────────────────────────────────────

    await sql`CREATE TABLE IF NOT EXISTS users (
      id           TEXT PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url   TEXT,
      role         TEXT DEFAULT 'user',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT ''`;

    await sql`CREATE TABLE IF NOT EXISTS rooms (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      building    TEXT NOT NULL,
      floor       INTEGER DEFAULT 0,
      capacity    INTEGER NOT NULL,
      equipment   TEXT[]  DEFAULT '{}',
      photos      TEXT[]  DEFAULT '{}',
      description TEXT,
      is_active   BOOLEAN DEFAULT TRUE,
      tags        TEXT[]  DEFAULT '{}',
      rules       JSONB   NOT NULL DEFAULT '{}'
    )`;

    await sql`CREATE TABLE IF NOT EXISTS meeting_invites (
      id                     TEXT PRIMARY KEY,
      title                  TEXT NOT NULL,
      description            TEXT,
      status                 TEXT NOT NULL DEFAULT 'pending',
      initiator              JSONB NOT NULL,
      invitee                JSONB NOT NULL,
      slot_start_at          TIMESTAMPTZ NOT NULL,
      slot_end_at            TIMESTAMPTZ NOT NULL,
      slot_timezone          TEXT DEFAULT 'Africa/Dakar',
      location               JSONB,
      chat_thread_id         TEXT NOT NULL,
      qr_token               TEXT,
      confirmation_initiator BOOLEAN DEFAULT TRUE,
      confirmation_invitee   BOOLEAN DEFAULT FALSE,
      expires_at             TIMESTAMPTZ,
      created_at             TIMESTAMPTZ DEFAULT NOW(),
      updated_at             TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS room_reservations (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      description    TEXT,
      status         TEXT NOT NULL DEFAULT 'confirmed',
      organizer      JSONB NOT NULL,
      attendees      JSONB DEFAULT '[]',
      room_ref       JSONB NOT NULL,
      slot_start_at  TIMESTAMPTZ NOT NULL,
      slot_end_at    TIMESTAMPTZ NOT NULL,
      slot_timezone  TEXT DEFAULT 'Africa/Dakar',
      chat_thread_id TEXT NOT NULL,
      qr_token       TEXT,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )`;

    await sql`CREATE TABLE IF NOT EXISTS chat_messages (
      id            TEXT PRIMARY KEY,
      thread_id     TEXT NOT NULL,
      sender_id     TEXT NOT NULL,
      sender_name   TEXT NOT NULL,
      content       TEXT NOT NULL,
      type          TEXT DEFAULT 'text',
      sent_at       TIMESTAMPTZ DEFAULT NOW(),
      read_by       TEXT[] DEFAULT '{}',
      proposed_slot JSONB
    )`;

    // ── 8 Utilisateurs ──────────────────────────────────────────────────────
    // Mot de passe par défaut : Afcac2025!
    const defaultPwd = 'Afcac2025!';

    const users = [
      { id: 'u1', email: 'aissatou.diallo@afcac.org',   name: 'Aissatou Diallo',   role: 'admin' },
      { id: 'u2', email: 'mamadou.konate@afcac.org',    name: 'Mamadou Konaté',    role: 'user'  },
      { id: 'u3', email: 'fatou.mbaye@afcac.org',       name: 'Fatou Mbaye',       role: 'user'  },
      { id: 'u4', email: 'oumar.traore@afcac.org',      name: 'Oumar Traoré',      role: 'user'  },
      { id: 'u5', email: 'kadiatou.bah@afcac.org',      name: 'Kadiatou Bah',      role: 'user'  },
      { id: 'u6', email: 'ibrahima.sow@afcac.org',      name: 'Ibrahima Sow',      role: 'user'  },
      { id: 'u7', email: 'mariama.diallo@afcac.org',    name: 'Mariama Diallo',    role: 'user'  },
      { id: 'u8', email: 'sekou.camara@afcac.org',      name: 'Sékou Camara',      role: 'user'  },
    ];

    for (const u of users) {
      const ph = hashPassword(defaultPwd);
      await sql`
        INSERT INTO users (id, email, display_name, password_hash, role)
        VALUES (${u.id}, ${u.email}, ${u.name}, ${ph}, ${u.role})
        ON CONFLICT (id) DO UPDATE SET
          email        = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          password_hash = EXCLUDED.password_hash,
          role         = EXCLUDED.role
      `;
    }

    // ── 5 Salles ────────────────────────────────────────────────────────────
    await sql`DELETE FROM rooms`;

    await sql`
      INSERT INTO rooms (id, name, building, floor, capacity, equipment, tags, rules, description) VALUES
      (
        'r1','Salle Baobab','Bâtiment A',1,10,
        ARRAY['projector','whiteboard','videoconference','wifi','air_conditioning'],
        ARRAY['réunion','formation'],
        '{"minDurationMinutes":30,"maxDurationMinutes":480,"openingTime":"08:00","closingTime":"19:00","openDays":[1,2,3,4,5]}'::jsonb,
        'Salle polyvalente équipée pour réunions et formations — 10 personnes'
      ),
      (
        'r2','Salle Manguier','Bâtiment A',2,6,
        ARRAY['whiteboard','wifi','tv_screen'],
        ARRAY['petite salle','brainstorming'],
        '{"minDurationMinutes":30,"maxDurationMinutes":240,"openingTime":"08:00","closingTime":"18:00","openDays":[1,2,3,4,5]}'::jsonb,
        'Petite salle idéale pour brainstorming et entretiens — 6 personnes'
      ),
      (
        'r3','Salle Téranga','Bâtiment B',0,20,
        ARRAY['projector','videoconference','wifi','air_conditioning','accessibility'],
        ARRAY['grande salle','événement','conférence'],
        '{"minDurationMinutes":60,"maxDurationMinutes":600,"openingTime":"07:30","closingTime":"20:00","openDays":[1,2,3,4,5,6]}'::jsonb,
        'Grande salle de conférence accessible — 20 personnes'
      ),
      (
        'r4','Salle CEDEAO','Bâtiment B',1,15,
        ARRAY['projector','videoconference','wifi','air_conditioning','phone'],
        ARRAY['réunion','coopération','officielle'],
        '{"minDurationMinutes":30,"maxDurationMinutes":480,"openingTime":"08:00","closingTime":"19:00","openDays":[1,2,3,4,5]}'::jsonb,
        'Salle officielle pour réunions de coopération régionale — 15 personnes'
      ),
      (
        'r5','Salle UEMOA','Bâtiment C',0,8,
        ARRAY['whiteboard','wifi','tv_screen','air_conditioning'],
        ARRAY['réunion','technique'],
        '{"minDurationMinutes":30,"maxDurationMinutes":360,"openingTime":"08:00","closingTime":"18:00","openDays":[1,2,3,4,5]}'::jsonb,
        'Salle technique pour réunions de travail — 8 personnes'
      )
    `;

    return res.json({
      ok: true,
      message: 'Base de données initialisée',
      users: users.map(u => ({ id: u.id, email: u.email, name: u.name, defaultPassword: defaultPwd })),
      rooms: ['Salle Baobab (10)', 'Salle Manguier (6)', 'Salle Téranga (20)', 'Salle CEDEAO (15)', 'Salle UEMOA (8)'],
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
