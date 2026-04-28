import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

interface Course { id: string; name: string; name_ar: string; description: string; description_ar: string; file_count: number; }

export default function AcademicTab() {
  const { user } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [editModal, setEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCourses = useCallback(async () => {
    try { const data = await apiCall('/api/courses/'); setCourses(data.courses); } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { fetchCourses(); }, []);

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 2) { setSearchResults(null); return; }
    setSearching(true);
    try { const data = await apiCall(`/api/search?q=${encodeURIComponent(q)}`); setSearchResults(data); } catch {} finally { setSearching(false); }
  }

  function openEdit(c: Course) {
    setEditCourse(c); setEditName(c.name); setEditNameAr(c.name_ar); setEditDesc(c.description); setEditDescAr(c.description_ar); setEditModal(true);
  }

  async function handleSaveEdit() {
    if (!editCourse || !editName.trim()) return;
    setSaving(true);
    try {
      const data = await apiCall(`/api/courses/${editCourse.id}`, { method: 'PUT', body: JSON.stringify({ name: editName.trim(), name_ar: editNameAr.trim(), description: editDesc.trim(), description_ar: editDescAr.trim() }) });
      setCourses(prev => prev.map(c => c.id === editCourse.id ? data.course : c));
      setEditModal(false);
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setSaving(false); }
  }

  async function handleDelete(courseId: string, courseName: string) {
    Alert.alert('Delete Course', `Delete "${courseName}" and all its files?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await apiCall(`/api/courses/${courseId}`, { method: 'DELETE' }); setCourses(prev => prev.filter(c => c.id !== courseId)); } catch {}
      }},
    ]);
  }

  const courseIcons: Record<string, string> = { 'Chemical Calculus': 'calculator', 'Thermodynamics': 'flame', 'Reaction Engineering': 'flask', 'Mass Transfer': 'swap-horizontal', 'Process Control': 'settings' };

  function renderCourse({ item }: { item: Course }) {
    const iconName = courseIcons[item.name] || 'book';
    return (
      <TouchableOpacity testID={`course-card-${item.id}`} style={styles.courseCard} onPress={() => router.push(`/course/${item.id}` as any)} activeOpacity={0.7}>
        <View style={styles.courseIcon}><Ionicons name={iconName as any} size={28} color={Colors.accent} /></View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{lang === 'ar' ? item.name_ar : item.name}</Text>
          <Text style={styles.courseDesc} numberOfLines={2}>{lang === 'ar' ? item.description_ar : item.description}</Text>
          <View style={styles.courseStats}>
            <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}> {item.file_count} {t('files', lang)}</Text>
          </View>
        </View>
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity testID={`edit-course-${item.id}`} style={styles.iconBtn} onPress={(e) => { e.stopPropagation?.(); openEdit(item); }}>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity testID={`delete-course-${item.id}`} style={styles.iconBtn} onPress={(e) => { e.stopPropagation?.(); handleDelete(item.id, item.name); }}>
              <Ionicons name="trash" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        {!isAdmin && <Ionicons name="chevron-forward" size={20} color={Colors.border} />}
      </TouchableOpacity>
    );
  }

  function renderSearchResults() {
    if (!searchResults) return null;
    const { courses: sc, files: sf } = searchResults;
    if (!sc.length && !sf.length) return <Text style={styles.emptyText}>{t('noResults', lang)}</Text>;
    return (
      <View style={styles.searchResultsWrap}>
        {sc.length > 0 && (<View><Text style={styles.sectionLabel}>{t('courses', lang)}</Text>
          {sc.map((c: Course) => (<TouchableOpacity key={c.id} style={styles.searchItem} onPress={() => { setSearch(''); setSearchResults(null); router.push(`/course/${c.id}` as any); }}>
            <Ionicons name="book-outline" size={18} color={Colors.primary} /><Text style={styles.searchItemText}>{lang === 'ar' ? c.name_ar : c.name}</Text>
          </TouchableOpacity>))}</View>)}
        {sf.length > 0 && (<View><Text style={styles.sectionLabel}>{t('files', lang)}</Text>
          {sf.map((f: any) => (<TouchableOpacity key={f.id} style={styles.searchItem} onPress={() => { setSearch(''); setSearchResults(null); router.push(`/course/${f.course_id}` as any); }}>
            <Ionicons name="document-outline" size={18} color={Colors.accent} /><Text style={styles.searchItemText}>{f.name}</Text>
          </TouchableOpacity>))}</View>)}
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={styles.container} testID="academic-tab">
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput testID="search-input" style={styles.searchInput} placeholder={t('searchPlaceholder', lang)} value={search} onChangeText={handleSearch} placeholderTextColor={Colors.textSecondary} />
        {searching && <ActivityIndicator size="small" color={Colors.accent} />}
        {search.length > 0 && <TouchableOpacity onPress={() => { setSearch(''); setSearchResults(null); }}><Ionicons name="close-circle" size={20} color={Colors.textSecondary} /></TouchableOpacity>}
      </View>
      {searchResults ? renderSearchResults() : (
        <FlatList data={courses} keyExtractor={item => item.id} renderItem={renderCourse} contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCourses(); }} tintColor={Colors.accent} />}
          ListHeaderComponent={<View style={styles.listHeader}><Text style={styles.headerTitle}>{t('courses', lang)}</Text>
            {isAdmin && <TouchableOpacity testID="create-course-btn" style={styles.addBtn} onPress={() => router.push('/admin/create-course' as any)}>
              <Ionicons name="add" size={20} color="#FFF" /><Text style={styles.addBtnText}> {t('createCourse', lang)}</Text></TouchableOpacity>}
          </View>}
          ListEmptyComponent={<Text style={styles.emptyText}>No courses available</Text>}
        />
      )}
      <Modal visible={editModal} transparent animationType="fade" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Course</Text>
            <TextInput testID="edit-course-name" style={styles.modalInput} value={editName} onChangeText={setEditName} placeholder="Course Name (EN)" placeholderTextColor={Colors.textSecondary} />
            <TextInput testID="edit-course-name-ar" style={[styles.modalInput, { textAlign: 'right' }]} value={editNameAr} onChangeText={setEditNameAr} placeholder="اسم المادة (عربي)" placeholderTextColor={Colors.textSecondary} />
            <TextInput style={styles.modalInput} value={editDesc} onChangeText={setEditDesc} placeholder="Description (EN)" multiline placeholderTextColor={Colors.textSecondary} />
            <TextInput style={[styles.modalInput, { textAlign: 'right' }]} value={editDescAr} onChangeText={setEditDescAr} placeholder="الوصف (عربي)" multiline placeholderTextColor={Colors.textSecondary} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity testID="save-edit-course" style={styles.saveBtn} onPress={handleSaveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginBottom: 8, paddingHorizontal: 16, borderRadius: 12, height: 48, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  courseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: Colors.primary, shadowOffset: {width:0,height:4}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,33,71,0.05)' },
  courseIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  courseDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  courseStats: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: Colors.textSecondary },
  adminActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
  searchResultsWrap: { paddingHorizontal: 16, flex: 1 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  searchItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: Colors.border },
  searchItemText: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  modalInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.textPrimary, marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
