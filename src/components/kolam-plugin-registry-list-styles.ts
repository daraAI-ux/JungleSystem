import {
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamTableVisualContract} from '../domain/kolam-table';

const KOLAM_TABLE_VISUAL = getKolamTableVisualContract();
const LIVE_CARD_SHADOW = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;
const LIVE_CARD_CHROME = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
  ...LIVE_CARD_SHADOW,
} satisfies ViewStyle;
const LIVE_TABLE_HEADER_TEXT = {
  color: V.colors.mutedFg,
  fontFamily: V.fontFamily,
  fontSize: KOLAM_TABLE_VISUAL.header.fontSize,
  lineHeight: KOLAM_TABLE_VISUAL.header.lineHeight,
  fontWeight:
    KOLAM_TABLE_VISUAL.header.fontWeight === 'medium' ? '500' : '700',
} satisfies TextStyle;

export const pluginRegistryListStyles = StyleSheet.create({
  pluginList: {
    gap: 0,
    overflow: 'hidden',
  },
  pluginTable: {
    overflow: 'hidden',
    ...LIVE_CARD_CHROME,
  },
  pluginSearchField: {
    marginBottom: 10,
  },
  pluginSearchInput: {
    fontSize: V.control.fontSize,
  },
  pluginHubSummary: {
    padding: V.layout.cardCompactSpacing,
    marginBottom: V.layout.cardCompactSpacing,
    ...LIVE_CARD_CHROME,
  },
  pluginHubSummaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  pluginHubSummaryMuted: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 16,
  },
  tableHeaderRow: {
    minHeight: KOLAM_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: KOLAM_TABLE_VISUAL.header.columnPaddingX,
    paddingVertical: KOLAM_TABLE_VISUAL.header.gutterY,
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  tableHeaderPrimary: {
    flex: 1,
    ...LIVE_TABLE_HEADER_TEXT,
  },
  tableHeaderMeta: {
    width: 360,
    ...LIVE_TABLE_HEADER_TEXT,
  },
  tableHeaderStatus: {
    width: 150,
    ...LIVE_TABLE_HEADER_TEXT,
    textAlign: 'right',
  },
});
