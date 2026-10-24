import { auth } from '@/auth';

export async function getUserId(): Promise<number | null> {
  const session = await auth();
  const userId = Number(session?.user?.id);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function requireUserId(): Promise<number> {
  const userId = await getUserId();
  if (!userId) throw new Error('UNAUTHORIZED');
  return userId;
}
