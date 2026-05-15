import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  ArrowLeft, 
  UploadCloud, 
  Camera, 
  ClipboardType, 
  ShieldCheck,
  X
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { supabase } from '../api/supabase';
import { useContracts } from '../context/ContractsContext';

import DocumentPicker from 'react-native-document-picker';

const UploadScreen = ({ navigation }) => {
  const { addContract } = useContracts();
  const [pasteModalVisible, setPasteModalVisible] = useState(false);
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSimulateUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
      });

      if (!res.uri) return;

      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append('file', {
        uri: res.uri,
        type: res.type,
        name: res.name,
      });

      const response = await fetch('http://10.0.2.2:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();
      setUploading(false);

      if (response.ok) {
        if (data.db_record) {
          addContract(data.db_record);
        }
        // Gelen veriyi Sonuç ekranına yolluyoruz (Sadece ID gönderiyoruz, performans için)
        navigation.replace('Results', { 
          contractId: data.db_record?.id,
          contractData: data.db_record ? null : data 
        });
      } else {
        Alert.alert("Analiz Hatası", data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      setUploading(false);
      if (DocumentPicker.isCancel(err)) {
        // Kullanıcı seçimi iptal etti
      } else {
        console.log("Picker Error:", err);
        Alert.alert("Hata", "Dosya seçilirken bir sorun oluştu.");
      }
    }
  };

  const handleAnalyzeText = async () => {
    if (!contractText.trim()) {
      return Alert.alert("Uyarı", "Lütfen analiz edilecek sözleşme metnini yapıştırın.");
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('http://10.0.2.2:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: contractText })
      });
      
      const data = await response.json();
      setLoading(false);
      
      if (response.ok) {
        if (data.db_record) {
          addContract(data.db_record);
        }
        setPasteModalVisible(false);
        setContractText('');
        // Gelen veriyi Sonuç ekranına yolluyoruz
        navigation.replace('Results', { 
          contractId: data.db_record?.id,
          contractData: data.db_record ? null : data 
        });
      } else {
        Alert.alert("Analiz Hatası", data.error || "Bir hata oluştu.");
      }
    } catch (error) {
      setLoading(false);
      console.log("Fetch Error:", error);
      Alert.alert("Bağlantı Hatası", "Backend sunucusuna (localhost:3000) ulaşılamadı. Sunucunun çalıştığından emin olun.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Analiz</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        
        {/* Main Upload Zone */}
        <TouchableOpacity 
          style={styles.uploadZone} 
          activeOpacity={0.8}
          onPress={handleSimulateUpload}
        >
          <View style={styles.uploadIconContainer}>
            <UploadCloud color={theme.colors.primary} size={36} />
          </View>
          <Text style={styles.uploadTitle}>Sözleşme Yükle</Text>
          <Text style={styles.uploadSubtitle}>Cihazınızdaki dosyaları buraya sürükleyin</Text>
          
          <View style={styles.uploadButton}>
            {uploading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={styles.uploadButtonText}>Dosya Seç</Text>
            )}
          </View>
          
          <Text style={styles.uploadHint}>25MB'a kadar PDF, DOCX, TXT</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Action Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard} onPress={handleSimulateUpload}>
            <View style={[styles.optionIconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Camera color="#16a34a" size={24} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Fotoğraf Çek</Text>
              <Text style={styles.optionSubtitle}>Belgenin fotoğrafını çekerek tara</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => setPasteModalVisible(true)}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: '#fffbeb' }]}>
              <ClipboardType color="#d97706" size={24} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Metin Yapıştır</Text>
              <Text style={styles.optionSubtitle}>Kopyaladığınız metni doğrudan yapıştırın</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Security Note Footer */}
      <View style={styles.securityFooter}>
        <ShieldCheck color={theme.colors.text.secondary} size={18} />
        <Text style={styles.securityText}>
          Belgeleriniz uçtan uca şifrelenir ve analizden sonra silinir.
        </Text>
      </View>

      {/* PASTE TEXT MODAL */}
      <Modal
        visible={pasteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasteModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sözleşme Metnini Yapıştır</Text>
              <TouchableOpacity onPress={() => setPasteModalVisible(false)}>
                <X color={theme.colors.text.secondary} size={24} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textArea}
              value={contractText}
              onChangeText={setContractText}
              placeholder="Sözleşme maddelerini buraya yapıştırın..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={styles.analyzeButton} 
              onPress={handleAnalyzeText}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>Yapay Zeka ile Analiz Et</Text>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  uploadZone: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  uploadButtonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  uploadHint: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  securityFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  securityText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
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
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  textArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    fontSize: 15,
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  analyzeButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  }
});

export default UploadScreen;
