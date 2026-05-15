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
  ArrowRight,
  UploadCloud, 
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

  const [loadingMessage, setLoadingMessage] = useState('Analiz başlatılıyor...');

  const handleSimulateUpload = async () => {
    if (uploading) return;

    setTimeout(async () => {
      try {
        const res = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.plainText],
        }).catch(e => {
          if (DocumentPicker.isCancel(e)) return null;
          throw e;
        });

        if (!res) return;

        setUploading(true);
        setLoadingMessage('Dosya yükleniyor...');
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const formData = new FormData();
        formData.append('file', {
          uri: res.uri,
          type: res.type,
          name: res.name,
        });

        setLoadingMessage('Yapay zeka analiz ediyor...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('http://10.0.2.2:3000/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        const data = await response.json();
        setUploading(false);

        if (response.ok) {
          setLoadingMessage('Sonuçlar hazır!');
          if (data.db_record) {
            addContract(data.db_record);
          }
          navigation.replace('Results', { 
            contractId: data.db_record?.id,
            contractData: data.db_record ? null : data 
          });
        } else {
          Alert.alert("Analiz Hatası", data.error || "Bir hata oluştu.");
        }
      } catch (err) {
        setUploading(false);
        console.error(err);
        if (err.name === 'AbortError') {
          Alert.alert("Zaman Aşımı", "Sunucu çok geç yanıt verdi. Lütfen tekrar deneyin.");
        } else {
          Alert.alert("Hata", "Dosya seçilirken veya yüklenirken bir sorun oluştu.");
        }
      }
    }, 100);
  };

  const handleAnalyzeText = async () => {
    if (!contractText.trim()) {
      return Alert.alert("Uyarı", "Lütfen analiz edilecek sözleşme metnini yapıştırın.");
    }

    setLoading(true);
    setLoadingMessage('Metin taranıyor...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      setLoadingMessage('Hukuki riskler hesaplanıyor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('http://10.0.2.2:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: contractText }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      const data = await response.json();
      setLoading(false);
      
      if (response.ok) {
        setLoadingMessage('Analiz tamamlandı!');
        if (data.db_record) {
          addContract(data.db_record);
        }
        setPasteModalVisible(false);
        setContractText('');
        navigation.replace('Results', { 
          contractId: data.db_record?.id,
          contractData: data.db_record ? null : data 
        });
      } else {
        Alert.alert("Analiz Hatası", data.error || "Bir hata oluştu.");
      }
    } catch (error) {
      setLoading(false);
      if (error.name === 'AbortError') {
        Alert.alert("Zaman Aşımı", "Analiz süresi doldu. Lütfen metni kısaltıp tekrar deneyin.");
      } else {
        Alert.alert("Bağlantı Hatası", "Backend sunucusuna ulaşılamadı.");
      }
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
          <ArrowLeft color={theme.colors.text.primary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Login-style Title Section */}
        <View style={styles.titleArea}>
          <Text style={styles.titleText}>Yeni Analiz</Text>
          <Text style={styles.subtitleText}>Hukuki riskleri belirlemek için sözleşmenizi yükleyin.</Text>
        </View>

        {/* Modern Upload Zone */}
        <View style={styles.uploadSection}>
          <TouchableOpacity 
            style={styles.uploadZone} 
            activeOpacity={0.8}
            onPress={handleSimulateUpload}
          >
            <View style={styles.uploadIconContainer}>
              <UploadCloud color={theme.colors.primary} size={32} />
            </View>
            <Text style={styles.uploadTitle}>Sözleşme Yükle</Text>
            <Text style={styles.uploadSubtitle}>PDF, DOCX veya TXT dosyalarınızı seçin</Text>
            
            <View style={styles.uploadButton}>
              {uploading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.uploadButtonText}>{loadingMessage.toUpperCase()}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.uploadButtonText}>DOSYA SEÇ</Text>
                  <ArrowRight color="#fff" size={16} />
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>VEYA</Text>
          <View style={styles.divider} />
        </View>

        {/* Text Action Card (Login Style) */}
        <TouchableOpacity 
          style={styles.optionCard}
          onPress={() => setPasteModalVisible(true)}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#f8fafc' }]}>
            <ClipboardType color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>METİN YAPIŞTIR</Text>
            <Text style={styles.optionSubtitle}>Sözleşme metnini doğrudan buraya aktarın</Text>
          </View>
          <ArrowRight color="#cbd5e1" size={20} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <ShieldCheck color="#64748b" size={20} />
          <Text style={styles.infoText}>
            Yüklediğiniz belgeler uçtan uca şifrelenir ve analizden sonra sunucularımızdan tamamen silinir.
          </Text>
        </View>

      </ScrollView>

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
              <Text style={styles.modalTitle}>Metin Yapıştır</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setPasteModalVisible(false)}>
                <X color={theme.colors.text.secondary} size={20} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.analyzeButtonText}>{loadingMessage.toUpperCase()}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.analyzeButtonText}>ANALİZİ BAŞLAT</Text>
                  <ArrowRight color="#fff" size={16} />
                </>
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
    backgroundColor: '#ffffff', // Login ile aynı bembeyaz arka plan
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 56, // Daha ferah bir üst boşluk
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  titleArea: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: 32,
  },
  uploadZone: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 32,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 24,
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 24,
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#0f172a',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  }
});

export default UploadScreen;
