import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // -----------------------------
  // 🌐 فحص حالة الإنترنت (NetInfo)
  // -----------------------------
  let isOnline = true;

  try {
    const net = await NetInfo.fetch();
    isOnline = !!net.isConnected;
  } catch (e) {
    // لو حصل خطأ في NetInfo نعتبر إننا أونلاين ونخلي الـ fetch يقرر
    console.log('NetInfo error, fallback to online fetch:', e);
    isOnline = true;
  }

  // -----------------------------
  // 📴 OFFLINE MODE
  // -----------------------------
  if (!isOnline) {
    console.log('📴 Offline Mode:', endpoint);

    // 🔹 الأخبار
    if (endpoint.includes('/news')) {
      const cached = await AsyncStorage.getItem('news');
      return { news: cached ? JSON.parse(cached) : [] };
    }

    // 🔹 الكورسات
    if (endpoint.includes('/courses')) {
      const cached = await AsyncStorage.getItem('courses');
      return { courses: cached ? JSON.parse(cached) : [] };
    }

    // 🔹 الإشعارات
    if (endpoint.includes('/notifications')) {
      const cached = await AsyncStorage.getItem('notifications');
      return { notifications: cached ? JSON.parse(cached) : [] };
    }

    // 🔹 أي API تاني
    return { offline: true };
  }

  // -----------------------------
  // 🌐 ONLINE MODE
  // -----------------------------
  const token = await AsyncStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // لو ما FormData نضيف Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // -----------------------------
  // 💾 تخزين البيانات المهمة للأوفلاين
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

  // -----------------------------
  // ❗ معالجة الأخطاء
  // -----------------------------
  if (!response.ok) {
    let detail = 'Something went wrong';
    if (data?.error) detail = data.error;
    throw new Error(detail);
  }

  return data;
}
