import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

export const menuPressableFrameStyles = StyleSheet.create({
  item: {
    minHeight: 32,
    justifyContent: 'center',
    marginLeft: 8,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: V.radius.md,
    borderColor: 'transparent',
    borderWidth: 1,
  },
  itemActive: {
    backgroundColor: V.colors.primarySoft,
    borderColor: 'transparent',
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
