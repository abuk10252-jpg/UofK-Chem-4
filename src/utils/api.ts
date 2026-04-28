import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
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
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    let detail = 'Something went wrong';
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === 'string') {
        detail = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        detail = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(' ');
      }
    } catch {}
    throw new Error(detail);
  }
  return response.json();
}

export async function uploadFile(endpoint: string, formData: FormData) {
  const token = await AsyncStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!response.ok) {
    let detail = 'Upload failed';
    try {
      const errorData = await response.json();
      detail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    } catch {}
    throw new Error(detail);
  }
  return response.json();
}
