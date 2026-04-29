import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } 
      else if (user.status === 'pending') {
        router.replace('/pending');
      } 
      else if (user.status === 'rejected') {
        router.replace('/login');
      } 
      else if (user.role === 'super_admin') {
        router.replace('/super-admin');
      }
      else if (user.role === 'admin') {
        router.replace('/admin');
      }
      else {
        router.replace('/(tabs)/academic');
      }
    }
  }, [user, loading]);

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
