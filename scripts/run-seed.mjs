import { neon } from '@neondatabase/serverless';
import { scryptSync, randomBytes } from 'crypto';

const DATABASE_URL = 'postgresql://neondb_owner:npg_nmxE8wAFk3LY@ep-muddy-hall-amhp7pew-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const sql = neon(DATABASE_URL);

console.log('🔄 Connexion à Neon...');

// ── Tables ──────────────────────────────────────────────────────────────────

await sql`CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  role          TEXT DEFAULT 'user',
  created_at    TIMESTAMPTZ DEFAULT NOW()
)`;
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT ''`;
console.log('✅ Table users OK');

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
console.log('✅ Table rooms OK');

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
console.log('✅ Table meeting_invites OK');

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
console.log('✅ Table room_reservations OK');

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
console.log('✅ Table chat_messages OK');

// ── 8 Utilisateurs ──────────────────────────────────────────────────────────
const defaultPwd = 'Afcac2025!';
const users = [
  { id: 'u1', email: 'aissatou.diallo@afcac.org',  name: 'Aissatou Diallo',  role: 'admin' },
  { id: 'u2', email: 'mamadou.konate@afcac.org',   name: 'Mamadou Konaté',   role: 'user'  },
  { id: 'u3', email: 'fatou.mbaye@afcac.org',      name: 'Fatou Mbaye',      role: 'user'  },
  { id: 'u4', email: 'oumar.traore@afcac.org',     name: 'Oumar Traoré',     role: 'user'  },
  { id: 'u5', email: 'kadiatou.bah@afcac.org',     name: 'Kadiatou Bah',     role: 'user'  },
  { id: 'u6', email: 'ibrahima.sow@afcac.org',     name: 'Ibrahima Sow',     role: 'user'  },
  { id: 'u7', email: 'mariama.diallo@afcac.org',   name: 'Mariama Diallo',   role: 'user'  },
  { id: 'u8', email: 'sekou.camara@afcac.org',     name: 'Sékou Camara',     role: 'user'  },
];

for (const u of users) {
  const ph = hashPassword(defaultPwd);
  await sql`
    INSERT INTO users (id, email, display_name, password_hash, role)
    VALUES (${u.id}, ${u.email}, ${u.name}, ${ph}, ${u.role})
    ON CONFLICT (id) DO UPDATE SET
      email         = EXCLUDED.email,
      display_name  = EXCLUDED.display_name,
      password_hash = EXCLUDED.password_hash,
      role          = EXCLUDED.role
  `;
  console.log(`   👤 ${u.name} (${u.email})`);
}
console.log('✅ 8 utilisateurs insérés');

// ── 5 Salles ────────────────────────────────────────────────────────────────
await sql`DELETE FROM rooms`;

const rooms = [
  {
    id: 'r1', name: 'Salle Baobab', building: 'Bâtiment A', floor: 1, capacity: 10,
    equipment: ['projector','whiteboard','videoconference','wifi','air_conditioning'],
    tags: ['réunion','formation'],
    description: 'Salle polyvalente équipée pour réunions et formations — 10 personnes',
    rules: { minDurationMinutes: 30, maxDurationMinutes: 480, openingTime: '08:00', closingTime: '19:00', openDays: [1,2,3,4,5] },
  },
  {
    id: 'r2', name: 'Salle Manguier', building: 'Bâtiment A', floor: 2, capacity: 6,
    equipment: ['whiteboard','wifi','tv_screen'],
    tags: ['petite salle','brainstorming'],
    description: 'Petite salle idéale pour brainstorming et entretiens — 6 personnes',
    rules: { minDurationMinutes: 30, maxDurationMinutes: 240, openingTime: '08:00', closingTime: '18:00', openDays: [1,2,3,4,5] },
  },
  {
    id: 'r3', name: 'Salle Téranga', building: 'Bâtiment B', floor: 0, capacity: 20,
    equipment: ['projector','videoconference','wifi','air_conditioning','accessibility'],
    tags: ['grande salle','événement','conférence'],
    description: 'Grande salle de conférence accessible — 20 personnes',
    rules: { minDurationMinutes: 60, maxDurationMinutes: 600, openingTime: '07:30', closingTime: '20:00', openDays: [1,2,3,4,5,6] },
  },
  {
    id: 'r4', name: 'Salle CEDEAO', building: 'Bâtiment B', floor: 1, capacity: 15,
    equipment: ['projector','videoconference','wifi','air_conditioning','phone'],
    tags: ['réunion','coopération','officielle'],
    description: 'Salle officielle pour réunions de coopération régionale — 15 personnes',
    rules: { minDurationMinutes: 30, maxDurationMinutes: 480, openingTime: '08:00', closingTime: '19:00', openDays: [1,2,3,4,5] },
  },
  {
    id: 'r5', name: 'Salle UEMOA', building: 'Bâtiment C', floor: 0, capacity: 8,
    equipment: ['whiteboard','wifi','tv_screen','air_conditioning'],
    tags: ['réunion','technique'],
    description: 'Salle technique pour réunions de travail — 8 personnes',
    rules: { minDurationMinutes: 30, maxDurationMinutes: 360, openingTime: '08:00', closingTime: '18:00', openDays: [1,2,3,4,5] },
  },
];

for (const r of rooms) {
  await sql`
    INSERT INTO rooms (id, name, building, floor, capacity, equipment, tags, description, rules)
    VALUES (
      ${r.id}, ${r.name}, ${r.building}, ${r.floor}, ${r.capacity},
      ${r.equipment}, ${r.tags}, ${r.description},
      ${JSON.stringify(r.rules)}::jsonb
    )
  `;
  console.log(`   🏢 ${r.name} (${r.capacity} personnes)`);
}
console.log('✅ 5 salles insérées');

// ── Résumé ───────────────────────────────────────────────────────────────────
const [uCount] = await sql`SELECT COUNT(*) as c FROM users`;
const [rCount] = await sql`SELECT COUNT(*) as c FROM rooms`;
const [mCount] = await sql`SELECT COUNT(*) as c FROM meeting_invites`;
const [rrCount] = await sql`SELECT COUNT(*) as c FROM room_reservations`;

console.log('\n📊 État de la base de données :');
console.log(`   Utilisateurs : ${uCount.c}`);
console.log(`   Salles       : ${rCount.c}`);
console.log(`   Réunions     : ${mCount.c}`);
console.log(`   Réservations : ${rrCount.c}`);
console.log('\n🎉 Base de données mise à jour avec succès !');
console.log(`\n🔑 Tous les utilisateurs ont le mot de passe : ${defaultPwd}`);
