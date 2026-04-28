import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';

export default function LoginScreen() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.status === 'pending') router.replace('/pending');
      else if (user.status === 'approved') router.replace('/(tabs)/academic');
    }
  }, [user]);

  async function handleLogin() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const u = await login(email, password);
      if (u.status === 'pending') router.replace('/pending');
      else if (u.status === 'rejected') setError('Your account has been rejected.');
      else router.replace('/(tabs)/academic');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="flask" size={48} color={Colors.accent} />
          </View>
          <Text style={styles.appName}>UofK Chem</Text>
          <Text style={styles.subtitle}>Chemical Engineering Platform</Text>
          <Text style={styles.subtitleAr}>منصة الهندسة الكيميائية</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In / تسجيل الدخول</Text>
          {error ? (
            <View style={styles.errBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="login-email-input" style={styles.input} placeholder="University Email / البريد الجامعي" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.textSecondary} />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <TextInput testID="login-password-input" style={[styles.input, {flex:1}]} placeholder="Password / كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry={!showPw} placeholderTextColor={Colors.textSecondary} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity testID="login-submit-button" style={[styles.btn, loading && {opacity:0.7}]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In / دخول</Text>}
          </TouchableOpacity>
          <TouchableOpacity testID="go-to-register" style={styles.link} onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register / إنشاء حساب</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  subtitleAr: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: {width:0,height:8}, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  errBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16 },
  errText: { color: Colors.error, marginLeft: 8, fontSize: 14, flex: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, height: 56, gap: 12 },
  input: { flex: 1, fontSize: 16, color: Colors.textPrimary },
  btn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: Colors.textSecondary },
  linkBold: { color: Colors.accent, fontWeight: '700' },
});
