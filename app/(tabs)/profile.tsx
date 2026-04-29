// نفس الاستيرادات الأصلية
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

export default function ProfileTab() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const [courses, setCourses] = useState([]);
  const [showSubs, setShowSubs] = useState(false);

  // 🔥 قسم الكويزات
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchCourses();
    if (isAdmin) fetchMyQuizzes();
  }, []);

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

        {/* ... نفس الإعدادات الأصلية بدون تغيير ... */}
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

      {/* 🔥 قسم الكويزات الجديد */}
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

// نفس الستايلات الأصلية + إضافة بسيطة لستايل الكويزات
const styles = StyleSheet.create({
  ... // (نفس الستايلات الأصلية)
  quizCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  quizTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  quizRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  quizBtn: { flex: 1, backgroundColor: Colors.accent, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  quizBtnText: { color: '#FFF', fontWeight: '700' },
});
