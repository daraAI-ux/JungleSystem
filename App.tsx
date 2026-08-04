import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {KolamAppRoot} from './src/components/kolam-app-root';
import {KolamAppStateProvider} from './src/context/kolam-app-state-provider';
import {kolamVisualTokens as V} from './src/domain/kolam-visual';
import {bootstrapAuthTokenStore, isAuthTokenStoreBootstrapped} from './src/services/auth-token-bootstrap';

function App() {
  const [ready, setReady] = useState(isAuthTokenStoreBootstrapped());

  useEffect(() => {
    if (ready) {
      return;
    }

    let cancelled = false;

    void bootstrapAuthTokenStore()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={V.colors.primary} />
      </View>
    );
  }

  return (
    <KolamAppStateProvider>
      <KolamAppRoot />
    </KolamAppStateProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
