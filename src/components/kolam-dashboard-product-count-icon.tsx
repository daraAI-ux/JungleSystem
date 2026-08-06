import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

const DASHBOARD_PRODUK_ICON = require('../assets/icons/dashboard-produk-icon.png');

export function KolamDashboardProductCountIcon() {
  return (
    <View accessibilityLabel="Icon produk" style={styles.root}>
      <Image
        resizeMode="contain"
        source={DASHBOARD_PRODUK_ICON}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
  root: {
    height: '100%',
    width: '100%',
  },
});
