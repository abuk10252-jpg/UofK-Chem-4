import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall, apiPost } from '../utils/api';

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

  /**
   * 🔥 تحميل المستخدم من التخزين (Offline Mode)
   * يحاول تحميل المستخدم المحفوظ أولاً
   * ثم يحاول تحديث البيانات من السيرفر
   */
  async function loadStoredUser() {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const savedToken = await AsyncStorage.getItem("token");

      // ✅ تشغيل التطبيق بدون نت باستخدام البيانات المحفوظة
      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch {
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("token");
        }
      }

      // ✅ محاولة تحديث البيانات من السيرفر
      try {
        const data = await apiCall("/auth/me");
        if (data?.user) {
          setUser(data.user);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error) {
        // 🚨 السيرفر واقع أو لا يوجد اتصال → تجاهل بدون كراش
        console.warn("Could not refresh user data from server:", error);
      }

    } finally {
      setLoading(false);
    }
  }

  /**
   * 🔥 تسجيل الدخول
   */
  async function login(email: string, password: string): Promise<User> {
    try {
      // ✅ تسجيل الدخول من Firebase
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // ✅ الحصول على ID Token الحقيقي
      const idToken = await cred.user.getIdToken(true);
      await AsyncStorage.setItem("token", idToken);

      // ✅ جلب بيانات المستخدم من السيرفر
      const data = await apiCall('/auth/me');

      if (!data?.user) {
        throw new Error("Invalid user data from server");
      }

      setUser(data.user);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      return data.user;

    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  }

  /**
   * 🔥 تسجيل حساب جديد
   */
  async function register(regData: { 
    email: string; 
    university_id: string; 
    name: string; 
    password: string 
  }): Promise<User> {
    try {
      // ✅ إنشاء حساب في Firebase
      const cred = await createUserWithEmailAndPassword(
        auth, 
        regData.email, 
        regData.password
      );

      // ✅ الحصول على ID Token الحقيقي
      const idToken = await cred.user.getIdToken(true);
      await AsyncStorage.setItem("token", idToken);

      // ✅ إرسال بيانات المستخدم للسيرفر
      const data = await apiPost('/auth/register', {
        email: regData.email,
        university_id: regData.university_id,
        name: regData.name,
      });

      if (!data?.user) {
        throw new Error("Invalid user data from server");
      }

      setUser(data.user);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      return data.user;

    } catch (error) {
      console.error("Register Error:", error);
      throw error;
    }
  }

  /**
   * 🔥 تسجيل الخروج
   */
  async function logout() {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  }

  /**
   * 🔥 تحديث بيانات المستخدم
   */
  async function refreshUser() {
    try {
      const data = await apiCall('/auth/me');
      if (data?.user) {
        setUser(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.warn("Could not refresh user data:", error);
      // تجاهل بدون كراش
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      refreshUser, 
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
