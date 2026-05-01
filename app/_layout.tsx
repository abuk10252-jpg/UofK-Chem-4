import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import LoadingScreen from '../src/components/LoadingScreen';
import * as SplashScreen from 'expo-splash-screen';

// منع إخفاء السبلاش تلقائياً لحد ما نجهز كل شيء
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { loading } = useAuth();

  // إخفاء السبلاش لما يخلص التحميل
  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loading]);

  // عرض شاشة التحميل
  if (loading) {
    return <LoadingScreen />;
  }

  // التنقل الرئيسي
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="super-admin" />
      <Stack.Screen name="admin/users" />
      <Stack.Screen name="admin/create-course" />
      <Stack.Screen name="admin/create-news" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
