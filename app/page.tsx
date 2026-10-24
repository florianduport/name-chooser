import { auth } from '@/auth';
import GenderSelection from '@/components/GenderSelection';
import SignInScreen from '@/components/SignInScreen';

export default async function Home() {
  const session = await auth();
  if (!session?.user) return <SignInScreen />;
  return <GenderSelection />;
}
