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
        <Stack.Screen name="course/[id]" options={{
          headerShown: true, headerTitle: 'Course',
          headerStyle: { backgroundColor: '#002147' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }} />
        <Stack.Screen name="admin/users" options={{
          headerShown: true, headerTitle: 'Manage Users',
          headerStyle: { backgroundColor: '#002147' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }} />
        <Stack.Screen name="admin/create-course" options={{
          headerShown: true, headerTitle: 'Create Course',
          headerStyle: { backgroundColor: '#002147' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }} />
        <Stack.Screen name="admin/create-news" options={{
          headerShown: true, headerTitle: 'Create News',
          headerStyle: { backgroundColor: '#002147' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }} />
      </Stack>
    </AuthProvider>
  );
}
