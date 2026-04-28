import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';

export default function CreateCourseScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [desc, setDesc] = useState('');
  const [descAr, setDescAr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) { Alert.alert('Error', 'Course name is required'); return; }
    setLoading(true);
    try {
      await apiCall('/api/courses/', { method: 'POST', body: JSON.stringify({ name: name.trim(), name_ar: nameAr.trim() || name.trim(), description: desc.trim(), description_ar: descAr.trim() || desc.trim() }) });
      Alert.alert('Success', 'Course created!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>Course Name (English) *</Text>
          <TextInput testID="course-name-input" style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Thermodynamics" placeholderTextColor={Colors.textSecondary} />
          <Text style={styles.label}>Course Name (Arabic)</Text>
          <TextInput testID="course-name-ar-input" style={[styles.input, { textAlign: 'right' }]} value={nameAr} onChangeText={setNameAr} placeholder="مثال: الديناميكا الحرارية" placeholderTextColor={Colors.textSecondary} />
          <Text style={styles.label}>Description (English)</Text>
          <TextInput testID="course-desc-input" style={[styles.input, styles.multiline]} value={desc} onChangeText={setDesc} placeholder="Course description..." multiline numberOfLines={3} placeholderTextColor={Colors.textSecondary} />
          <Text style={styles.label}>Description (Arabic)</Text>
          <TextInput testID="course-desc-ar-input" style={[styles.input, styles.multiline, { textAlign: 'right' }]} value={descAr} onChangeText={setDescAr} placeholder="وصف المادة..." multiline numberOfLines={3} placeholderTextColor={Colors.textSecondary} />
          <TouchableOpacity testID="create-course-submit" style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="add-circle" size={20} color="#FFF" /><Text style={styles.btnText}> Create Course</Text></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.textPrimary },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
