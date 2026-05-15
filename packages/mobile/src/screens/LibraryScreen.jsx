import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Folder, 
  Plus, 
  MoreVertical,
  FileText
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useContracts } from '../context/ContractsContext';

const CATEGORIES = ['Tüm Dosyalar', 'Sözleşmeler', 'Taslaklar', 'Gizlilik (NDA)', 'İK & Personel'];

const FOLDER_TEMPLATES = [
  { id: '1', name: 'Ortaklık Anlaşmaları', color: '#3b82f6' },
  { id: '2', name: 'Satış Sözleşmeleri', color: '#10b981' },
  { id: '3', name: 'Gizlilik (NDA)', color: '#8b5cf6' },
  { id: '4', name: 'İK ve Personel', color: '#f59e0b' },
];

const FileCard = React.memo(({ file, onPress, onOptions }) => {
  const formattedDate = file.created_at ? new Date(file.created_at).toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih';
  const fileName = file.filename || file.title || 'İsimsiz_Belge.pdf';

  return (
    <TouchableOpacity 
      style={styles.fileCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.fileIconContainer}>
        <FileText color={theme.colors.primary} size={20} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
        <Text style={styles.fileMeta}>{formattedDate}</Text>
      </View>
      <TouchableOpacity 
        style={styles.fileAction}
        onPress={onOptions}
      >
        <MoreVertical color={theme.colors.text.secondary} size={20} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const LibraryScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('Tüm Dosyalar');
  const { contracts: files, loading, fetchContracts } = useContracts();

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [fetchContracts])
  );

  // Klasör sayılarını dosyalardan hesapla (immutable — obje mutasyonu yok)
  const folders = useMemo(() => {
    return FOLDER_TEMPLATES.map(folder => ({
      ...folder,
      count: folder.id === '1' ? files.length : 0,
    }));
  }, [files.length]);

  // Sekmelere tıklandığında dosyaları filtreleme algoritması
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      if (activeCategory === 'Tüm Dosyalar') return true;
      
      const fileName = (file.filename || file.title || '').toLowerCase();
      
      if (activeCategory === 'Sözleşmeler') {
        return fileName.includes('sözleşme') || fileName.includes('sozlesme') || fileName.includes('sart');
      }
      if (activeCategory === 'Taslaklar') {
        return fileName.includes('taslak') || fileName.includes('draft');
      }
      if (activeCategory === 'Gizlilik (NDA)') {
        return fileName.includes('gizlilik') || fileName.includes('nda') || fileName.includes('kvkk');
      }
      if (activeCategory === 'İK & Personel') {
        return fileName.includes('personel') || fileName.includes('ik') || fileName.includes('çalışan') || fileName.includes('calisan');
      }
      
      return true;
    });
  }, [files, activeCategory]);

  const handleFolderPress = useCallback((folderName) => {
    Alert.alert("Klasör", `${folderName} içeriği gösteriliyor... (Yakında)`);
  }, []);

  const handleFileOptions = useCallback(() => {
    Alert.alert("Dosya Seçenekleri", "Sil, Yeniden Adlandır veya İndir");
  }, []);

  const renderFileItem = useCallback(({ item }) => (
    <FileCard 
      file={item}
      onPress={() => navigation.navigate('Results', { contractId: item.id, initialTab: 'document' })}
      onOptions={handleFileOptions}
    />
  ), [navigation, handleFileOptions]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kütüphane</Text>
        <TouchableOpacity 
          style={styles.addIconButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Upload')}
        >
          <Plus color={theme.colors.surface} size={24} />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
        >
          {CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Folders Grid (statik, az eleman — ScrollView yeterli) */}
      <View style={styles.foldersWrapper}>
        <Text style={styles.sectionTitle}>Klasörler</Text>
        <View style={styles.gridContainer}>
          {folders.map((folder) => (
            <TouchableOpacity 
              key={folder.id} 
              style={styles.folderCard}
              activeOpacity={0.7}
              onPress={() => handleFolderPress(folder.name)}
            >
              <View style={styles.folderHeader}>
                <Folder color={folder.color} size={28} fill={folder.color + '20'} />
                <TouchableOpacity onPress={() => handleFolderPress(folder.name)}>
                  <MoreVertical color={theme.colors.text.secondary} size={18} />
                </TouchableOpacity>
              </View>
              <Text style={styles.folderName} numberOfLines={2}>{folder.name}</Text>
              <Text style={styles.folderCount}>{folder.count} Dosya</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Files — FlatList ile sanallaştırılmış liste */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Son Eklenenler</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredFiles}
          renderItem={renderFileItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
               <Text style={styles.emptyText}>Bu kategoride henüz belge bulunmuyor.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 56, // Daha ferah bir üst boşluk (Çentik/kamera kurtarma)
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  addIconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
  },
  categoriesSection: {
    marginBottom: theme.spacing.sm,
  },
  categoryTab: {
    paddingBottom: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  categoryTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  foldersWrapper: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  folderCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  folderName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  folderCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  recentHeader: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 12,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  fileAction: {
    padding: 8,
  }
});

export default LibraryScreen;
