import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function SuperAdminSettings() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super Admin Settings</Text>
      <Text style={styles.subtitle}>Logged in as: {user?.email}</Text>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => Alert.alert('Info', 'This area is for future super admin tools')}
      >
        <Text style={styles.btnText}>System Controls (Coming Soon)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.btn, styles.logoutBtn]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002147', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#ccc', marginBottom: 30 },
  btn: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 12, marginBottom: 16 },
  btnText: { color: '#002147', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  logoutBtn: { backgroundColor: '#fff' },
  logoutText: { color: '#002147', fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
