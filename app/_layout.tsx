import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="pending" />
        <Stack.Screen name="(tabs)" />

        {/* Admin Dashboard */}
        <Stack.Screen name="admin" />

        {/* Super Admin Dashboard */}
        <Stack.Screen name="super-admin" />

        {/* Admin tools */}
        <Stack.Screen name="admin/users" />
        <Stack.Screen name="admin/create-course" />
        <Stack.Screen name="admin/create-news" />
      </Stack>
    </AuthProvider>
  );
}
