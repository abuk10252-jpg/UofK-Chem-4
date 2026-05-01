import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// 🔥 الحصول على الـ BASE_URL من app.json
const BASE_URL = Constants.expoConfig?.extra?.API_URL || "";

if (!BASE_URL) {
  console.warn("⚠️ WARNING: API_URL is missing in app.json");
}

/**
 * دالة عامة لجميع API calls
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // 🔥 التحقق من الاتصال بالإنترنت
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      // ❗ لا ترمي Error — رجّع null عشان ما يحصل Crash
      return { offline: true };
    }

    // 🔥 الحصول على التوكن
    const token = await AsyncStorage.getItem("token");

    // 🔥 تجهيز الـ Headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as any),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 🔥 إرسال الطلب
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 🔥 التحقق من حالة الـ Response
    if (!response.ok) {
      const text = await response.text();
      console.warn(`API Error ${response.status}:`, text);
      return null; // ❗ لا ترمي Error
    }

    // 🔥 تحويل JSON
    try {
      return await response.json();
    } catch {
      return null;
    }

  } catch (error) {
    console.warn(`API Call Error on ${endpoint}:`, error);
    return null; // ❗ لا ترمي Error
  }
}

/**
 * GET
 */
export async function apiGet(endpoint: string) {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * POST
 */
export async function apiPost(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT
 */
export async function apiPut(endpoint: string, body: any) {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE
 */
export async function apiDelete(endpoint: string) {
  return apiCall(endpoint, { method: 'DELETE' });
}
