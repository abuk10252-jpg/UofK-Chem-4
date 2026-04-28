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
  const isSuperAdmin = user?.role === 'superadmin';
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [messageUserId, setMessageUserId] = useState<string>('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const data = await apiCall('/api/admin/users');
      setUsers(data.users);
    } catch {} finally { setLoading(false); }
  }

  async function handleApprove(userId: string) {
    try {
      await apiCall(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
    } catch {}
  }

  async function handleReject(userId: string) {
    try {
      await apiCall(`/api/admin/users/${userId}/reject`, { method: 'POST' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
    } catch {}
  }

  async function handlePromote(userId: string) {
    Alert.alert('Promote User', 'Promote this user to Admin?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Promote', onPress: async () => {
        try {
          await apiCall(`/api/admin/users/${userId}/promote`, { method: 'POST', body: JSON.stringify({ role: 'admin' }) });
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
        } catch {}
      }},
    ]);
  }

  async function handleKick(userId: string) {
    Alert.alert('Remove User', 'Remove this user from the platform?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await apiCall(`/api/admin/users/${userId}/kick`, { method: 'POST' });
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
        } catch {}
      }},
    ]);
  }

  async function handleSendMessage() {
    if (!messageText.trim()) return;
    try {
      await apiCall(`/api/admin/users/${messageUserId}/message`, { method: 'POST', body: JSON.stringify({ message: messageText }) });
      setMessageUserId('');
      setMessageText('');
      Alert.alert('Success', 'Message sent');
    } catch {}
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter);
  const pendingCount = users.filter(u => u.status === 'pending').length;

  function getStatusColor(status: string) {
    return status === 'approved' ? Colors.success : status === 'pending' ? Colors.warning : Colors.error;
  }

  function renderUser({ item }: { item: UserItem }) {
    if (item.id === user?.id) return null;
    return (
      <View style={styles.userCard} testID={`user-card-${item.id}`}>
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
        <View style={styles.actions}>
          {item.status === 'pending' && (
            <>
              <TouchableOpacity testID={`approve-user-${item.id}`} style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => handleApprove(item.id)}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
                <Text style={styles.actionText}>{t('approve', lang)}</Text>
              </TouchableOpacity>
              <TouchableOpacity testID={`reject-user-${item.id}`} style={[styles.actionBtn, { backgroundColor: Colors.error }]} onPress={() => handleReject(item.id)}>
                <Ionicons name="close" size={16} color="#FFF" />
                <Text style={styles.actionText}>{t('reject', lang)}</Text>
              </TouchableOpacity>
            </>
          )}
          {isSuperAdmin && item.role === 'student' && item.status === 'approved' && (
            <TouchableOpacity testID={`promote-user-${item.id}`} style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => handlePromote(item.id)}>
              <Ionicons name="arrow-up" size={16} color="#FFF" />
              <Text style={styles.actionText}>{t('promoteAdmin', lang)}</Text>
            </TouchableOpacity>
          )}
          {item.role === 'student' && (
            <TouchableOpacity testID={`kick-user-${item.id}`} style={[styles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={() => handleKick(item.id)}>
              <Ionicons name="ban" size={16} color={Colors.error} />
            </TouchableOpacity>
          )}
          <TouchableOpacity testID={`message-user-${item.id}`} style={[styles.actionBtn, { backgroundColor: 'rgba(0,33,71,0.1)' }]} onPress={() => setMessageUserId(messageUserId === item.id ? '' : item.id)}>
            <Ionicons name="chatbubble" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {messageUserId === item.id && (
          <View style={styles.messageWrap}>
            <TextInput testID={`message-input-${item.id}`} style={styles.messageInput} placeholder="Type a message..." value={messageText} onChangeText={setMessageText} placeholderTextColor={Colors.textSecondary} />
            <TouchableOpacity testID={`send-message-${item.id}`} style={styles.sendMsgBtn} onPress={handleSendMessage}>
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={styles.container} testID="admin-users-screen">
      <View style={styles.filterRow}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <TouchableOpacity key={f} testID={`filter-${f}`} style={[styles.filterBtn, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
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
  messageWrap: { flexDirection: 'row', marginTop: 10, gap: 8 },
  messageInput: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 14, height: 42, fontSize: 14, borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary },
  sendMsgBtn: { width: 42, height: 42, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
