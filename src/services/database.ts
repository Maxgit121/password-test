import { openDB, DBSchema } from 'idb';
import { User, Password } from '../types';

interface PasswordDBSchema extends DBSchema {
  users: {
    key: number;
    value: User;
    indexes: {
      'by-username': string;
    };
  };
  passwords: {
    key: number;
    value: Password;
    indexes: {
      'by-userId': number;
    };
  };
}

const DB_NAME = 'password-vault';
const DB_VERSION = 1;

export const initDatabase = async () => {
  const db = await openDB<PasswordDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create users store
      const userStore = db.createObjectStore('users', {
        keyPath: 'id',
        autoIncrement: true,
      });
      userStore.createIndex('by-username', 'username', { unique: true });
      
      // Create passwords store
      const passwordStore = db.createObjectStore('passwords', {
        keyPath: 'id',
        autoIncrement: true,
      });
      passwordStore.createIndex('by-userId', 'userId', { unique: false });
    },
  });
  
  return db;
};

// User operations
export const createUser = async (user: User): Promise<User> => {
  const db = await initDatabase();
  const id = await db.add('users', user);
  return { ...user, id: id as number };
};

export const getUserByUsername = async (username: string): Promise<User | undefined> => {
  const db = await initDatabase();
  return await db.getFromIndex('users', 'by-username', username);
};

export const updateUser = async (user: User): Promise<User> => {
  const db = await initDatabase();
  await db.put('users', user);
  return user;
};

// Password operations
export const getPasswords = async (userId: number): Promise<Password[]> => {
  const db = await initDatabase();
  return await db.getAllFromIndex('passwords', 'by-userId', userId);
};

export const addPassword = async (password: Password): Promise<Password> => {
  const db = await initDatabase();
  const id = await db.add('passwords', password);
  return { ...password, id: id as number };
};

export const updatePassword = async (password: Password): Promise<Password> => {
  const db = await initDatabase();
  await db.put('passwords', password);
  return password;
};

export const deletePassword = async (id: number): Promise<void> => {
  const db = await initDatabase();
  await db.delete('passwords', id);
};

export const getPassword = async (id: number): Promise<Password | undefined> => {
  const db = await initDatabase();
  return await db.get('passwords', id);
};