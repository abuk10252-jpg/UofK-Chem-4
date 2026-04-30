import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.error("❌ ERROR: EXPO_PUBLIC_API_URL is missing");
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // -----------------------------
  // 🌐 فحص حالة الإنترنت
  // -----------------------------
  let isOnline = true;

  try {
    const net = await NetInfo.fetch();
    isOnline = net.isConnected === true;
  } catch {
    isOnline = true;
  }

  // -----------------------------
  // 📴 OFFLINE MODE
  // -----------------------------
  if (!isOnline) {
    if (endpoint.includes('/news')) {
      const cached = await AsyncStorage.getItem('news');
      return { news: cached ? JSON.parse(cached) : [] };
    }

    if (endpoint.includes('/courses')) {
      const cached = await AsyncStorage.getItem('courses');
      return { courses: cached ? JSON.parse(cached) : [] };
    }

    if (endpoint.includes('/notifications')) {
      const cached = await AsyncStorage.getItem('notifications');
      return { notifications: cached ? JSON.parse(cached) : [] };
    }

    return { offline: true };
  }

  // -----------------------------
  // 🌐 ONLINE MODE
  // -----------------------------
  const token = await AsyncStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (e) {
    throw new Error("Network error. Please try again.");
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // -----------------------------
  // ❗ معالجة الأخطاء
  // -----------------------------
  if (!response.ok) {
    const detail = data?.error || "Server error";
    throw new Error(detail);
  }

  // -----------------------------
  // 💾 تخزين البيانات للأوفلاين
  // -----------------------------
  if (endpoint.includes('/news') && data?.news) {
    await AsyncStorage.setItem('news', JSON.stringify(data.news));
  }

  if (endpoint.includes('/courses') && data?.courses) {
    await AsyncStorage.setItem('courses', JSON.stringify(data.courses));
  }

  if (endpoint.includes('/notifications') && data?.notifications) {
    await AsyncStorage.setItem('notifications', JSON.stringify(data.notifications));
  }

  return data;
}
