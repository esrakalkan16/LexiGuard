import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  CreditCard,
  X
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { supabase } from '../api/supabase';

const SettingsRow = ({ icon: Icon, title, value, showArrow = true, color = theme.colors.text.secondary, onPress }) => (
  <TouchableOpacity 
    style={styles.settingsRow} 
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.settingsRowLeft}>
      <View style={styles.settingsIconBg}>
        <Icon color={color} size={20} />
      </View>
      <Text style={styles.settingsTitle}>{title}</Text>
    </View>
    <View style={styles.settingsRowRight}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      {showArrow && <ChevronRight color={theme.colors.border} size={20} />}
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  
  // Modals State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  
  // Forms State
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Çıkış Yap", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return Alert.alert("Hata", "İsim boş bırakılamaz.");
    
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: newName }
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Profil güncellenemedi: " + error.message);
    } else {
      setUser(data.user);
      setEditModalVisible(false);
      Alert.alert("Başarılı", "Kişisel bilgileriniz başarıyla güncellendi.");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Şifre güncellenemedi: " + error.message);
    } else {
      setPasswordModalVisible(false);
      setNewPassword('');
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
    }
  };

  const userName = user?.user_metadata?.full_name || "Kullanıcı";
  const userEmail = user?.email || "ornek@sirket.com";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              setNewName(userName);
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Plan */}
        <Text style={styles.sectionTitle}>Abonelik</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow 
            icon={CreditCard} 
            title="Mevcut Plan" 
            color="#d97706" 
            onPress={() => Alert.alert("Plan Yönetimi", "Şu anda Premium planındasınız.")}
            value={
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            }
          />
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow 
            icon={User} 
            title="Kişisel Bilgiler" 
            onPress={() => {
              setNewName(userName);
              setEditModalVisible(true);
            }} 
          />
          <SettingsRow 
            icon={ShieldCheck} 
            title="Güvenlik & Şifre" 
            onPress={() => setPasswordModalVisible(true)} 
          />
          <SettingsRow 
            icon={Bell} 
            title="Bildirimler" 
            value="Açık" 
            onPress={() => Alert.alert("Bildirimler", "Anlık risk bildirimleri devrede.")}
          />
          <SettingsRow 
            icon={Settings} 
            title="Uygulama Dili" 
            value="Türkçe" 
            onPress={() => Alert.alert("Dil", "Şu an sadece Türkçe desteklenmektedir.")}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>Destek</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow 
            icon={HelpCircle} 
            title="Yardım Merkezi" 
            onPress={() => Alert.alert("Yardım", "Destek ekibi 7/24 hizmetinizdedir: destek@lexiguard.com")}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={theme.colors.risk.high} size={20} />
          <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>LexiGuard Mobile v1.0.0</Text>
      </ScrollView>

      {/* --- MODAL: Profili Düzenle --- */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kişisel Bilgiler</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color={theme.colors.text.secondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Adınızı girin"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>E-Posta (Değiştirilemez)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: '#f1f5f9', color: '#94a3b8' }]}
              value={userEmail}
              editable={false}
            />

            <TouchableOpacity 
              style={styles.modalSaveButton} 
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL: Şifre Değiştir --- */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şifreyi Değiştir</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X color={theme.colors.text.secondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="En az 6 karakter"
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.modalSaveButton, { backgroundColor: theme.colors.text.primary }]} 
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Şifreyi Güncelle</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 56, // Daha ferah bir üst boşluk
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingsGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 8,
    fontWeight: '500',
  },
  premiumBadge: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  premiumBadgeText: {
    color: '#d97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  logoutText: {
    color: theme.colors.risk.high,
    fontSize: 15,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: theme.colors.text.primary,
    marginBottom: 20,
  },
  modalSaveButton: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default ProfileScreen;
