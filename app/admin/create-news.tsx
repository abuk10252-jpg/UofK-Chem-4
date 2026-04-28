import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';

interface QuizQ { question: string; options: string[]; correct_answer: number; }

export default function CreateNewsScreen() {
  const router = useRouter();
  const [type, setType] = useState<'news' | 'poll' | 'quiz'>('news');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [quizQuestions, setQuizQuestions] = useState<QuizQ[]>([{ question: '', options: ['', '', '', ''], correct_answer: 0 }]);
  const [timeLimit, setTimeLimit] = useState('10');
  const [loading, setLoading] = useState(false);

  function addPollOption() { setPollOptions(prev => [...prev, '']); }
  function updatePollOption(i: number, v: string) { setPollOptions(prev => prev.map((o, idx) => idx === i ? v : o)); }
  function removePollOption(i: number) { if (pollOptions.length <= 2) return; setPollOptions(prev => prev.filter((_, idx) => idx !== i)); }

  function addQuestion() { setQuizQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], correct_answer: 0 }]); }
  function removeQuestion(i: number) { if (quizQuestions.length <= 1) return; setQuizQuestions(prev => prev.filter((_, idx) => idx !== i)); }
  function updateQuestion(i: number, field: string, value: any) {
    setQuizQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }
  function updateQuizOption(qi: number, oi: number, v: string) {
    setQuizQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, j) => j === oi ? v : o) } : q));
  }

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    if (type === 'poll') {
      const valid = pollOptions.filter(o => o.trim());
      if (valid.length < 2) { Alert.alert('Error', 'At least 2 poll options required'); return; }
    }
    if (type === 'quiz') {
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.question.trim()) { Alert.alert('Error', `Question ${i + 1} text is empty`); return; }
        const validOpts = q.options.filter(o => o.trim());
        if (validOpts.length < 2) { Alert.alert('Error', `Question ${i + 1} needs at least 2 options`); return; }
      }
    }
    setLoading(true);
    try {
      const body: any = { type, title: title.trim(), content: content.trim() };
      if (type === 'poll') body.poll_options = pollOptions.filter(o => o.trim());
      if (type === 'quiz') {
        body.quiz_questions = quizQuestions.map(q => ({ question: q.question.trim(), options: q.options.filter(o => o.trim()), correct_answer: q.correct_answer }));
        body.quiz_time_limit = parseInt(timeLimit) || 10;
      }
      await apiCall('/api/news/', { method: 'POST', body: JSON.stringify(body) });
      Alert.alert('Success', 'Posted successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.typeRow}>
          {(['news', 'poll', 'quiz'] as const).map(t => (
            <TouchableOpacity key={t} testID={`type-${t}-btn`} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
              <Ionicons name={t === 'news' ? 'megaphone' : t === 'poll' ? 'bar-chart' : 'help-circle'} size={16} color={type === t ? '#FFF' : Colors.textSecondary} />
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Title *</Text>
          <TextInput testID="news-title-input" style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title..." placeholderTextColor={Colors.textSecondary} />
          <Text style={styles.label}>Content</Text>
          <TextInput testID="news-content-input" style={[styles.input, styles.multiline]} value={content} onChangeText={setContent} placeholder="Write content..." multiline numberOfLines={3} placeholderTextColor={Colors.textSecondary} />

          {type === 'poll' && (
            <View>
              <Text style={styles.label}>Poll Options</Text>
              {pollOptions.map((opt, i) => (
                <View key={i} style={styles.optionRow}>
                  <TextInput testID={`poll-option-input-${i}`} style={[styles.input, { flex: 1 }]} value={opt} onChangeText={(v) => updatePollOption(i, v)} placeholder={`Option ${i + 1}`} placeholderTextColor={Colors.textSecondary} />
                  {pollOptions.length > 2 && <TouchableOpacity style={styles.removeOpt} onPress={() => removePollOption(i)}><Ionicons name="close-circle" size={22} color={Colors.error} /></TouchableOpacity>}
                </View>
              ))}
              <TouchableOpacity testID="add-poll-option-btn" style={styles.addOptBtn} onPress={addPollOption}><Ionicons name="add" size={18} color={Colors.accent} /><Text style={styles.addOptText}>Add Option</Text></TouchableOpacity>
            </View>
          )}

          {type === 'quiz' && (
            <View>
              <View style={styles.timeLimitRow}>
                <Text style={styles.label}>Time Limit (minutes)</Text>
                <TextInput testID="quiz-time-input" style={[styles.input, { width: 80, textAlign: 'center' }]} value={timeLimit} onChangeText={setTimeLimit} keyboardType="numeric" placeholderTextColor={Colors.textSecondary} />
              </View>
              {quizQuestions.map((q, qi) => (
                <View key={qi} style={styles.questionCard}>
                  <View style={styles.qHeader}>
                    <Text style={styles.qLabel}>Question {qi + 1}</Text>
                    {quizQuestions.length > 1 && <TouchableOpacity onPress={() => removeQuestion(qi)}><Ionicons name="trash-outline" size={18} color={Colors.error} /></TouchableOpacity>}
                  </View>
                  <TextInput testID={`quiz-q-${qi}`} style={styles.input} value={q.question} onChangeText={(v) => updateQuestion(qi, 'question', v)} placeholder="Enter question..." placeholderTextColor={Colors.textSecondary} />
                  {q.options.map((opt, oi) => (
                    <View key={oi} style={styles.quizOptRow}>
                      <TouchableOpacity testID={`quiz-correct-${qi}-${oi}`} style={[styles.radioBtn, q.correct_answer === oi && styles.radioBtnActive]} onPress={() => updateQuestion(qi, 'correct_answer', oi)}>
                        {q.correct_answer === oi && <View style={styles.radioInner} />}
                      </TouchableOpacity>
                      <TextInput testID={`quiz-opt-${qi}-${oi}`} style={[styles.input, { flex: 1 }]} value={opt} onChangeText={(v) => updateQuizOption(qi, oi, v)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} placeholderTextColor={Colors.textSecondary} />
                    </View>
                  ))}
                  <Text style={styles.correctHint}>Tap the circle to mark the correct answer</Text>
                </View>
              ))}
              <TouchableOpacity testID="add-question-btn" style={styles.addOptBtn} onPress={addQuestion}><Ionicons name="add" size={18} color={Colors.accent} /><Text style={styles.addOptText}>Add Question</Text></TouchableOpacity>
            </View>
          )}

          <TouchableOpacity testID="create-news-submit" style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="send" size={18} color="#FFF" /><Text style={styles.btnText}> {type === 'quiz' ? 'Create Quiz' : type === 'poll' ? 'Create Poll' : 'Post News'}</Text></>
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
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: Colors.border },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.textPrimary },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  removeOpt: { padding: 4 },
  addOptBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.accent, borderStyle: 'dashed', marginTop: 8 },
  addOptText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
  timeLimitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questionCard: { backgroundColor: Colors.background, borderRadius: 14, padding: 14, marginTop: 12 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  qLabel: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  quizOptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  radioBtn: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioBtnActive: { borderColor: Colors.success },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success },
  correctHint: { fontSize: 11, color: Colors.textSecondary, marginTop: 8, fontStyle: 'italic' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
