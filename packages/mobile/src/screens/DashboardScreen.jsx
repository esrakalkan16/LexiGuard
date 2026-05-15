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
  FileText
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { useContracts } from '../context/ContractsContext';

const DashboardScreen = ({ navigation }) => {
  const { contracts, loading, user, fetchContracts } = useContracts();

  // Ekrana her odaklandığında verileri yenile (arka planda, UI'ı dondurmadan)
  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [fetchContracts])
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Kullanıcı";
  const userInitials = userName.substring(0, 2).toUpperCase();

  // useMemo: contracts değişmediği sürece tekrar hesaplanmaz
  const avgScore = useMemo(() => {
    if (contracts.length === 0) return 0;
    return Math.round(contracts.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / contracts.length);
  }, [contracts]);

  const recentContracts = useMemo(() => contracts.slice(0, 5), [contracts]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {userName} 👋</Text>
          <Text style={styles.headerSub}>Sözleşmeleriniz güvende.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.avatar}
            onPress={() => navigation.navigate('Profil')}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Toplam Analiz</Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            ) : (
              <Text style={styles.statValue}>{contracts.length}</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ort. Risk</Text>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            ) : (
              <Text style={[
                styles.statValue, 
                { color: avgScore > 70 ? theme.colors.risk.high : avgScore > 30 ? theme.colors.risk.medium : theme.colors.risk.low }
              ]}>
                {avgScore}
                <Text style={styles.statValueSuffix}>/100</Text>
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.ctaCard} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Upload')}
        >
          <View style={styles.ctaIconContainer}>
            <UploadCloud color={theme.colors.primary} size={28} />
          </View>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>Yeni Analiz Başlat</Text>
            <Text style={styles.ctaSubtitle}>PDF, DOCX veya TXT yükle</Text>
          </View>
        </TouchableOpacity>

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
            const riskLevel = contract.risk_score >= 70 ? 'Yüksek Risk' : contract.risk_score >= 35 ? 'Orta Risk' : 'Düşük Risk';
            const riskColor = contract.risk_score >= 70 ? theme.colors.risk.high : contract.risk_score >= 35 ? theme.colors.risk.medium : theme.colors.risk.low;
            const formattedDate = contract.created_at ? new Date(contract.created_at).toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih';

            return (
              <TouchableOpacity 
                key={contract.id} 
                style={styles.analysisCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Results', { contractId: contract.id })}
              >
                <View style={styles.analysisHeader}>
                  <View style={styles.analysisTitleRow}>
                    <FileText color={theme.colors.text.secondary} size={18} />
                    <Text style={styles.analysisName} numberOfLines={1}>{contract.filename || contract.title || 'İsimsiz Sözleşme'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: riskColor + '15' }]}>
                    <Text style={[styles.badgeText, { color: riskColor }]}>{riskLevel}</Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${contract.risk_score || 0}%`, backgroundColor: riskColor }]} />
                  <View style={styles.progressBg} />
                </View>

                <View style={styles.analysisFooter}>
                  <Text style={styles.analysisMeta}>{formattedDate}</Text>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{contract.filename ? contract.filename.split('.').pop().toUpperCase() : 'BELGE'}</Text>
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
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
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
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.risk.high,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
  },
  statValueSuffix: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  ctaCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.surface,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.text.secondary,
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
    fontWeight: '600',
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
    fontWeight: '700',
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
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  }
});

export default DashboardScreen;
