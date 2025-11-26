import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { postUser, fetchUser, putUser } from '../services/api';
import { hashPassword } from '../services/cryptoService';
import type { User } from '../types';

const SESSION_STORAGE_KEY = 'currentUser';

interface AuthContextType {
  currentUser: { id: string } | null;
  signup: (id: string, password: string) => Promise<{ success: boolean; message: string }>;
  login: (id: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  changePassword: (id: string, oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(() => {
    try {
      const item = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Could not parse user from session storage", error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Could not update session storage", error);
    }
  }, [currentUser]);

  const signup = useCallback(async (id: string, password: string) => {
    const existingUser = await fetchUser(id);
    if (existingUser) {
      return { success: false, message: 'Username already exists.' };
    }
    
    const hashedPassword = await hashPassword(password);
    const newUser: User = { id, hashedPassword };
    
    await postUser(newUser);
    setCurrentUser({ id });
    
    return { success: true, message: 'Signup successful!' };
  }, []);
  
  const login = useCallback(async (id: string, password: string) => {
    const user = await fetchUser(id);
    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }
    
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== user.hashedPassword) {
      return { success: false, message: 'Invalid username or password.' };
    }
    
    setCurrentUser({ id });
    return { success: true, message: 'Login successful!' };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const changePassword = useCallback(async (id: string, oldPassword: string, newPassword: string) => {
    const user = await fetchUser(id);
    if (!user) {
      // This should not happen if the user is logged in, but as a safeguard.
      return { success: false, message: 'User not found.' };
    }

    const hashedOldPassword = await hashPassword(oldPassword);
    if (hashedOldPassword !== user.hashedPassword) {
      return { success: false, message: 'Incorrect current password.' };
    }

    const hashedNewPassword = await hashPassword(newPassword);
    const updatedUser: User = { ...user, hashedPassword: hashedNewPassword };
    await putUser(updatedUser);

    return { success: true, message: 'Password updated successfully!' };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
