import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamDaraTaxRoute,
  getKolamDaraTaxTab,
  getKolamFinanceTaxSurfaceMode,
  KOLAM_DARA_TAX_PERIOD_OPTIONS,
  KOLAM_DARA_TAX_TABS,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
  KOLAM_FINANCE_TAX_ROOT,
  resolveKolamDaraTaxAccess,
  type KolamDaraTaxPeriod,
  type KolamDaraTaxTabId,
} from '../domain/kolam-finance-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamFinanceTaxController} from '../hooks/use-kolam-finance-tax-controller';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

/** FE `DaraTaxDashboardPage` + `TaxIntelligenceDashboard` shell (Batch 0). */
export function KolamFinanceTaxSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const mode = getKolamFinanceTaxSurfaceMode(route);
  const controller = useKolamFinanceTaxController(route);
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraTaxAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });

  if (mode === 'dashboard') {
    if (!access.canSee) {
      return (
        <View style={styles.surface}>
          <KolamEmptyState title="Akses ditolak" message="tax" />
        </View>
      );
    }

    const selectedTab = getKolamDaraTaxTab(route);
    const selectedTabLabel =
      KOLAM_DARA_TAX_TABS.find(tab => tab.id === selectedTab)?.label ??
      'Ringkasan';

    return (
      <View style={styles.surface}>
        <View style={styles.toolbar}>
          <KolamDropdownSelect
            label="Periode"
            onChange={value =>
              controller.onSetPeriod(value as KolamDaraTaxPeriod)
            }
            options={KOLAM_DARA_TAX_PERIOD_OPTIONS.map(opt => ({
              label: opt.label,
              value: opt.id,
            }))}
            showLabelInTrigger={false}
            style={styles.periodSelect}
            value={controller.period}
          />
          <KolamButton
            disabled={controller.loading}
            label={controller.loading ? 'Memuat…' : 'Muat ulang'}
            onPress={() => {
              void controller.onRefresh();
            }}
            size="sm"
          />
        </View>

        {!controller.taxEnabled ? (
          <View style={styles.disabledBanner}>
            <Text style={styles.disabledBannerText}>
              DARA Tax nonaktif. Aktifkan di Settings → AI-Tools.
            </Text>
          </View>
        ) : null}

        {controller.error ? (
          <Text style={styles.warn}>{controller.error}</Text>
        ) : null}

        <View style={styles.tabBar}>
          <KolamSurfacePanelTabs
            onSelectTab={(tabId: KolamDaraTaxTabId) => {
              onRouteChange?.(buildKolamDaraTaxRoute(tabId));
            }}
            selectedTabId={selectedTab}
            tabs={KOLAM_DARA_TAX_TABS.map(tab => ({
              id: tab.id,
              label: tab.label,
            }))}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}>
          <View style={styles.stubCard}>
            <Text style={styles.stubTitle}>{selectedTabLabel}</Text>
          </View>
          {onRouteChange ? (
            <KolamButton
              intent="secondary"
              label="Profil pajak perusahaan"
              onPress={() => onRouteChange(KOLAM_FINANCE_TAX_PROFILE_ROUTE)}
              size="sm"
              style={styles.profileLink}
            />
          ) : null}
        </ScrollView>
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
    minHeight: 0,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodSelect: {
    minWidth: 160,
  },
  disabledBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledBannerText: {
    color: '#92400e',
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  warn: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  tabBar: {
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  stubCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  stubTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  profileLink: {
    alignSelf: 'flex-start',
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
