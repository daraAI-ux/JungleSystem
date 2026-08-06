import React from 'react';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_DASHBOARD_PRODUK_ICON_SVG} from '../assets/icons/dashboard-produk-icon-svg';

export function KolamDashboardProductCountIcon() {
  return (
    <View accessibilityLabel="Icon produk" style={{height: 46, width: 46}}>
      <SvgXml
        height="100%"
        width="100%"
        xml={KOLAM_DASHBOARD_PRODUK_ICON_SVG}
      />
    </View>
  );
}
