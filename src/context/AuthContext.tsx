import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../utils/api';

import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

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

      // تشغيل التطبيق بدون نت
      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          await AsyncStorage.removeItem("user");
        }
      }

      // محاولة تحديث البيانات من السيرفر
      try {
        const data = await apiCall("/auth/me");
        if (data?.user) {
          setUser(data.user);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch {
        // السيرفر واقع → تجاهل بدون كراش
      }

    } finally {
      setLoading(false);
    }
  }

  // 🔥 تسجيل الدخول
  async function login(email: string, password: string): Promise<User> {
    // تسجيل الدخول من Firebase
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // الحصول على ID Token الحقيقي
    const idToken = await cred.user.getIdToken(true);
    await AsyncStorage.setItem("token", idToken);

    // جلب بيانات المستخدم من السيرفر
    let data = null;
    try {
      data = await apiCall('/auth/me');
    } catch {
      throw new Error("Server error while fetching user data");
    }

    if (!data?.user) {
      throw new Error("Invalid user data from server");
    }

    setUser(data.user);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  }

  // 🔥 تسجيل حساب جديد
  async function register(regData: { email: string; university_id: string; name: string; password: string }): Promise<User> {
    // إنشاء حساب في Firebase
    const cred = await createUserWithEmailAndPassword(auth, regData.email, regData.password);

    // الحصول على ID Token الحقيقي
    const idToken = await cred.user.getIdToken(true);
    await AsyncStorage.setItem("token", idToken);

    // إرسال بيانات المستخدم للسيرفر
    let data = null;
    try {
      data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(regData),
      });
    } catch {
      throw new Error("Server error while creating user");
    }

    if (!data?.user) {
      throw new Error("Invalid user data from server");
    }

    setUser(data.user);
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
    } catch {
      // تجاهل بدون كراش
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
