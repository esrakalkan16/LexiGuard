import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  UploadCloud, 
  FileText,
  TrendingUp,
  Plus,
  Zap,
  ShieldCheck,
  Search,
  Camera,
  ClipboardType
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect } from 'react-native-svg';
import { theme } from '../theme/theme';
import { useContracts } from '../context/ContractsContext';

const DashboardScreen = ({ navigation }) => {
  const { contracts, loading, user, fetchContracts } = useContracts();

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [fetchContracts])
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Kullanıcı";
  const userInitials = userName.substring(0, 2).toUpperCase();

  const avgScore = useMemo(() => {
    if (contracts.length === 0) return 0;
    return Math.round(contracts.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / contracts.length);
  }, [contracts]);

  const recentContracts = useMemo(() => contracts.slice(0, 3), [contracts]);

  // Grafik verisi hazırlama (Son 7 analiz)
  const chartData = useMemo(() => {
    const baseData = contracts.slice(0, 7).reverse().map(c => c.risk_score || 0);
    // Eğer az veri varsa dummy veri ile doldur (grafik boş gözükmesin)
    while (baseData.length < 7) {
      baseData.unshift(Math.floor(Math.random() * 40) + 20);
    }
    return baseData;
  }, [contracts]);

  // SVG Grafiği çizim fonksiyonu
  const renderChart = () => {
    const width = 300;
    const height = 80;
    const barWidth = 24;
    const gap = (width - (barWidth * chartData.length)) / (chartData.length - 1);

    return (
      <View style={styles.chartWrapper}>
        <View style={styles.chartHeader}>
          <TrendingUp color={theme.colors.primary} size={16} />
          <Text style={styles.chartTitle}>Risk Trend Analizi</Text>
        </View>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {chartData.map((val, i) => {
            const barHeight = (val / 100) * height;
            return (
              <Rect
                key={i}
                x={i * (barWidth + gap)}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={i === chartData.length - 1 ? theme.colors.primary : '#e2e8f0'}
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{userInitials}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hoş Geldin,</Text>
            <Text style={styles.userNameText}>{userName} ✨</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Analizler')}
        >
          <Search color={theme.colors.text.secondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Grafik Bölümü */}
        {renderChart()}

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
            <Zap color="#fff" size={20} style={{ marginBottom: 12 }} />
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.6)' }]}>Toplam Analiz</Text>
            <Text style={[styles.statValue, { color: '#fff' }]}>{contracts.length}</Text>
          </View>
          <View style={styles.statCard}>
            <ShieldCheck color={avgScore > 60 ? theme.colors.risk.high : theme.colors.text.secondary} size={20} style={{ marginBottom: 12 }} />
            <Text style={styles.statLabel}>Genel Risk</Text>
            <Text style={[
              styles.statValue, 
              { color: avgScore > 70 ? theme.colors.risk.high : avgScore > 35 ? theme.colors.risk.medium : theme.colors.risk.low }
            ]}>%{avgScore}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Hızlı Aksiyonlar</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Upload')}>
            <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
              <UploadCloud color="#4F46E5" size={24} />
            </View>
            <Text style={styles.actionText}>Dosya Yükle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Upload')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF7ED' }]}>
              <ClipboardType color="#EA580C" size={24} />
            </View>
            <Text style={styles.actionText}>Yapıştır</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Analizler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Analizler')}>
            <Text style={styles.seeAll}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : recentContracts.length === 0 ? (
          <View style={styles.emptyState}>
             <Text style={styles.emptyText}>Henüz bir sözleşme yüklemediniz.</Text>
          </View>
        ) : (
          recentContracts.map((contract) => {
            const riskColor = contract.risk_score >= 70 ? theme.colors.risk.high : contract.risk_score >= 35 ? theme.colors.risk.medium : theme.colors.risk.low;
            return (
              <TouchableOpacity 
                key={contract.id} 
                style={styles.analysisCard}
                onPress={() => navigation.navigate('Results', { contractId: contract.id })}
              >
                <View style={styles.analysisMain}>
                  <View style={[styles.fileIcon, { backgroundColor: riskColor + '10' }]}>
                    <FileText color={riskColor} size={20} />
                  </View>
                  <View style={styles.analysisInfo}>
                    <Text style={styles.analysisName} numberOfLines={1}>{contract.filename || 'İsimsiz Belge'}</Text>
                    <Text style={styles.analysisDate}>{new Date(contract.created_at).toLocaleDateString('tr-TR')}</Text>
                  </View>
                  <View style={styles.scoreBadge}>
                    <Text style={[styles.scoreText, { color: riskColor }]}>%{contract.risk_score}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 56, // Daha ferah bir üst boşluk (Çentik/kamera kurtarma)
    paddingBottom: 24,
    backgroundColor: theme.colors.background,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  avatarTextLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  chartWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.xl,
  },
  actionItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...theme.shadows.card,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  analysisCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  analysisMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisInfo: {
    flex: 1,
  },
  analysisName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  analysisDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  scoreBadge: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '900',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontWeight: '500',
  }
});

export default DashboardScreen;
