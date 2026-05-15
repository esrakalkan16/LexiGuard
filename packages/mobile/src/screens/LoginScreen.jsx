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
            <Text style={styles.title}>LexiGuard</Text>
            <Text style={styles.subtitle}>SÖZLEŞME ANALİZ PLATFORMU</Text>
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
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
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
              <Text style={styles.label}>ŞİFRE</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#cbd5e1"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotText}>Parolamı unuttum</Text>
              </TouchableOpacity>
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
              activeOpacity={0.7}
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
    paddingHorizontal: 36, // Daha fazla nefes alma payı
    justifyContent: 'center',
  },
  headerArea: {
    marginBottom: 56,
  },
  title: {
    fontSize: 54, // Daha büyük ve iddialı logo
    fontWeight: '900', // En kalın
    color: '#0f172a', 
    letterSpacing: -2, // Harfler daha iç içe, modern
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8', 
    fontWeight: '800', 
    letterSpacing: 2.5, // Genişletilmiş aralık
  },
  errorContainer: {
    backgroundColor: '#fff1f2',
    borderRadius: 20,
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
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8', 
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 6,
    marginBottom: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
    paddingRight: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  input: {
    height: 64, // Biraz daha yüksek
    backgroundColor: '#f1f5f9', // Soft filled background (border yok)
    borderRadius: 20, // Daha yuvarlak (squircle hissi)
    paddingLeft: 52,
    paddingRight: 20,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600', // Girilen metin daha tok dursun
  },
  loginButton: {
    height: 64, // Inputlarla aynı yükseklik
    backgroundColor: '#0f172a', // Kömür Siyahı
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerArea: {
    paddingTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  registerLink: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
  },
  guestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    height: 64,
    backgroundColor: '#f8fafc', // Çizgisiz, çok hafif gri-beyaz arka plan
    borderRadius: 20,
  },
  guestButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});

export default LoginScreen;
