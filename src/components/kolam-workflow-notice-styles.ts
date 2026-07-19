import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const workflowNoticeStyles = StyleSheet.create({
  notice: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warningSoft,
    borderWidth: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 28,
    color: V.colors.warning,
    fontSize: V.control.badgeFontSize,
    fontWeight: '700',
  },
  done: {
    color: V.colors.success,
  },
  text: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
});
