import React from 'react';
import {View} from 'react-native';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {KolamPluginSummaryIcon} from './kolam-plugin-summary-icon';
import {pluginSummaryCardStyles as styles} from './kolam-plugin-summary-card-styles';
import {getPluginSummaryIconToneStyle} from './kolam-plugin-summary-tone-styles';

export function KolamPluginSummaryCardIcon({
  card,
}: {
  card: PluginSurfaceSummaryCard;
}) {
  return (
    <View
      style={[
        styles.pluginSummaryIcon,
        getPluginSummaryIconToneStyle(card.tone),
      ]}>
      <KolamPluginSummaryIcon kind={card.iconKind} tone={card.tone} />
    </View>
  );
}
