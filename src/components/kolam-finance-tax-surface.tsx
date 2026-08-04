import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getKolamFinanceTaxSurfaceMode,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
  KOLAM_FINANCE_TAX_ROOT,
} from '../domain/kolam-finance-tax';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamFinanceTaxController } from '../hooks/use-kolam-finance-tax-controller';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';

export function KolamFinanceTaxSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const mode = getKolamFinanceTaxSurfaceMode(route);
  const controller = useKolamFinanceTaxController(route);

  if (mode === 'dashboard') {
    return (
      <View style={styles.surface}>
        <KolamCardFrame style={styles.card}>
          <Text style={styles.title}>DARA Pajak</Text>
          <Text style={styles.body}>
            Dashboard pelunasan dan e-Faktur tersedia di plugin DARA (Pusat AI /
            web).
          </Text>
          {onRouteChange ? (
            <KolamButton
              intent="primary"
              label="Profil pajak perusahaan"
              onPress={() => onRouteChange(KOLAM_FINANCE_TAX_PROFILE_ROUTE)}
              style={styles.button}
            />
          ) : null}
        </KolamCardFrame>
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      <View style={styles.headerRow}>
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_FINANCE_TAX_ROOT)}
            style={styles.backButton}
          />
        ) : null}
        <Text style={styles.title}>Profil pajak perusahaan</Text>
        <KolamButton
          intent="secondary"
          label={controller.loading ? 'Memuat…' : 'Muat ulang'}
          onPress={() => {
            void controller.onRefresh();
          }}
          style={styles.reloadButton}
        />
      </View>

      {controller.loading && !controller.profile ? (
        <KolamEmptyState compact title="Memuat…" />
      ) : null}

      {controller.profile ? (
        <KolamCardFrame style={styles.card}>
          <ProfileRow label="Nama" value={controller.profile.companyName} />
          <ProfileRow label="Nama legal" value={controller.profile.legalName} />
          <ProfileRow label="NPWP" value={controller.profile.npwp} />
          <ProfileRow label="NPWP16" value={controller.profile.npwp16} />
          <ProfileRow
            label="PKP"
            value={
              controller.profile.isPkp == null
                ? undefined
                : controller.profile.isPkp
                  ? 'Ya'
                  : 'Tidak'
            }
          />
          <ProfileRow
            label="Harga termasuk PPN"
            value={
              controller.profile.pricesIncludeTax == null
                ? undefined
                : controller.profile.pricesIncludeTax
                  ? 'Ya'
                  : 'Tidak'
            }
          />
          <ProfileRow
            label="Tarif PPN default"
            value={
              controller.profile.defaultPpnRate != null
                ? `${controller.profile.defaultPpnRate}%`
                : undefined
            }
          />
          <ProfileRow label="Kantor pajak" value={controller.profile.taxOffice} />
          <ProfileRow label="Catatan" value={controller.profile.notes} />
        </KolamCardFrame>
      ) : !controller.loading ? (
        <KolamEmptyState title="Profil belum diisi" />
      ) : null}
    </View>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value?.trim() || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    padding: 12,
  },
  banner: {
    alignSelf: 'stretch',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backButton: {
    minWidth: 88,
  },
  reloadButton: {
    minWidth: 96,
  },
  card: {
    gap: 8,
    padding: 12,
  },
  title: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 180,
  },
  profileRow: {
    gap: 2,
  },
  profileLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  profileValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
});
