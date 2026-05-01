import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log("INDEX SCREEN → loading finished");

    if (!user) {
      console.log("INDEX → Redirect to /login");
      router.replace('/login');
    } 
    else if (user.status === 'pending') {
      console.log("INDEX → Redirect to /pending");
      router.replace('/pending');
    } 
    else if (user.status === 'rejected') {
      console.log("INDEX → Redirect to /login (rejected)");
      router.replace('/login');
    } 
    else if (user.role === 'super_admin') {
      console.log("INDEX → Redirect to /super-admin");
      router.replace('/super-admin');
    }
    else if (user.role === 'admin') {
      console.log("INDEX → Redirect to /admin");
      router.replace('/admin');
    }
    else {
      console.log("INDEX → Redirect to /(tabs)/academic");
      router.replace('/(tabs)/academic');
    }
  }, [user, loading, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#002147',
  },
});
