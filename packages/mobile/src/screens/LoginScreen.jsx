import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { supabase } from '../api/supabase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          
          {/* Header Section Matches Web */}
          <View style={styles.headerArea}>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>Hukuki zekaya erişmek için oturum açın.</Text>
          </View>

          {/* Error Message Matches Web */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formArea}>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-POSTA</Text>
              <View style={styles.inputWrapper}>
                <Mail color="#cbd5e1" size={20} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="isim@sirket.com"
                  placeholderTextColor="#cbd5e1"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>ŞİFRE</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotText}>UNUTTUM</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock color="#cbd5e1" size={20} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>GİRİŞ YAP</Text>
                  <ArrowRight color="#ffffff" size={16} />
                </>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Section */}
          <View style={styles.footerArea}>
            <Text style={styles.footerText}>
              Henüz hesabınız yok mu?{' '}
            </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Hemen Kayıt Olun</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.guestButton}
              onPress={() => navigation.navigate('MainTabs')}
            >
              <Text style={styles.guestButtonText}>KAYIT OLMADAN DEVAM ET</Text>
              <ArrowRight color="#64748b" size={16} />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Bembeyaz (Web ile aynı)
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32, // Web'deki rahatlık
    justifyContent: 'center',
  },
  headerArea: {
    marginBottom: 48,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0f172a', // text-slate-900
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b', // text-slate-500
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  errorContainer: {
    backgroundColor: '#fff1f2',
    borderColor: '#ffe4e6',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  formArea: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8', // text-slate-400
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 4,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    height: 60,
    backgroundColor: '#f8fafc', // bg-slate-50
    borderWidth: 1,
    borderColor: '#e2e8f0', // border-slate-200
    borderRadius: 16,
    paddingLeft: 48,
    paddingRight: 16,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    height: 60,
    backgroundColor: '#0f172a', // Kömür Siyahı (bg-slate-900)
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerArea: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9', // border-slate-100
    paddingTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  registerLink: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  guestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    height: 60,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
  },
  guestButtonText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});

export default LoginScreen;
