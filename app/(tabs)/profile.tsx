// نفس الاستيرادات الأصلية
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // 🔥 الإشعارات
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  // 🔥 الكورسات
  const [courses, setCourses] = useState([]);

  // 🔥 قسم الكويزات
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchCourses();
    if (isAdmin) fetchMyQuizzes();
  }, []);

  // 🔥 جلب الإشعارات
  async function fetchNotifications() {
    try {
      const data = await apiCall('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingNoti(false);
    }
  }

  // 🔥 جلب الكورسات
  async function fetchCourses() {
    try {
      const data = await apiCall('/api/courses/');
      setCourses(data.courses);
    } catch {}
  }

  // 🔥 جلب الكويزات التي أنشأها الأدمن
  async function fetchMyQuizzes() {
    try {
      const data = await apiCall('/admin/my-quizzes');
      setQuizzes(data.quizzes || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingQuizzes(false);
    }
  }

  function openQuizResults(id: string) {
    router.push(`/admin/quiz-results/${id}`);
  }

  function downloadQuizPDF(id: string) {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/admin/quiz/${id}/results/pdf`;
    Linking.openURL(url);
  }

  const roleLabel =
    user?.role === 'superadmin'
      ? 'Super Admin'
      : user?.role === 'admin'
      ? 'Admin'
      : 'Student';

  const roleColor =
    user?.role === 'superadmin'
      ? Colors.accent
      : user?.role === 'admin'
      ? Colors.primary
      : Colors.success;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* 🔔 زر الإشعارات */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => setShowNotifs(!showNotifs)} style={{ position: 'relative' }}>
          <Ionicons name="notifications-outline" size={28} color={Colors.accent} />

          {/* النقطة الحمراء */}
          {notifications.length > 0 && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: 'red',
                position: 'absolute',
                top: 0,
                right: 0,
              }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 🔥 Popup الإشعارات */}
      {showNotifs && (
        <View
          style={{
            backgroundColor: '#FFF',
            padding: 12,
            borderRadius: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            maxHeight: 250,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
            Notifications
          </Text>

          {/* 🔥 زر Mark All as Read */}
          <TouchableOpacity
            onPress={async () => {
              await apiCall("/api/notifications/mark-all-read", "POST");
              fetchNotifications();
            }}
            style={{
              alignSelf: "flex-end",
              marginBottom: 10,
              backgroundColor: Colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "700" }}>Mark all as read</Text>
          </TouchableOpacity>

          {loadingNoti ? (
            <ActivityIndicator size="large" color={Colors.accent} />
          ) : notifications.length === 0 ? (
            <Text style={{ color: Colors.textSecondary }}>No notifications</Text>
          ) : (
            <ScrollView>
              {notifications.map((n, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#FAFAFA',
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    gap: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Ionicons
                    name={
                      n.file_type === 'pdf'
                        ? 'document-text'
                        : n.file_type === 'mp4'
                        ? 'videocam'
                        : 'document'
                    }
                    size={22}
                    color={Colors.accent}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14 }}>{n.title}</Text>
                    <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                      {n.body}
                    </Text>
                    <Text style={{ color: '#999', fontSize: 11, marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* بطاقة البروفايل */}
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

      {/* الإعدادات */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings', lang)}</Text>
      </View>

      {/* لوحة الأدمن */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('adminPanel', lang)}</Text>

          <TouchableOpacity style={styles.adminRow} onPress={() => router.push('/admin/users')}>
            <Ionicons name="people" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('manageUsers', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminRow} onPress={() => router.push('/admin/create-course')}>
            <Ionicons name="add-circle" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('createCourse', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminRow} onPress={() => router.push('/admin/create-news')}>
            <Ionicons name="newspaper" size={22} color={Colors.accent} />
            <Text style={styles.adminLabel}>{t('createNews', lang)}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* 🔥 قسم الكويزات */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Quizzes</Text>

          {loadingQuizzes ? (
            <ActivityIndicator size="large" color={Colors.accent} />
          ) : quizzes.length === 0 ? (
            <Text style={styles.emptyText}>No quizzes created</Text>
          ) : (
            quizzes.map((q) => (
              <View key={q.id} style={styles.quizCard}>
                <Text style={styles.quizTitle}>{q.title}</Text>

                <View style={styles.quizRow}>
                  <TouchableOpacity style={styles.quizBtn} onPress={() => openQuizResults(q.id)}>
                    <Ionicons name="list" size={16} color="#FFF" />
                    <Text style={styles.quizBtnText}>Results</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.quizBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => downloadQuizPDF(q.id)}
                  >
                    <Ionicons name="document" size={16} color="#FFF" />
                    <Text style={styles.quizBtnText}>PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* تسجيل الخروج */}
      <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/login'); }}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}> {t('logout', lang)}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// 🔥 الستايلات
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  content: { padding: 16 },

  profileCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: 14, color: Colors.textSecondary },

  roleBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  roleText: { fontSize: 12, fontWeight: '700' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  emptyText: { color: Colors.textSecondary, fontSize: 14 },

  // 🔥 الكويزات
  quizCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  quizTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  quizRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  quizBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  quizBtnText: { color: '#FFF', fontWeight: '700' },

  logoutBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
