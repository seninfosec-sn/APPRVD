import { neon } from '@neondatabase/serverless';
import { scryptSync, randomBytes } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function uid(): string {
  return randomBytes(8).toString('hex');
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (minimum 8 caractères)' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Vérifie si l'email existe déjà
    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
    if ((existing as any[]).length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
    }

    const id = uid();
    const passwordHash = hashPassword(password);

    await sql`
      INSERT INTO users (id, email, display_name, password_hash, role)
      VALUES (${id}, ${email.toLowerCase()}, ${name.trim()}, ${passwordHash}, 'user')
    `;

    return res.status(201).json({
      id,
      email: email.toLowerCase(),
      displayName: name.trim(),
      role: 'user',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
