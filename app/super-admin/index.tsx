import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function SuperAdminHome() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Super Admin Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.name}</Text>

      {/* نفس صلاحيات الأدمن */}
      <TouchableOpacity 
        style={styles.btn}
        onPress={() => router.push('/admin/users')}
      >
        <Text style={styles.btnText}>Manage Users (Admins & Students)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => router.push('/admin/create-course')}
      >
        <Text style={styles.btnText}>Create Course</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.btn}
        onPress={() => router.push('/admin/create-news')}
      >
        <Text style={styles.btnText}>Create News</Text>
      </TouchableOpacity>

      {/* صلاحيات إضافية للسوبر أدمن فقط */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Super Admin Tools</Text>

        <TouchableOpacity 
          style={[styles.btn, styles.superBtn]}
          onPress={() => router.push('/super-admin/manage-roles')}
        >
          <Text style={styles.btnTextDark}>Promote / Demote Users</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.superBtn]}
          onPress={() => router.push('/super-admin/settings')}
        >
          <Text style={styles.btnTextDark}>Super Admin Settings</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    backgroundColor: '#002147',
    padding: 20,
    paddingTop: 60
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#ccc', 
    marginBottom: 30 
  },
  btn: { 
    backgroundColor: '#D4AF37', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16 
  },
  btnText: { 
    color: '#002147', 
    fontSize: 16, 
    fontWeight: '700', 
    textAlign: 'center' 
  },
  section: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ffffff33'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20
  },
  superBtn: {
    backgroundColor: '#fff'
  },
  btnTextDark: {
    color: '#002147',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center'
  }
});
