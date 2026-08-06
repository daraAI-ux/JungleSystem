import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_DASHBOARD_BAHANBAKU_ICON_SVG} from '../assets/icons/dashboard-bahanbaku-icon-svg';

export function KolamDashboardRawMaterialCountIcon() {
  return (
    <View accessibilityLabel="Icon bahan baku" style={styles.root}>
      <SvgXml
        height="100%"
        style={styles.image}
        width="100%"
        xml={KOLAM_DASHBOARD_BAHANBAKU_ICON_SVG}
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
