import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// 🔥 الحصول على الـ BASE_URL من app.json
const BASE_URL = Constants.expoConfig?.extra?.API_URL;

if (!BASE_URL) {
  console.error("❌ ERROR: API_URL not configured in app.json");
}

/**
 * دالة عامة لجميع API calls
 * @param endpoint - المسار (مثال: /auth/me)
 * @param options - خيارات fetch إضافية
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  try {
    // ✅ التحقق من الاتصال بالإنترنت
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error("No internet connection");
    }

    // ✅ الحصول على التوكن من التخزين
    const token = await AsyncStorage.getItem("token");

    // ✅ تجهيز الـ Headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // ✅ عمل الـ Request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // ✅ التحقق من حالة الـ Response
    if (!response.ok) {
      const error = await response.text();
      console.error(`API Error: ${response.status}`, error);
      throw new Error(`API Error: ${response.status}`);
    }

    // ✅ تحويل الـ Response إلى JSON
    const data = await response.json();
    return data;

  } catch (error) {
    console.error(`API Call Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * دالة للـ GET requests
 */
export async function apiGet(endpoint: string): Promise<any> {
  return apiCall(endpoint, { method: 'GET' });
}

/**
 * دالة للـ POST requests
 */
export async function apiPost(endpoint: string, body: any): Promise<any> {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * دالة للـ PUT requests
 */
export async function apiPut(endpoint: string, body: any): Promise<any> {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * دالة للـ DELETE requests
 */
export async function apiDelete(endpoint: string): Promise<any> {
  return apiCall(endpoint, { method: 'DELETE' });
}
