import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

interface UserItem {
  id: string; email: string; university_id: string; name: string; role: string; status: string; last_online: string;
}

export default function AdminUsersScreen() {
  const { user } = useAuth();
  const lang = user?.language || 'en';
  const isSuperAdmin = user?.role === 'super_admin';

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const data = await apiCall('/admin/users');
      setUsers(data.users);
    } catch (e) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(userId: string) {
    try {
      await apiCall(`/admin/approve/${userId}`, { method: 'POST' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
    } catch {
      Alert.alert('Error', 'Failed to approve user');
    }
  }

  async function handleReject(userId: string) {
    try {
      await apiCall(`/admin/reject/${userId}`, { method: 'POST' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
    } catch {
      Alert.alert('Error', 'Failed to reject user');
    }
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter);
  const pendingCount = users.filter(u => u.status === 'pending').length;

  function getStatusColor(status: string) {
    return status === 'approved' ? Colors.success : status === 'pending' ? Colors.warning : Colors.error;
  }

  function renderUser({ item }: { item: UserItem }) {
    // الأدمن ما يشوف سوبر أدمن
    if (item.role === 'super_admin') return null;

    // الأدمن ما يعدل نفسه
    const isSelf = item.id === user?.id;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userId}>ID: {item.university_id}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.roleLine}>
          <Text style={styles.roleLabel}>Role: <Text style={styles.roleValue}>{item.role}</Text></Text>
        </View>

        {!isSelf && (
          <View style={styles.actions}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleApprove(item.id)}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                  <Text style={styles.actionText}>{t('approve', lang)}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.error }]} onPress={() => handleReject(item.id)}>
                  <Ionicons name="close" size={16} color="#FFF" />
                  <Text style={styles.actionText}>{t('reject', lang)}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? `All (${users.length})` : f === 'pending' ? `Pending (${pendingCount})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  listContent: { padding: 16, paddingBottom: 32 },
  userCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,33,71,0.05)', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: 13, color: Colors.textSecondary },
  userId: { fontSize: 12, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  roleLine: { marginBottom: 10 },
  roleLabel: { fontSize: 13, color: Colors.textSecondary },
  roleValue: { fontWeight: '700', color: Colors.primary },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  actionText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
