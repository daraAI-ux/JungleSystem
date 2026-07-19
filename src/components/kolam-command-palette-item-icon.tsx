import React, {type ReactNode} from 'react';
import {View} from 'react-native';
import {commandPaletteItemStyles as styles} from './kolam-command-palette-item-styles';

export function KolamCommandPaletteItemIcon({icon}: {icon: ReactNode}) {
  return <View style={styles.kindIcon}>{icon}</View>;
}
