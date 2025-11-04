import { User, UserProfileData, UserRole } from '@/types/user';
import { createClient } from './supabase/client';

// Supabase에서 프로필을 User 타입으로 변환
function profileToUser(profile: any): User {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    bio: profile.bio || '',
    image: profile.image || '/next.svg',
    role: (profile.role || 'user') as UserRole,
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString(),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (data || []).map(profileToUser);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) {
    return undefined;
  }

  return profileToUser(data);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return undefined;
  }

  return profileToUser(data);
}

export async function createUser(
  username: string,
  name: string,
  userId: string,
  role: UserRole = 'user'
): Promise<User> {
  const supabase = createClient();
  
  // 먼저 username 중복 체크
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error('Username already exists');
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username,
      name,
      bio: '',
      image: '/next.svg',
      role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to create user');
  }

  return profileToUser(data);
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfileData>
): Promise<User> {
  const supabase = createClient();

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update profile');
  }

  return profileToUser(updated);
}

export async function updateUserProfileByUsername(
  username: string,
  data: Partial<UserProfileData>
): Promise<User> {
  const supabase = createClient();

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('username', username)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || 'Failed to update profile');
  }

  return profileToUser(updated);
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
}
