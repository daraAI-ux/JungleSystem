import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import type {RuntimeDeviceIdentityStatus} from '../domain/runtime-identity';
import {KolamAuthPanel} from './kolam-auth-panel';
import {KolamJungleSystemLogo} from './kolam-jungle-system-logo';

type AuthPanelProps = React.ComponentProps<typeof KolamAuthPanel>;
type SyncStatusProps = {
  loading: boolean;
  message: string;
};

const LOGIN_BACKGROUND_SOURCE = require('../assets/images/background-junglesystem.jpg');

export function KolamLoginScreen({
  auth,
}: {
  auth: AuthPanelProps;
  deviceIdentityStatus: RuntimeDeviceIdentityStatus;
  syncStatus: SyncStatusProps;
}) {
  return (
    <View style={styles.screen} accessibilityLabel="JungleSystem login screen">
      <StatusBar barStyle="light-content" />
      <ImageBackground
        resizeMode="cover"
        source={LOGIN_BACKGROUND_SOURCE}
        style={styles.background}>
        <View style={styles.backgroundOverlay} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.layout}>
            <View style={styles.brandHeader}>
              <KolamJungleSystemLogo
                accessibilityLabel="Logo JungleSystem"
                style={styles.logo}
              />
            </View>
            <View style={styles.authCard}>
              <KolamAuthPanel {...auth} variant="login" />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f1f17',
  },
  background: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 10, 7, 0.34)',
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
