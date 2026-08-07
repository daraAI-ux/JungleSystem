import React from 'react';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_LUP_SEARCH_ICON_SVG} from '../assets/icons/lup-search-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {searchFieldStyles as styles} from './kolam-search-field-styles';

const LUP_SEARCH_ICON_XML = KOLAM_LUP_SEARCH_ICON_SVG.replace(
  /currentColor/g,
  V.colors.mutedFg,
);

export function KolamSearchFieldIcon() {
  return (
    <View style={styles.icon}>
      <SvgXml height="100%" width="100%" xml={LUP_SEARCH_ICON_XML} />
    </View>
  );
}
