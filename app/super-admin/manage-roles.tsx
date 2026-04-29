import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { apiCall } from '../../src/utils/api';
import { useAuth } from '../../src/context/AuthContext';

export default function ManageRoles() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      const data = await apiCall('/admin/users'); // نفس API الأدمن
      setUsers(data.users);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(uid: string, role: string) {
    try {
      await apiCall(`/admin/set-role/${uid}`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });

      Alert.alert('Success', `Role updated to ${role}`);
      loadUsers();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage User Roles</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>Current Role: {item.role}</Text>

            {/* أزرار الترقية والتنزيل */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={styles.btn}
                onPress={() => updateRole(item.id, 'student')}
              >
                <Text style={styles.btnText}>Set Student</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btn}
                onPress={() => updateRole(item.id, 'admin')}
              >
                <Text style={styles.btnText}>Set Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, styles.superBtn]}
                onPress={() => updateRole(item.id, 'super_admin')}
              >
                <Text style={styles.superText}>Set Super Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002147', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002147' },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 20 },
  userCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 18, fontWeight: '700', color: '#002147' },
  role: { fontSize: 14, color: '#444', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { backgroundColor: '#D4AF37', padding: 10, borderRadius: 8, flex: 1, marginRight: 6 },
  btnText: { color: '#002147', fontWeight: '700', textAlign: 'center' },
  superBtn: { backgroundColor: '#002147' },
  superText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});
