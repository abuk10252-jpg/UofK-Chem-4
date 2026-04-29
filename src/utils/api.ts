import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = 'Something went wrong';
    try {
      const errorData = await response.json();
      if (errorData.error) detail = errorData.error;
    } catch {}
    throw new Error(detail);
  }

  return response.json();
}
