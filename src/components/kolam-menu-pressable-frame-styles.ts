import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

export const menuPressableFrameStyles = StyleSheet.create({
  item: {
    minHeight: 32,
    justifyContent: 'center',
    marginLeft: 8,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: V.radius.md,
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
  },
  itemActive: {
    backgroundColor: V.colors.primarySoft,
    borderLeftColor: V.colors.primary,
  },
  itemHover: {
    backgroundColor: V.colors.secondary,
  },
  groupedItem: {
    minHeight: 30,
    marginLeft: 14,
    paddingLeft: 16,
  },
  sectionToggle: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
