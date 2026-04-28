import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

export default function ProfileTab() {
  const { user, logout, refreshUser, setUser } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [showSubs, setShowSubs] = useState(false);

  useEffect(() => { fetchNotifications(); fetchCourses(); }, []);

  async function fetchNotifications() {
    try {
      const data = await apiCall('/api/notifications');
      setNotifications(data.notifications);
      setUnread(data.unread_count);
    } catch {}
  }

  async function fetchCourses() {
    try {
      const data = await apiCall('/api/courses/');
      setCourses(data.courses);
    } catch {}
  }

  async function toggleLanguage() {
    const newLang = lang === 'en' ? 'ar' : 'en';
    try {
      const data = await apiCall('/api/profile/update', { method: 'POST', body: JSON.stringify({ language: newLang }) });
      setUser(data.user);
    } catch {}
  }

  async function toggleCourseSubscription(courseId: string) {
    const subs = user?.subscribed_courses || [];
    const newSubs = subs.includes(courseId) ? subs.filter(id => id !== courseId) : [...subs, courseId];
    try {
      const data = await apiCall('/api/profile/update', { method: 'POST', body: JSON.stringify({ subscribed_courses: newSubs }) });
      setUser(data.user);
    } catch {}
  }

  async function markAllRead() {
    try {
      await apiCall('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  }

  const roleLabel = user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Student';
  const roleColor = user?.role === 'superadmin' ? Colors.accent : user?.role === 'admin' ? Colors.primary : Colors.success;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="profile-tab">
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={Colors.accent} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings', lang)}</Text>
        <TouchableOpacity testID="toggle-language-btn" style={styles.settingRow} onPress={toggleLanguage}>
          <View style={styles.settingLeft}>
            <Ionicons name="language-outline" size={22} color={Colors.primary} />
            <Text style={styles.settingLabel}>{t('language', lang)}</Text>
          </View>
          <View style={styles.langToggle}>
            <Text style={[styles.langOption, lang === 'en' && styles.langActive]}>EN</Text>
            <Text style={styles.langDivider}>/</Text>
            <Text style={[styles.langOption, lang === 'ar' && styles.langActive]}>عربي</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity testID="notifications-btn" style={styles.settingRow} onPress={() => { setShowNotifs(!showNotifs); if (!showNotifs) fetchNotifications(); }}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
            <Text style={styles.settingLabel}>{t('notifications', lang)}</Text>
          </View>
          <View style={styles.settingRight}>
            {unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}
            <Ionicons name={showNotifs ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
        {showNotifs && (
          <View style={styles.notifsWrap}>
            {unread > 0 && (
              <TouchableOpacity testID="mark-all-read-btn" style={styles.markReadBtn} onPress={markAllRead}>
                <Text style={styles.markReadText}>{t('markAllRead', lang)}</Text>
              </TouchableOpacity>
            )}
            {notifications.length === 0 && <Text style={styles.emptyText}>{t('noNotifications', lang)}</Text>}
            {notifications.slice(0, 10).map(n => (
              <View key={n.id} style={[styles.notifItem, !n.read && styles.notifUnread]}>
                <Ionicons name={n.type === 'admin' ? 'shield' : n.type === 'file' ? 'document' : 'megaphone'} size={16} color={n.read ? Colors.textSecondary : Colors.accent} />
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{lang === 'ar' ? (n.title_ar || n.title) : n.title}</Text>
                  {n.message ? <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity testID="course-subscriptions-btn" style={styles.settingRow} onPress={() => setShowSubs(!showSubs)}>
          <View style={styles.settingLeft}>
            <Ionicons name="bookmark-outline" size={22} color={Colors.primary} />
            <Text style={styles.settingLabel}>{t('subscribeNotif', lang)}</Text>
          </View>
          <Ionicons name={showSubs ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        {showSubs && (
          <View style={styles.subsWrap}>
            {courses.map(c => (
              <TouchableOpacity key={c.id} style={styles.subItem} onPress={() => toggleCourseSubscription(c.id)}>
                <Text style={styles.subText}>{lang === 'ar' ? c.name_ar : c.name}</Text>
                <Ionicons name={user?.subscribed_courses?.includes(c.id) ? 'checkbox' : 'square-outline'} size={22} color={user?.subscribed_courses?.includes(c.id) ? Colors.accent : Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('adminPanel', lang)}</Text>
          <TouchableOpacity testID="manage-users-btn" style={styles.adminRow} onPress={() => router.push('/admin/users' as any)}>
            <Ionicons name="people" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('manageUsers', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity testID="admin-create-course-btn" style={styles.adminRow} onPress={() => router.push('/admin/create-course' as any)}>
            <Ionicons name="add-circle" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('createCourse', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity testID="admin-create-news-btn" style={styles.adminRow} onPress={() => router.push('/admin/create-news' as any)}>
            <Ionicons name="newspaper" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('createNews', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity testID="logout-btn" style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/login'); }}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}> {t('logout', lang)}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: Colors.primary, shadowOffset: {width:0,height:4}, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,33,71,0.05)' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(212,175,55,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  roleText: { fontSize: 12, fontWeight: '700' },
  section: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,33,71,0.05)' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langOption: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  langActive: { color: Colors.accent, fontWeight: '700' },
  langDivider: { color: Colors.border },
  badge: { backgroundColor: Colors.error, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  notifsWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  markReadBtn: { alignSelf: 'flex-end', paddingVertical: 6 },
  markReadText: { fontSize: 13, color: Colors.accent, fontWeight: '600' },
  notifItem: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  notifUnread: { backgroundColor: 'rgba(212,175,55,0.05)' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  notifMsg: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, paddingVertical: 12, textAlign: 'center' },
  subsWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  subItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  subText: { fontSize: 15, color: Colors.textPrimary },
  adminRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  adminLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary, flex: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error, borderRadius: 12, paddingVertical: 16, marginTop: 8 },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
