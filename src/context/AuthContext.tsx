import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

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
    loadStoredUser();
  }, []);

  // 🔥 تحميل المستخدم من التخزين (Offline Mode)
  async function loadStoredUser() {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const savedToken = await AsyncStorage.getItem("token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser)); // تشغيل التطبيق بدون نت
      }

      // محاولة تحديث البيانات لو في نت
      try {
        const data = await apiCall("/auth/me");
        if (data?.user) {
          setUser(data.user);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        // Offline → تجاهل
      }

    } finally {
      setLoading(false);
    }
  }

  // 🔥 تسجيل الدخول
  async function login(email: string, password: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken(true);

    await AsyncStorage.setItem("token", idToken);

    const data = await apiCall('/auth/me');
    setUser(data.user);

    // تخزين المستخدم للأوفلاين
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  }

  // 🔥 تسجيل حساب جديد
  async function register(regData: { email: string; university_id: string; name: string; password: string }): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, regData.email, regData.password);
    const idToken = await cred.user.getIdToken(true);

    await AsyncStorage.setItem("token", idToken);

    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    });

    setUser(data.user);

    // تخزين المستخدم للأوفلاين
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  }

  // 🔥 تسجيل الخروج
  async function logout() {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
  }

  // 🔥 تحديث بيانات المستخدم
  async function refreshUser() {
    try {
      const data = await apiCall('/auth/me');
      if (data?.user) {
        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
