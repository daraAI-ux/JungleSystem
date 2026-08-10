import React from 'react';
import {Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamStatsCardItem} from './kolam-stats-card-strip-types';
import {statsCardStripStyles as styles} from './kolam-stats-card-strip-styles';
import {getStatsCardValueToneStyle} from './kolam-stats-card-value-style';

export function KolamStatsCard({card}: {card: KolamStatsCardItem}) {
  if (card.iconSvg) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>{card.label}</Text>
          <View style={styles.iconWrap}>
            <SvgXml height="100%" width="100%" xml={card.iconSvg} />
          </View>
        </View>
        <Text style={[styles.value, getStatsCardValueToneStyle(card.tone)]}>
          {card.value}
        </Text>
        <Text style={styles.detail}>{card.detail}</Text>
      </View>
    );
  }

  return (
    <KolamCopyStack
      containerStyle={styles.card}
      items={[
        {id: 'label', text: card.label, style: styles.label},
        {
          id: 'value',
          text: card.value,
          style: [styles.value, getStatsCardValueToneStyle(card.tone)],
        },
        {id: 'detail', text: card.detail, style: styles.detail},
      ]}
    />
  );
}
