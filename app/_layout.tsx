import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import LoadingScreen from '../src/components/LoadingScreen';

function LayoutContent() {
  const { loading } = useAuth();   // هذا الـ hook لازم يكون داخل الـ Provider

  if (loading) {
    return <LoadingScreen />;
  }

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

// 🔥 يجب استيراد useAuth هنا
import { useAuth } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <LayoutContent />
    </AuthProvider>
  );
}
