export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileData {
  name: string;
  bio: string;
  image: string;
}

