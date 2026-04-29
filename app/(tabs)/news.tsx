import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/constants/colors';
import { apiCall } from '../../src/utils/api';
import { t } from '../../src/utils/i18n';

const EMOJIS = [
  '👍','❤️','🔥','😍','👏','💡','📚','✅','🎯','💪',
  '🙏','😂','😮','🤔','💯','⭐','🎓','🧪','⚡','🌟',
  '👀','💎','🤩','😊','👎'
];

interface NewsItem {
  id: string;
  type: string;
  title: string;
  title_ar: string;
  content: string;
  content_ar: string;
  image: string;
  created_by_name: string;
  created_at: string;
  reactions: Record<string, number>;
  user_reactions: Record<string, string>;
  comments: any[];
  poll_options?: any[];
  poll_voters?: string[];
  quiz_questions?: any[];
  quiz_time_limit?: number;
  quiz_submissions?: any[];
  quiz_results_published?: boolean;
}

export default function NewsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const lang = user?.language || 'en';

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showEmojis, setShowEmojis] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [quizResultsModal, setQuizResultsModal] = useState<any>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const fetchNews = useCallback(async () => {
    try {
      const data = await apiCall('/api/news/');
      setNews(data.news);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  async function handleReact(newsId: string, emoji: string) {
    try {
      const data = await apiCall(`/api/news/${newsId}/react`, {
        method: 'POST',
        body: JSON.stringify({ reaction: emoji })
      });

      setNews(prev =>
        prev.map(n =>
          n.id === newsId
            ? { ...n, reactions: data.reactions, user_reactions: data.user_reactions }
            : n
        )
      );
    } catch (e) {
      console.log(e);
    }

    setShowEmojis('');
  }

  async function handleComment(newsId: string) {
    const text = commentText[newsId]?.trim();
    if (!text) return;

    try {
      const data = await apiCall(`/api/news/${newsId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });

      setNews(prev =>
        prev.map(n =>
          n.id === newsId
            ? { ...n, comments: [...n.comments, data.comment] }
            : n
        )
      );

      setCommentText(prev => ({ ...prev, [newsId]: '' }));
    } catch (e) {
      console.log(e);
    }
  }

  async function handleVote(newsId: string, optionId: string) {
    try {
      const data = await apiCall(`/api/news/${newsId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId })
      });

      setNews(prev =>
        prev.map(n =>
          n.id === newsId
            ? { ...n, poll_options: data.poll_options, poll_voters: data.poll_voters }
            : n
        )
      );
    } catch (e) {
      console.log(e);
    }
  }

  async function handleSubmitQuiz(newsId: string) {
    const answers = quizAnswers[newsId] || [];
    setSubmitting(newsId);

    try {
      const data = await apiCall(`/api/news/${newsId}/submit-quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });

      setNews(prev =>
        prev.map(n =>
          n.id === newsId
            ? { ...n, quiz_submissions: [...(n.quiz_submissions || []), data.submission] }
            : n
        )
      );

      Alert.alert(
        'Quiz Submitted',
        `Score: ${data.submission.score}% (${data.submission.correct_count}/${data.submission.total})`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting('');
    }
  }

  async function handleDeleteNews(newsId: string) {
    Alert.alert('Delete', 'Delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiCall(`/api/news/${newsId}`, { method: 'DELETE' });
            setNews(prev => prev.filter(n => n.id !== newsId));
          } catch (e) {
            console.log(e);
          }
        }
      }
    ]);
  }

  async function handleSaveEdit() {
    if (!editItem) return;

    try {
      const data = await apiCall(`/api/news/${editItem.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          title_ar: editTitle,
          content: editContent,
          content_ar: editContent
        })
      });

      setNews(prev =>
        prev.map(n =>
          n.id === editItem.id ? { ...n, ...data.news } : n
        )
      );

      setEditModal(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  async function handleViewQuizResults(newsId: string) {
    try {
      const data = await apiCall(`/api/news/${newsId}/quiz-results`);
      setQuizResultsModal(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function handlePublishResults(newsId: string) {
    try {
      const data = await apiCall(`/api/news/${newsId}/publish-results`, {
        method: 'POST'
      });

      setNews(prev =>
        prev.map(n =>
          n.id === newsId
            ? { ...n, quiz_results_published: data.published }
            : n
        )
      );

      Alert.alert(
        'Success',
        data.published ? 'Results published' : 'Results hidden'
      );
    } catch (e) {
      console.log(e);
    }
  }

function renderReactions(item: NewsItem) {
    const myReaction = item.user_reactions?.[user?.id || ''];
    const reactionEntries = Object.entries(item.reactions || {})
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);

    return (
      <View>
        <View style={styles.reactionsRow}>
          {reactionEntries.map(([emoji, count]) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.reactionChip,
                myReaction === emoji && styles.reactionActive
              ]}
              onPress={() => handleReact(item.id, emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
              <Text
                style={[
                  styles.reactionCount,
                  myReaction === emoji && { color: Colors.accent }
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            testID={`add-reaction-${item.id}`}
            style={styles.addReactionBtn}
            onPress={() =>
              setShowEmojis(showEmojis === item.id ? '' : item.id)
            }
          >
            <Ionicons name="add" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showEmojis === item.id && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.emojiPicker}
            contentContainerStyle={styles.emojiPickerContent}
          >
            {EMOJIS.map(e => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiBtn,
                  myReaction === e && styles.emojiBtnActive
                ]}
                onPress={() => handleReact(item.id, e)}
              >
                <Text style={styles.emojiBtnText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  function renderPoll(item: NewsItem) {
    if (!item.poll_options) return null;

    const hasVoted = item.poll_voters?.includes(user?.id || '');
    const totalVotes = item.poll_options.reduce(
      (s, o) => s + (o.votes || 0),
      0
    );

    return (
      <View style={styles.pollWrap}>
        {item.poll_options.map(opt => {
          const pct =
            totalVotes > 0
              ? Math.round((opt.votes / totalVotes) * 100)
              : 0;

          return (
            <TouchableOpacity
              key={opt.id}
              testID={`poll-option-${opt.id}`}
              style={styles.pollOption}
              onPress={() =>
                !hasVoted && handleVote(item.id, opt.id)
              }
              disabled={hasVoted}
              activeOpacity={hasVoted ? 1 : 0.7}
            >
              <View
                style={[styles.pollBar, { width: `${pct}%` }]}
              />
              <Text style={styles.pollText}>{opt.text}</Text>
              <Text style={styles.pollPct}>
                {hasVoted ? `${pct}%` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.pollTotal}>
          {totalVotes} {t('votes', lang)}
        </Text>
      </View>
    );
  }

  function renderQuiz(item: NewsItem) {
    if (!item.quiz_questions) return null;

    const mySubmission = item.quiz_submissions?.find(
      s => s.user_id === user?.id
    );

    if (mySubmission) {
      return (
        <View style={styles.quizResult}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.success}
          />
          <Text style={styles.quizScore}>
            Score: {mySubmission.score}% (
            {mySubmission.correct_count}/{mySubmission.total})
          </Text>
        </View>
      );
    }

    const answers = quizAnswers[item.id] || [];

    return (
      <View style={styles.quizWrap}>
        <View style={styles.quizHeader}>
          <Ionicons
            name="timer-outline"
            size={16}
            color={Colors.warning}
          />
          <Text style={styles.quizTime}>
            {' '}
            {item.quiz_time_limit} min
          </Text>
        </View>

        {item.quiz_questions.map((q, qi) => (
          <View key={q.id || qi} style={styles.questionWrap}>
            <Text style={styles.questionText}>
              Q{qi + 1}. {q.question}
            </Text>

            {q.options.map((opt: string, oi: number) => (
              <TouchableOpacity
                key={oi}
                testID={`quiz-${item.id}-q${qi}-o${oi}`}
                style={[
                  styles.optionBtn,
                  answers[qi] === oi && styles.optionSelected
                ]}
                onPress={() => {
                  const newA = [...answers];
                  newA[qi] = oi;
                  setQuizAnswers(prev => ({
                    ...prev,
                    [item.id]: newA
                  }));
                }}
              >
                <View
                  style={[
                    styles.optionRadio,
                    answers[qi] === oi &&
                      styles.optionRadioSelected
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    answers[qi] === oi && {
                      color: Colors.primary,
                      fontWeight: '600'
                    }
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          testID={`submit-quiz-${item.id}`}
          style={styles.submitQuizBtn}
          onPress={() => handleSubmitQuiz(item.id)}
          disabled={submitting === item.id}
        >
          {submitting === item.id ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitQuizText}>Submit Quiz</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  function renderNewsItem({ item }: { item: NewsItem }) {
    const title = lang === 'ar' ? item.title_ar : item.title;
    const content =
      lang === 'ar' ? item.content_ar : item.content;

    const typeIcon =
      item.type === 'poll'
        ? 'bar-chart'
        : item.type === 'quiz'
        ? 'help-circle'
        : 'megaphone';

    const typeColor =
      item.type === 'poll'
        ? '#8B5CF6'
        : item.type === 'quiz'
        ? Colors.warning
        : Colors.primary;

    return (
      <View style={styles.newsCard} testID={`news-card-${item.id}`}>
        <View style={styles.newsHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeColor + '15' }
            ]}
          >
            <Ionicons
              name={typeIcon as any}
              size={14}
              color={typeColor}
            />
            <Text
              style={[
                styles.typeText,
                { color: typeColor }
              ]}
            >
              {item.type.toUpperCase()}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.newsDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>

            {isAdmin && (
              <View style={styles.adminBtns}>
                <TouchableOpacity
                  testID={`edit-news-${item.id}`}
                  onPress={() => {
                    setEditItem(item);
                    setEditTitle(item.title);
                    setEditContent(item.content);
                    setEditModal(true);
                  }}
                >
                  <Ionicons
                    name="pencil"
                    size={16}
                    color={Colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`delete-news-${item.id}`}
                  onPress={() => handleDeleteNews(item.id)}
                >
                  <Ionicons
                    name="trash"
                    size={16}
                    color={Colors.error}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.newsTitle}>{title}</Text>

        {content ? (
          <Text
            style={styles.newsContent}
            numberOfLines={4}
          >
            {content}
          </Text>
        ) : null}

        {item.type === 'poll' && renderPoll(item)}
        {item.type === 'quiz' && renderQuiz(item)}

        {isAdmin && item.type === 'quiz' && (
          <View style={styles.quizAdminRow}>
            <TouchableOpacity
              testID={`view-results-${item.id}`}
              style={styles.quizAdminBtn}
              onPress={() => handleViewQuizResults(item.id)}
            >
              <Ionicons
                name="stats-chart"
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.quizAdminText}>
                {' '}
                Results (
                {item.quiz_submissions?.length || 0})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID={`publish-results-${item.id}`}
              style={[
                styles.quizAdminBtn,
                {
                  backgroundColor: item.quiz_results_published
                    ? Colors.success + '15'
                    : Colors.warning + '15'
                }
              ]}
              onPress={() => handlePublishResults(item.id)}
            >
              <Text
                style={[
                  styles.quizAdminText,
                  {
                    color: item.quiz_results_published
                      ? Colors.success
                      : Colors.warning
                  }
                ]}
              >
                {item.quiz_results_published
                  ? 'Published'
                  : 'Publish'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {renderReactions(item)}

        <View style={styles.commentSection}>
          {item.comments
            .slice(-2)
            .map(c => (
              <View
                key={c.id}
                style={styles.commentItem}
              >
                <Text style={styles.commentName}>
                  {c.user_name}
                </Text>
                <Text style={styles.commentText}>
                  {c.text}
                </Text>
              </View>
            ))}

          {item.comments.length > 2 && (
            <Text style={styles.moreComments}>
              +{item.comments.length - 2} more
            </Text>
          )}

          <View style={styles.commentInput}>
            <TextInput
              testID={`comment-input-${item.id}`}
              style={styles.commentField}
              placeholder={t('writeComment', lang)}
              value={commentText[item.id] || ''}
              onChangeText={v =>
                setCommentText(prev => ({
                  ...prev,
                  [item.id]: v
                }))
              }
              placeholderTextColor={Colors.textSecondary}
            />

            <TouchableOpacity
              testID={`comment-send-${item.id}`}
              onPress={() => handleComment(item.id)}
              style={styles.sendBtn}
            >
              <Ionicons
                name="send"
                size={18}
                color={Colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );

  return (
    <View style={styles.container} testID="news-tab">
      <FlatList
        data={news}
        keyExtractor={item => item.id}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNews();
            }}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          isAdmin ? (
            <TouchableOpacity
              testID="create-news-btn"
              style={styles.createBtn}
              onPress={() => router.push('/admin/create-news' as any)}
            >
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.createBtnText}>
                {' '}
                {t('createNews', lang)}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No news yet</Text>
        }
      />

      {/* Edit Modal */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>

            <TextInput
              testID="edit-news-title"
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor={Colors.textSecondary}
            />

            <TextInput
              testID="edit-news-content"
              style={[styles.modalInput, { minHeight: 100 }]}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Content"
              multiline
              placeholderTextColor={Colors.textSecondary}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="save-edit-news"
                style={styles.saveBtn}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Quiz Results Modal */}
      <Modal
        visible={!!quizResultsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setQuizResultsModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quiz Results</Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {quizResultsModal?.results?.length === 0 && (
                <Text style={styles.emptyText}>No submissions yet</Text>
              )}

              {quizResultsModal?.results?.map(
                (r: any, i: number) => (
                  <View key={i} style={styles.resultRow}>
                    <Text style={styles.resultName}>
                      {r.user_name}
                    </Text>

                    <Text
                      style={[
                        styles.resultScore,
                        {
                          color:
                            r.score >= 50
                              ? Colors.success
                              : Colors.error
                        }
                      ]}
                    >
                      {r.score}% ({r.correct_count}/{r.total})
                    </Text>
                  </View>
                )
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => setQuizResultsModal(null)}
            >
              <Text style={styles.saveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
