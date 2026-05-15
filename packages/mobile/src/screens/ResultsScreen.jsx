import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { 
  ArrowLeft, 
  Download, 
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme/theme';
import { useContracts } from '../context/ContractsContext';

const CircularProgress = ({ score, color }) => {
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Skor 0 ise tam dolu gibi görünmemesi için
  const strokeDashoffset = circumference - ((score || 1) / 100) * circumference;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke={theme.colors.border}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.gaugeTextContainer}>
        <Text style={[styles.gaugeScore, { color }]}>{score || 0}</Text>
      </View>
    </View>
  );
};

const ResultsScreen = ({ route, navigation }) => {
  const { contracts } = useContracts();
  const [filter, setFilter] = React.useState('ALL'); // ALL, high, medium, low
  
  // Eğer contractId geldiyse Context'ten bul, yoksa (misafir yüklemesi) doğrudan contractData'yı kullan
  const contractId = route.params?.contractId;
  const contract = useMemo(() => {
    if (contractId) {
      return contracts.find(c => c.id === contractId) || {};
    }
    return route.params?.contractData || {};
  }, [contractId, contracts, route.params?.contractData]);
  
  const score = contract.risk_score || 0;
  const fileName = contract.filename || contract.title || 'Belge Analizi';
  const riskColor = score >= 70 ? theme.colors.risk.high : score >= 35 ? theme.colors.risk.medium : theme.colors.risk.low;
  const riskLevel = score >= 70 ? 'Yüksek Risk' : score >= 35 ? 'Orta Risk' : 'Düşük Risk';

  // AI sonuçlarını (JSON) güvenli bir şekilde çekiyoruz
  const analysisResults = contract.analysis_results || {};
  const items = useMemo(() => 
    analysisResults.items || analysisResults.risk_items || analysisResults.predictions || [],
    [analysisResults]
  );

  // Özet İstatistikleri (memoized)
  const { highCount, mediumCount, lowCount } = useMemo(() => ({
    highCount: items.filter(i => i.risk_level?.toLowerCase() === 'high').length,
    mediumCount: items.filter(i => i.risk_level?.toLowerCase() === 'medium').length,
    lowCount: items.filter(i => i.risk_level?.toLowerCase() === 'low').length,
  }), [items]);

  // Kelime sayısı — ağır split işlemi sadece bir kez çalışır
  const wordCount = useMemo(() => {
    if (!contract.content_text) return 0;
    return contract.content_text.split(' ').length;
  }, [contract.content_text]);

  // Filtrelenmiş maddeler
  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return items;
    return items.filter(item => {
      const level = item.risk_level?.toLowerCase();
      if (filter === 'high') return level === 'high';
      if (filter === 'medium') return level === 'medium';
      if (filter === 'low') return level === 'low';
      return true;
    });
  }, [items, filter]);

  // Gösterilecek risk maddeleri (boşsa fallback göster)
  const displayItems = useMemo(() => filteredItems.length > 0 ? filteredItems : (filter === 'ALL' ? [
    { 
      category: 'Genel Değerlendirme', 
      risk_level: riskLevel.includes('Yüksek') ? 'high' : riskLevel.includes('Orta') ? 'medium' : 'low',
      description: 'Yapay zeka metin analizini tamamladı. Daha detaylı risk tespiti için tam metin taraması yapılmıştır.' 
    }
  ] : []), [filteredItems, filter, riskLevel]);

  const toggleFilter = (newFilter) => {
    setFilter(prev => prev === newFilter ? 'ALL' : newFilter);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs');
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Analiz Sonucu</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{fileName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => Alert.alert("Dışa Aktar", "PDF indirme özelliği bir sonraki güncelleme ile eklenecektir.")}
        >
          <Download color={theme.colors.primary} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        
        {/* Main Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <CircularProgress score={score} color={riskColor} />
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreLabel}>Risk Skoru</Text>
              <View style={[styles.badge, { backgroundColor: riskColor + '15' }]}>
                <Text style={[styles.badgeText, { color: riskColor }]}>{riskLevel}</Text>
              </View>
              {wordCount > 0 && (
                <Text style={styles.metaText}>
                  {wordCount} Kelime taranmıştır
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Mini Stats Bar */}
        <View style={styles.statsBar}>
          <TouchableOpacity 
            style={[styles.statItem, filter === 'high' && styles.statItemActive]}
            onPress={() => toggleFilter('high')}
          >
            <Text style={[styles.statNumber, { color: theme.colors.risk.high }]}>{highCount}</Text>
            <Text style={styles.statName}>Yüksek</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={[styles.statItem, filter === 'medium' && styles.statItemActive]}
            onPress={() => toggleFilter('medium')}
          >
            <Text style={[styles.statNumber, { color: theme.colors.risk.medium }]}>{mediumCount}</Text>
            <Text style={styles.statName}>Orta</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity 
            style={[styles.statItem, filter === 'low' && styles.statItemActive]}
            onPress={() => toggleFilter('low')}
          >
            <Text style={[styles.statNumber, { color: theme.colors.risk.low }]}>{lowCount}</Text>
            <Text style={styles.statName}>Düşük</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Items Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filter === 'ALL' ? 'Tespit Edilen Riskler' : `${filter === 'high' ? 'Yüksek' : filter === 'medium' ? 'Orta' : 'Düşük'} Riskli Maddeler`}
          </Text>
          {filter !== 'ALL' && (
            <TouchableOpacity onPress={() => setFilter('ALL')}>
              <Text style={styles.clearFilterText}>Hepsini Gör</Text>
            </TouchableOpacity>
          )}
        </View>

        {displayItems.length > 0 ? displayItems.map((item, index) => {
          // NLP servisinden gelen risk_level değerini esas alıyoruz
          const level = item.risk_level?.toLowerCase();
          const isHigh = level === 'high';
          const isMedium = level === 'medium';
          
          const itemColor = isHigh ? theme.colors.risk.high : isMedium ? theme.colors.risk.medium : theme.colors.risk.low;
          const itemLabel = isHigh ? 'YÜKSEK' : isMedium ? 'ORTA' : 'DÜŞÜK';
          const Icon = isHigh ? AlertTriangle : isMedium ? Info : CheckCircle;

          return (
            <View key={index} style={[styles.riskCard, { borderLeftColor: itemColor }]}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskCategory}>{item.category || 'Belge İncelemesi'}</Text>
                <View style={[styles.miniBadge, { backgroundColor: itemColor + '15' }]}>
                  <Icon color={itemColor} size={10} />
                  <Text style={[styles.miniBadgeText, { color: itemColor }]}>{itemLabel}</Text>
                </View>
              </View>
              <Text style={styles.riskDescription}>
                {item.description || item.summary || item.text || 'Bu maddede potansiyel bir yasal durum tespit edilmiştir.'}
              </Text>
            </View>
          )
        }) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Bu kategoride madde bulunamadı.</Text>
          </View>
        )}

      </ScrollView>
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  scoreCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: theme.spacing.xl,
  },
  gaugeTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeScore: {
    fontSize: 24,
    fontWeight: '900',
  },
  scoreDetails: {
    flex: 1,
    alignItems: 'flex-start',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  statItemActive: {
    backgroundColor: theme.colors.border + '30',
  },
  divider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: theme.colors.border,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  statName: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  clearFilterText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  riskCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.card,
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: theme.colors.border,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskCategory: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  miniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  riskDescription: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  }
});

export default ResultsScreen;
