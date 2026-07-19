import React from 'react';
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {appConfig} from '../config/app';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {RuntimeDeviceIdentityStatus} from '../domain/runtime-identity';
import {KolamAuthPanel} from './kolam-auth-panel';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamSyncStatusBar} from './kolam-sync-status-bar';

type AuthPanelProps = React.ComponentProps<typeof KolamAuthPanel>;
type SyncStatusProps = React.ComponentProps<typeof KolamSyncStatusBar>;

export function KolamLoginScreen({
  auth,
  deviceIdentityStatus,
  syncStatus,
}: {
  auth: AuthPanelProps;
  deviceIdentityStatus: RuntimeDeviceIdentityStatus;
  syncStatus: SyncStatusProps;
}) {
  return (
    <View style={styles.screen} accessibilityLabel="JungleSystem login screen">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.layout}>
          <KolamPanelFrame variant="surface" style={styles.brandPanel}>
            <KolamCopyStack
              items={[
                {id: 'eyebrow', text: 'Dunia Anura Desktop', style: styles.eyebrow},
                {id: 'title', text: 'JungleSystem', style: styles.title},
                {
                  id: 'subtitle',
                  text: 'Login ke server existing untuk membuka Kolam, POS, Automation Management, dan Plugin Hub.',
                  style: styles.subtitle,
                },
              ]}
            />
            <KolamDescriptionList
              accessibilityLabel="JungleSystem login runtime contract"
              rows={[
                {
                  id: 'server',
                  label: 'Backend',
                  value: appConfig.apiBaseUrl,
                  meta: 'Runtime login memakai BE produksi/server berjalan, bukan backend lokal.',
                  tone: 'success',
                },
                {
                  id: 'client',
                  label: 'Native Client',
                  value: appConfig.nativeClientId,
                  meta: `${appConfig.nativeOrigin} / ${appConfig.nativeUserAgent}`,
                  tone: 'success',
                },
                {
                  id: 'source',
                  label: 'Source Login',
                  value: auth.authSource,
                  meta: auth.authSourceHint,
                  tone: 'default',
                },
                {
                  id: 'device-signature',
                  label: 'Device Signature',
                  ...getDeviceSignatureRow(deviceIdentityStatus),
                },
              ]}
            />
            <KolamSyncStatusBar {...syncStatus} />
          </KolamPanelFrame>
          <View style={styles.authColumn}>
            <KolamAuthPanel {...auth} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getDeviceSignatureRow(status: RuntimeDeviceIdentityStatus) {
  if (status === 'signed') {
    return {
      value: 'MAC signed',
      meta: 'x-device-mac + x-device-mac-signature siap untuk server.',
      tone: 'success' as const,
    };
  }

  if (status === 'mac-only') {
    return {
      value: 'MAC attached',
      meta: 'MAC terbaca; signature wajib tersedia dari Windows runtime untuk direct BE.',
      tone: 'warning' as const,
    };
  }

  return {
    value: 'Pending native MAC',
    meta: 'Native bridge belum membaca MAC/signature dari Windows runtime.',
    tone: 'warning' as const,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: V.colors.muted,
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
    maxWidth: 1040,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'stretch',
  },
  brandPanel: {
    flexGrow: 1,
    flexBasis: 380,
    gap: 16,
    padding: 20,
  },
  authColumn: {
    flexGrow: 1,
    flexBasis: 360,
  },
  eyebrow: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    color: V.colors.fg,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: V.colors.mutedFg,
    fontSize: 14,
    lineHeight: 20,
  },
});

