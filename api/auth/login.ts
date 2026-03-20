import { neon } from '@neondatabase/serverless';
import { scryptSync } from 'crypto';

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return derived === hash;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, email, display_name as "displayName", avatar_url as "avatarUrl",
             role, password_hash, created_at as "createdAt"
      FROM users WHERE LOWER(email) = LOWER(${email})
    `;

    if ((rows as any[]).length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = rows[0] as any;
    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
