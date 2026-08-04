import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const JUNGLE_SYSTEM_LOGO = require('../assets/brand/jungle-system-logo-color-transparent.png');

const maintenanceCards = [
  {
    icon: '✓',
    title: 'Sistem Aman',
    message: 'Data akun, pesanan, dan transaksi Anda tetap aman.',
  },
  {
    icon: '↻',
    title: 'Sedang Ditingkatkan',
    message: 'Kami meningkatkan performa dan stabilitas website.',
  },
  {
    icon: '…',
    title: 'Segera Kembali',
    message: 'Terima kasih atas kesabaran dan kepercayaan Anda.',
  },
];

export function KolamMaintenanceLockScreen() {
  return (
    <View style={styles.screen} accessibilityLabel="JungleSystem maintenance">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.layout}>
          <Image
            accessibilityLabel="Logo JungleSystem"
            resizeMode="contain"
            source={JUNGLE_SYSTEM_LOGO}
            style={styles.logo}
          />

          <View style={styles.hero}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>
                Maintenance sedang berlangsung
              </Text>
            </View>

            <Text style={styles.title}>Website sedang diperbarui</Text>
            <View style={styles.accent} />

            <Text style={styles.description}>
              Kami sedang melakukan peningkatan sistem agar pengalaman belanja,
              eksplorasi species, dan layanan Dunia Anura menjadi lebih baik.
              Silakan kembali dalam beberapa saat.
            </Text>

            <View style={styles.cardGrid}>
              {maintenanceCards.map(card => (
                <View key={card.title} style={styles.card}>
                  <View style={styles.cardIconWrap}>
                    <Text style={styles.cardIcon}>{card.icon}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardMessage}>{card.message}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.footer}>
            © 2026 Dunia Anura. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7faf7',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  layout: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 22,
  },
  logo: {
    width: 152,
    height: 70,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 28,
    shadowColor: V.colors.fg,
    shadowOffset: {height: 1, width: 0},
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: V.colors.primarySoft,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: V.colors.primary,
  },
  badgeText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 38,
    marginTop: 18,
    textAlign: 'center',
  },
  accent: {
    width: 64,
    height: 3,
    borderRadius: 3,
    backgroundColor: V.colors.primary,
    marginTop: 12,
  },
  description: {
    maxWidth: 620,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 18,
    textAlign: 'center',
  },
  cardGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
  },
  card: {
    flexBasis: 220,
    flexGrow: 1,
    maxWidth: 250,
    minHeight: 150,
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: V.colors.primarySoft,
    marginBottom: 10,
  },
  cardIcon: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    textAlign: 'center',
  },
  cardMessage: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
  footer: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
});
