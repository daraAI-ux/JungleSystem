import React from 'react';
import {Image, ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import type {RuntimeDeviceIdentityStatus} from '../domain/runtime-identity';
import {KolamAuthPanel} from './kolam-auth-panel';

type AuthPanelProps = React.ComponentProps<typeof KolamAuthPanel>;
type SyncStatusProps = {
  loading: boolean;
  message: string;
};

const JUNGLE_SYSTEM_LOGO = require('../assets/brand/jungle-system-logo-color-transparent.png');

export function KolamLoginScreen({
  auth,
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
          <View style={styles.brandHeader}>
            <Image
              accessibilityLabel="Logo JungleSystem"
              resizeMode="contain"
              source={JUNGLE_SYSTEM_LOGO}
              style={styles.logo}
            />
          </View>
          <View style={styles.authCard}>
            <KolamAuthPanel {...auth} variant="login" />
          </View>
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
    maxWidth: 360,
    alignSelf: 'center',
    gap: 18,
    alignItems: 'center',
  },
  brandHeader: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 138,
    height: 62,
  },
  authCard: {
    width: '100%',
  },
});
