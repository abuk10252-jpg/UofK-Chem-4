import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

export interface User {
  id: string;
  email: string;
  university_id: string;
  name: string;
  role: string;
  status: string;
  language: string;
  profile_pic: string;
  subscribed_courses: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; university_id: string; name: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // كان /api/auth/me → شلنا /api
        const data = await apiCall('/auth/me');
        setUser(data.user);
      }
    } catch {
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    // كان /api/auth/login → شلنا /api
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await AsyncStorage.setItem('token', data.token);
    if (data.refresh_token) {
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
    }
    setUser(data.user);
    return data.user;
  }

  async function register(regData: { email: string; university_id: string; name: string; password: string }): Promise<User> {
    // كان /api/auth/register → شلنا /api
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    });

    await AsyncStorage.setItem('token', data.token);
    if (data.refresh_token) {
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
    }
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refresh_token');
    setUser(null);
  }

  async function refreshUser() {
    try {
      // كان /api/auth/me → شلنا /api
      const data = await apiCall('/auth/me');
      setUser(data.user);
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
