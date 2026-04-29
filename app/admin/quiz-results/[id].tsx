import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { apiCall } from '../../../src/utils/api';
import { Colors } from '../../../src/constants/colors';

export default function QuizResultsScreen() {
  const { id } = useLocalSearchParams();
  const [attempts, setAttempts] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      const data = await apiCall(`/admin/quiz/${id}/results`);
      setQuizTitle(data.quiz.title);
      setAttempts(data.attempts);
    } catch (e) {
      Alert.alert('Error', 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{quizTitle}</Text>
      <Text style={styles.subtitle}>Sorted by highest score</Text>

      <FlatList
        data={attempts}
        keyExtractor={(_, i) => i.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No attempts yet</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                Score: {item.score}/{item.total} — Time: {item.time_spent}s
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40 },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  rank: {
    width: 30,
    textAlign: 'center',
    fontWeight: '800',
    color: Colors.primary,
    fontSize: 16,
  },
  name: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary },
});
