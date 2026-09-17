import { prisma } from '@/lib/prisma';
export async function requireCurrentUser() {
  const userId = process.env.NODE_ENV !== 'production' ? process.env.DEMO_USER_ID : undefined;
  if (!userId) throw new Error('Authentication adapter is not configured. Wire requireCurrentUser() to the production session provider.');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Authenticated user was not found.');
  return user;
}