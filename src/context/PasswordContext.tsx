import React, { createContext, useContext, useState, useEffect } from 'react';
import { Password } from '../types';
import { 
  getPasswords, 
  addPassword, 
  updatePassword, 
  deletePassword as deletePasswordFromDB,
  getPassword
} from '../services/database';
import { encryptData, decryptData, generateMasterKey } from '../utils/encryption';
import { useAuth } from './AuthContext';

interface PasswordContextType {
  passwords: Password[];
  loading: boolean;
  error: string | null;
  addNewPassword: (password: Omit<Password, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Password>;
  updateExistingPassword: (password: Password) => Promise<Password>;
  deletePassword: (id: number) => Promise<void>;
  getPasswordById: (id: number) => Promise<Password | undefined>;
  decryptPassword: (encryptedPassword: string) => string;
  searchPasswords: (query: string) => Password[];
  filterPasswordsByCategory: (category: string) => Password[];
  toggleFavorite: (id: number) => Promise<void>;
}

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

export const PasswordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState<string>('');

  // Load passwords when auth state changes
  useEffect(() => {
    const loadPasswords = async () => {
      if (authState.isAuthenticated && authState.user) {
        setLoading(true);
        try {
          // Generate master key for encryption/decryption
          if (authState.user.passwordHash && authState.user.salt) {
            const key = generateMasterKey(authState.user.passwordHash, authState.user.salt);
            setMasterKey(key);
          }
          
          const userPasswords = await getPasswords(authState.user.id as number);
          setPasswords(userPasswords);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to load passwords');
        } finally {
          setLoading(false);
        }
      } else {
        setPasswords([]);
      }
    };
    
    loadPasswords();
  }, [authState.isAuthenticated, authState.user]);

  const addNewPassword = async (
    passwordData: Omit<Password, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Password> => {
    if (!authState.user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const encrypted = encryptData(passwordData.password, masterKey);
      
      const newPassword: Password = {
        ...passwordData,
        userId: authState.user.id,
        password: encrypted,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const added = await addPassword(newPassword);
      setPasswords([...passwords, added]);
      return added;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add password');
      throw error;
    }
  };

  const updateExistingPassword = async (password: Password): Promise<Password> => {
    try {
      // Only encrypt if password has changed (not already encrypted)
      let updatedPassword = { ...password };
      
      // Check if password is already encrypted
      try {
        decryptData(password.password, masterKey);
        // If no error occurs, it's already encrypted
      } catch (e) {
        // Not encrypted yet, encrypt it
        const encrypted = encryptData(password.password, masterKey);
        updatedPassword = {
          ...password,
          password: encrypted,
          updatedAt: new Date()
        };
      }
      
      const updated = await updatePassword(updatedPassword);
      
      setPasswords(passwords.map(p => 
        p.id === updated.id ? updated : p
      ));
      
      return updated;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
      throw error;
    }
  };

  const deletePassword = async (id: number): Promise<void> => {
    try {
      await deletePasswordFromDB(id);
      setPasswords(passwords.filter(p => p.id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete password');
      throw error;
    }
  };

  const getPasswordById = async (id: number): Promise<Password | undefined> => {
    try {
      return await getPassword(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get password');
      throw error;
    }
  };

  const decryptPassword = (encryptedPassword: string): string => {
    try {
      return decryptData(encryptedPassword, masterKey);
    } catch (error) {
      setError('Failed to decrypt password');
      return '';
    }
  };

  const searchPasswords = (query: string): Password[] => {
    if (!query.trim()) return passwords;
    
    const lowerQuery = query.toLowerCase();
    return passwords.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.username.toLowerCase().includes(lowerQuery) ||
      (p.website && p.website.toLowerCase().includes(lowerQuery)) ||
      (p.notes && p.notes.toLowerCase().includes(lowerQuery)) ||
      (p.category && p.category.toLowerCase().includes(lowerQuery))
    );
  };

  const filterPasswordsByCategory = (category: string): Password[] => {
    if (category === 'all') return passwords;
    if (category === 'favorites') return passwords.filter(p => p.favorite);
    return passwords.filter(p => p.category === category);
  };

  const toggleFavorite = async (id: number): Promise<void> => {
    try {
      const password = passwords.find(p => p.id === id);
      if (!password) return;
      
      const updated = {
        ...password,
        favorite: !password.favorite,
        updatedAt: new Date()
      };
      
      await updatePassword(updated);
      
      setPasswords(passwords.map(p => 
        p.id === id ? updated : p
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update favorite');
      throw error;
    }
  };

  const value = {
    passwords,
    loading,
    error,
    addNewPassword,
    updateExistingPassword,
    deletePassword,
    getPasswordById,
    decryptPassword,
    searchPasswords,
    filterPasswordsByCategory,
    toggleFavorite
  };

  return (
    <PasswordContext.Provider value={value}>
      {children}
    </PasswordContext.Provider>
  );
};

export const usePasswords = (): PasswordContextType => {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswords must be used within a PasswordProvider');
  }
  return context;
};