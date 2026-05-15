import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Search, 
  SlidersHorizontal,
  FileText
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useContracts } from '../context/ContractsContext';

const FILTER_PILLS = ['Tümü', 'Yüksek Risk', 'Orta Risk', 'Düşük Risk'];

const AnalysisCard = React.memo(({ item, onPress }) => {
  const score = item.risk_score || 0;
  const riskColor = score >= 70 ? theme.colors.risk.high : score >= 35 ? theme.colors.risk.medium : theme.colors.risk.low;
  const riskLevel = score >= 70 ? 'Yüksek Risk' : score >= 35 ? 'Orta Risk' : 'Düşük Risk';
  const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor';
  const extension = item.filename ? item.filename.split('.').pop().toUpperCase() : 'BELGE';

  return (
    <TouchableOpacity 
      style={styles.analysisCard} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.analysisHeader}>
        <View style={styles.analysisTitleRow}>
          <FileText color={theme.colors.text.secondary} size={18} />
          <Text style={styles.analysisName} numberOfLines={1}>{item.filename || item.title || 'İsimsiz Sözleşme'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: riskColor + '15' }]}>
          <Text style={[styles.badgeText, { color: riskColor }]}>{riskLevel}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${score}%`, backgroundColor: riskColor }]} />
        <View style={styles.progressBg} />
      </View>

      <View style={styles.analysisFooter}>
        <Text style={styles.analysisMeta}>{formattedDate}</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{extension}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const AnalysesScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { contracts, loading, fetchContracts } = useContracts();

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [fetchContracts])
  );

  // useMemo ile filtreleme — sadece ilgili bağımlılıklar değiştiğinde çalışır
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const titleMatch = (contract.filename || contract.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      let riskMatch = true;
      const score = contract.risk_score || 0;
      if (activeFilter === 'Yüksek Risk') riskMatch = score >= 70;
      else if (activeFilter === 'Orta Risk') riskMatch = score >= 35 && score < 70;
      else if (activeFilter === 'Düşük Risk') riskMatch = score < 35;

      return titleMatch && riskMatch;
    });
  }, [contracts, searchQuery, activeFilter]);

  const renderItem = useCallback(({ item }) => (
    <AnalysisCard 
      item={item} 
      onPress={() => navigation.navigate('Results', { contractId: item.id })}
    />
  ), [navigation]);

  const keyExtractor = useCallback((item) => item.id, []);

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listCountText}>
        {loading ? 'Yükleniyor...' : `${filteredContracts.length} analiz bulundu`}
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
       <Text style={styles.emptyText}>Aradığınız kriterlerde sözleşme bulunamadı.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analizlerim</Text>
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => {
            setSearchQuery('');
            setActiveFilter('Tümü');
            Alert.alert("Filtreler", "Arama ve filtreler sıfırlandı.");
          }}
        >
          <SlidersHorizontal color={theme.colors.text.primary} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color={theme.colors.text.secondary} size={18} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Sözleşme ara..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <FlatList
          horizontal
          data={FILTER_PILLS}
          showsHorizontalScrollIndicator={false}
          style={styles.pillsContainer}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.lg }}
          keyExtractor={(item) => item}
          renderItem={({ item: pill }) => {
            const isActive = activeFilter === pill;
            return (
              <TouchableOpacity 
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(pill)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredContracts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  searchSection: {
    paddingBottom: theme.spacing.sm,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.text.primary,
    fontSize: 15,
  },
  pillsContainer: {
    flexGrow: 0,
    marginBottom: theme.spacing.sm,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  pillTextActive: {
    color: theme.colors.surface,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  listHeader: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  listCountText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 12,
  },
  analysisName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressContainer: {
    height: 4,
    width: '100%',
    position: 'relative',
    marginBottom: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 2,
    borderRadius: 2,
  },
  analysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisMeta: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  }
});

export default AnalysesScreen;
