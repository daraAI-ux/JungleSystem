import React from 'react';
import {View} from 'react-native';
import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {KolamPluginSummaryCardHeader} from './kolam-plugin-summary-card-header';
import {KolamPluginSummaryCardLabel} from './kolam-plugin-summary-card-label';
import {pluginSummaryCardStyles as styles} from './kolam-plugin-summary-card-styles';
import {getPluginSummaryCardToneStyle} from './kolam-plugin-summary-tone-styles';

export function KolamPluginSummaryCard({
  card,
}: {
  card: PluginSurfaceSummaryCard;
}) {
  return (
    <View
      style={[
        styles.pluginSummaryCard,
        getPluginSummaryCardToneStyle(card.tone),
      ]}>
      <KolamPluginSummaryCardHeader card={card} />
      <KolamPluginSummaryCardLabel card={card} />
    </View>
  );
}
