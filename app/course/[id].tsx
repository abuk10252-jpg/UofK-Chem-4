import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall, uploadFile } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';
import * as DocumentPicker from 'expo-document-picker';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface FileItem {
  id: string; course_id: string; name: string; type: string; folder: string; size: number; created_at: string;
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [course, setCourse] = useState<any>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchCourse(); }, [id]);

  async function fetchCourse() {
    try {
      const data = await apiCall(`/api/courses/${id}`);
      setCourse(data.course);
      setFiles(data.files);
    } catch {} finally { setLoading(false); }
  }

  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploading(true);
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as any);
      formData.append('folder', 'General');
      const data = await uploadFile(`/api/courses/${id}/files`, formData);
      setFiles(prev => [data.file, ...prev]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  async function handleDelete(fileId: string) {
    Alert.alert('Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await apiCall(`/api/courses/${id}/files/${fileId}`, { method: 'DELETE' });
          setFiles(prev => prev.filter(f => f.id !== fileId));
        } catch {}
      }}
    ]);
  }

  function handleDownload(file: FileItem) {
    const url = `${BASE_URL}/api/courses/${file.course_id}/files/${file.id}/download`;
    Linking.openURL(url);
  }

  function getFileIcon(type: string) {
    switch (type) {
      case 'pdf': return 'document-text';
      case 'image': return 'image';
      case 'video': return 'videocam';
      default: return 'document';
    }
  }

  function getFileColor(type: string) {
    switch (type) {
      case 'pdf': return '#EF4444';
      case 'image': return '#3B82F6';
      case 'video': return '#8B5CF6';
      default: return Colors.primary;
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function renderFile({ item }: { item: FileItem }) {
    return (
      <View style={styles.fileCard} testID={`file-card-${item.id}`}>
        <View style={[styles.fileIcon, { backgroundColor: getFileColor(item.type) + '15' }]}>
          <Ionicons name={getFileIcon(item.type) as any} size={24} color={getFileColor(item.type)} />
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.fileMeta}>
            <Text style={styles.fileSize}>{formatSize(item.size)}</Text>
            <Text style={styles.fileDot}> . </Text>
            <Text style={styles.fileType}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.fileActions}>
          <TouchableOpacity testID={`download-file-${item.id}`} style={styles.dlBtn} onPress={() => handleDownload(item)}>
            <Ionicons name="download-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity testID={`delete-file-${item.id}`} style={styles.delBtn} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={styles.container} testID="course-detail-screen">
      <View style={styles.courseHeader}>
        <Text style={styles.courseName}>{lang === 'ar' ? course?.name_ar : course?.name}</Text>
        <Text style={styles.courseDesc}>{lang === 'ar' ? course?.description_ar : course?.description}</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="document" size={16} color={Colors.accent} />
            <Text style={styles.statNum}>{files.length}</Text>
            <Text style={styles.statLabel}>{t('files', lang)}</Text>
          </View>
        </View>
      </View>
      {isAdmin && (
        <TouchableOpacity testID="upload-file-btn" style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
          {uploading ? <ActivityIndicator color="#FFF" /> : (
            <><Ionicons name="cloud-upload" size={20} color="#FFF" /><Text style={styles.uploadText}> {t('uploadFile', lang)}</Text></>
          )}
        </TouchableOpacity>
      )}
      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={renderFile}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>{t('noFiles', lang)}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  courseHeader: { backgroundColor: '#FFF', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  courseName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  courseDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  stats: { flexDirection: 'row' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 13, color: Colors.textSecondary },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, margin: 16, marginBottom: 8, paddingVertical: 14, borderRadius: 12 },
  uploadText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 32 },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,33,71,0.05)', shadowColor: '#000', shadowOffset: {width:0,height:2}, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  fileIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  fileMeta: { flexDirection: 'row', alignItems: 'center' },
  fileSize: { fontSize: 12, color: Colors.textSecondary },
  fileDot: { fontSize: 12, color: Colors.border },
  fileType: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  fileActions: { flexDirection: 'row', gap: 8 },
  dlBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(212,175,55,0.1)', alignItems: 'center', justifyContent: 'center' },
  delBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, marginTop: 12 },
});
