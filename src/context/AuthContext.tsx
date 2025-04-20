import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getUserByUsername, createUser, updateUser } from '../services/database';
import { hashPassword, verifyPassword, generateSalt } from '../utils/encryption';

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto logout after inactivity (30 minutes)
  useEffect(() => {
    if (state.isAuthenticated) {
      let inactivityTimer: number;
      
      const resetTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = window.setTimeout(() => {
          logout();
        }, 30 * 60 * 1000); // 30 minutes
      };
      
      // Set up event listeners for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimer);
      });
      
      // Initial timer
      resetTimer();
      
      // Cleanup
      return () => {
        clearTimeout(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [state.isAuthenticated]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const user = await getUserByUsername(username);
      
      if (!user) {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid username or password' });
        return false;
      }
      
      const isValid = verifyPassword(password, user.salt, user.passwordHash);
      
      if (!isValid) {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid username or password' });
        return false;
      }
      
      // Update last login
      const updatedUser = {
        ...user,
        lastLogin: new Date()
      };
      
      await updateUser(updatedUser);
      
      // Save auth state to sessionStorage
      sessionStorage.setItem('authUser', JSON.stringify({
        id: updatedUser.id,
        username: updatedUser.username
      }));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser });
      return true;
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'An error occurred during login' 
      });
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const existingUser = await getUserByUsername(username);
      
      if (existingUser) {
        dispatch({ type: 'REGISTER_FAILURE', payload: 'Username already exists' });
        return false;
      }
      
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);
      
      const newUser: User = {
        username,
        passwordHash,
        salt,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      const createdUser = await createUser(newUser);
      
      // Save auth state to sessionStorage
      sessionStorage.setItem('authUser', JSON.stringify({
        id: createdUser.id,
        username: createdUser.username
      }));
      
      dispatch({ type: 'REGISTER_SUCCESS', payload: createdUser });
      return true;
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'An error occurred during registration' 
      });
      return false;
    }
  };

  const logout = (): void => {
    sessionStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  };

  const checkAuth = async (): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const authData = sessionStorage.getItem('authUser');
    
    if (!authData) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
    
    try {
      const { id, username } = JSON.parse(authData);
      const user = await getUserByUsername(username);
      
      if (user && user.id === id) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        return true;
      } else {
        sessionStorage.removeItem('authUser');
        dispatch({ type: 'SET_LOADING', payload: false });
        return false;
      }
    } catch (error) {
      sessionStorage.removeItem('authUser');
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};