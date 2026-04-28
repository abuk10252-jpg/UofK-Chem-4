import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';

export default function RegisterScreen() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      if (user.status === 'pending') router.replace('/pending');
      else if (user.status === 'approved') router.replace('/(tabs)/academic');
    }
  }, [user]);

  async function handleRegister() {
    if (!name || !email || !universityId || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const u = await register({ email, university_id: universityId, name, password });
      if (u.status === 'pending') router.replace('/pending');
      else router.replace('/(tabs)/academic');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}><Ionicons name="flask" size={40} color={Colors.accent} /></View>
          <Text style={styles.appName}>UofK Chem</Text>
          <Text style={styles.subtitle}>Create your account / إنشاء حساب</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Register / تسجيل</Text>
          {error ? (<View style={styles.errBox}><Ionicons name="alert-circle" size={16} color={Colors.error} /><Text style={styles.errText}>{error}</Text></View>) : null}
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="register-name-input" style={styles.input} placeholder="Full Name / الاسم الكامل" value={name} onChangeText={setName} placeholderTextColor={Colors.textSecondary} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="register-email-input" style={styles.input} placeholder="University Email / البريد الجامعي" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.textSecondary} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="card-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="register-uid-input" style={styles.input} placeholder="University ID / الرقم الجامعي" value={universityId} onChangeText={setUniversityId} placeholderTextColor={Colors.textSecondary} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="register-password-input" style={styles.input} placeholder="Password / كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={Colors.textSecondary} />
          </View>
          <TouchableOpacity testID="register-submit-button" style={[styles.btn, loading && {opacity:0.7}]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account / إنشاء حساب</Text>}
          </TouchableOpacity>
          <TouchableOpacity testID="go-to-login" style={styles.link} onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In / دخول</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: {width:0,height:8}, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  errBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16 },
  errText: { color: Colors.error, marginLeft: 8, fontSize: 14, flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, marginBottom: 14, height: 56, gap: 12 },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkBold: { color: Colors.accent, fontWeight: '700' },
});
