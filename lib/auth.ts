import { prisma } from '@/lib/prisma';
import { DEMO_USER_ADMIN, DEMO_USER_BUYER, DEMO_USER_SUPPLIER } from '@/lib/demo';

// Demo-friendly auth: falls back to mock users when DEMO_USER_ID is not set
// or when Prisma cannot connect (placeholder DATABASE_URL).
export async function requireCurrentUser() {
  const userId = process.env.DEMO_USER_ID || process.env.NEXT_PUBLIC_DEMO_USER_ID;
  // If DEMO_USER_ID is explicitly set, try to load that user
  if (userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) return user;
    } catch {}
    // Fallback to buyer demo if DB lookup fails
    if (userId.includes('admin')) return DEMO_USER_ADMIN as any;
    if (userId.includes('supplier')) return DEMO_USER_SUPPLIER as any;
    return DEMO_USER_BUYER as any;
  }

  // No userId configured → infer from context or return buyer demo.
  // We try to detect which dashboard is being accessed via stack? For now return buyer.
  // Individual pages will override if needed.
  try {
    // Try a harmless DB query to see if DB is configured
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // DB not configured → stay in demo mode
  }
  return DEMO_USER_BUYER as any;
}

export async function requireCurrentUserForRole(preferred: 'BUYER' | 'SUPPLIER' | 'ADMIN' = 'BUYER') {
  const base = await requireCurrentUser();
  if (base.role === preferred) return base;
  if (preferred === 'SUPPLIER') return DEMO_USER_SUPPLIER as any;
  if (preferred === 'ADMIN') return DEMO_USER_ADMIN as any;
  return DEMO_USER_BUYER as any;
}