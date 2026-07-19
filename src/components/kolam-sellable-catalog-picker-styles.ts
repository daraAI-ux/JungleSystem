import {StyleSheet} from 'react-native';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();

export const sellableCatalogPickerStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  segmented: {
    flexDirection: 'row',
    gap: KOLAM_CONTROL_TABS_VISUAL.tabListGap,
    marginBottom: 14,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  searchInput: {
    minHeight: V.control.inputHeight,
    marginBottom: 14,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    fontSize: V.control.fontSize,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
