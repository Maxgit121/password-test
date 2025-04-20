export interface User {
  id?: number;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Password {
  id?: number;
  userId: number;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}