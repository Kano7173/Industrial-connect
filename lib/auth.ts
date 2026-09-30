import { prisma } from '@/lib/prisma';

export async function requireCurrentUser() {
  const demoMode = process.env.AUTH_MODE !== 'production';
  const userId = process.env.DEMO_USER_ID;
  if (!userId || !demoMode) {
    throw new Error('Authentication is not configured. Set AUTH_MODE=demo with DEMO_USER_ID for preview, or connect the production session provider.');
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Configured demo user was not found.');
  return user;
}
