import {StyleSheet} from 'react-native';
import {getKolamBadgeVisualContract} from '../domain/kolam-badge';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_BADGE_VISUAL = getKolamBadgeVisualContract();

export const statusBadgeStyles = StyleSheet.create({
  badge: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_BADGE_VISUAL.base.gapX,
    paddingHorizontal: KOLAM_BADGE_VISUAL.circle.paddingX,
    paddingVertical: KOLAM_BADGE_VISUAL.base.paddingY,
    borderRadius: V.control.badgeRadius,
  },
  text: {
    fontFamily: V.fontFamily,
    fontSize: KOLAM_BADGE_VISUAL.base.fontSize,
    lineHeight: KOLAM_BADGE_VISUAL.base.lineHeight,
    fontWeight:
      KOLAM_BADGE_VISUAL.base.fontWeight === 'medium' ? '500' : '700',
  },
  primary: {
    backgroundColor: V.colors.primarySoft,
  },
  secondary: {
    backgroundColor: V.colors.secondary,
  },
  success: {
    backgroundColor: V.colors.successSoft,
  },
  info: {
    backgroundColor: V.colors.infoSoft,
  },
  warning: {
    backgroundColor: V.colors.warningSoft,
  },
  danger: {
    backgroundColor: V.colors.warningSoft,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  textPrimary: {
    color: V.colors.primary,
  },
  textSecondary: {
    color: V.colors.mutedFg,
  },
  textSuccess: {
    color: V.colors.success,
  },
  textInfo: {
    color: V.colors.info,
  },
  textWarning: {
    color: V.colors.warning,
  },
  textDanger: {
    color: V.colors.danger,
  },
  textOutline: {
    color: V.colors.fg,
  },
});
