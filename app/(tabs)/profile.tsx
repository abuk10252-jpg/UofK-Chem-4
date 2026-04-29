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
    const url = `${process.env.EXPO_PUBLIC_API_URL}/
