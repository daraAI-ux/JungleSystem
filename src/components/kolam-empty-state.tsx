import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {getKolamEmptyStateVisualContract} from '../domain/kolam-empty-state';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KOLAM_EMPTY_STATE_KOSONG_ICON_SVG} from '../assets/icons/empty-state-kosong-icon-svg';

const KOLAM_EMPTY_STATE_VISUAL = getKolamEmptyStateVisualContract();

export interface KolamEmptyStateProps {
  compact?: boolean;
  message?: string;
  title: string;
  variant?: 'table' | 'dashboardRail';
}

export function KolamEmptyState({
  compact = false,
  message,
  title,
  variant = 'table',
}: KolamEmptyStateProps) {
  const isDashboardRail = variant === 'dashboardRail';

  return (
    <View
      style={[
        styles.emptyState,
        compact && styles.emptyStateCompact,
        isDashboardRail && styles.dashboardRailEmptyState,
      ]}>
      {!isDashboardRail ? (
        <View
          style={[
            styles.emptyStateIconRing,
            compact && styles.emptyStateIconRingCompact,
          ]}>
          <SvgXml
            height={
              compact
                ? KOLAM_EMPTY_STATE_VISUAL.compact.iconSize
                : KOLAM_EMPTY_STATE_VISUAL.full.iconSize
            }
            width={
              compact
                ? KOLAM_EMPTY_STATE_VISUAL.compact.iconSize
                : KOLAM_EMPTY_STATE_VISUAL.full.iconSize
            }
            xml={KOLAM_EMPTY_STATE_KOSONG_ICON_SVG}
          />
        </View>
      ) : null}
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: title,
            style: [
              styles.emptyStateTitle,
              isDashboardRail && styles.dashboardRailEmptyTitle,
            ],
          },
          ...(!isDashboardRail && message
            ? [{id: 'message', text: message, style: styles.emptyStateMessage}]
            : []),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    width: '100%',
    minHeight: KOLAM_EMPTY_STATE_VISUAL.full.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: V.layout.cardSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  dashboardRailEmptyState: {
    minHeight: 0,
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  emptyStateCompact: {
    minHeight: KOLAM_EMPTY_STATE_VISUAL.compact.minHeight,
    padding: V.layout.cardCompactSpacing,
  },
  emptyStateIconRing: {
    width: KOLAM_EMPTY_STATE_VISUAL.full.iconRingSize,
    height: KOLAM_EMPTY_STATE_VISUAL.full.iconRingSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: KOLAM_EMPTY_STATE_VISUAL.full.iconRingSize / 2,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  emptyStateIconRingCompact: {
    width: KOLAM_EMPTY_STATE_VISUAL.compact.iconRingSize,
    height: KOLAM_EMPTY_STATE_VISUAL.compact.iconRingSize,
    borderRadius: KOLAM_EMPTY_STATE_VISUAL.compact.iconRingSize / 2,
  },
  emptyStateTitle: {
    marginTop: 12,
    color: V.colors.fg,
    fontSize: KOLAM_EMPTY_STATE_VISUAL.copy.titleSize,
    fontWeight: '900',
    textAlign: 'center',
  },
  dashboardRailEmptyTitle: {
    marginTop: 0,
    color: V.colors[KOLAM_EMPTY_STATE_VISUAL.dashboardRail.titleTone],
    fontSize: KOLAM_EMPTY_STATE_VISUAL.dashboardRail.titleFontSize,
    fontWeight:
      KOLAM_EMPTY_STATE_VISUAL.dashboardRail.titleFontWeight === 'regular'
        ? '400'
        : '700',
  },
  emptyStateMessage: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: KOLAM_EMPTY_STATE_VISUAL.copy.messageSize,
    lineHeight: KOLAM_EMPTY_STATE_VISUAL.copy.messageLineHeight,
    textAlign: 'center',
  },
});
