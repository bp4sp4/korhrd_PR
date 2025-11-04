import { notFound } from 'next/navigation';
import { getUserByUsername } from '@/lib/users';
import ProfileTemplate from '@/components/ProfileTemplate';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  return <ProfileTemplate user={user} />;
}

export async function generateMetadata({ params }: UserPageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: '사용자를 찾을 수 없습니다',
    };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio,
  };
}
