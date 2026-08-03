/**
 * Transaksi Copilot chrome — port of DA-Dara-Plugin `shipping-delivery.css`.
 * SoT: E:\Projects\DA-Dara-Plugin\src\components\shipping-copilot\shipping-delivery.css
 *
 * Local dark-tint tokens approximate CSS `color-mix(... black …)` on light Kolam
 * without changing global `kolam-visual` tokens.
 */
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

/** Soft elevated dark card (overlay 92% + black 8%). */
const CARD_BG = '#1c1f26';
const CARD_BORDER = '#2e3440';
/** Muted tray / pill (muted 78% + black 22%). */
const TRAY_BG = '#252a33';
const TRAY_BORDER = '#343b48';
const CHART_TRAY_BG = '#22262e';
const FG = '#f3f4f6';
const MUTED_FG = '#9ca3af';
const OK_BORDER = '#3d7a5a';
const BAD_BORDER = '#9f4a5a';
const RANGE_ACTIVE_BG = 'rgba(243, 244, 246, 0.1)';

export const transaksiCopilotColors = {
  cardBg: CARD_BG,
  cardBorder: CARD_BORDER,
  trayBg: TRAY_BG,
  trayBorder: TRAY_BORDER,
  chartTrayBg: CHART_TRAY_BG,
  fg: FG,
  mutedFg: MUTED_FG,
  okBorder: OK_BORDER,
  badBorder: BAD_BORDER,
  rangeActiveBg: RANGE_ACTIVE_BG,
};

export const transaksiCopilotStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  shell: {
    flexDirection: 'column',
    gap: 16,
  },
  shellHeader: {
    alignItems: 'flex-start',
    borderBottomColor: CARD_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  heading: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: 3,
  },
  desc: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 760,
  },
  shellActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  body: {
    flexDirection: 'column',
    gap: 16,
  },
  rangeTabs: {
    backgroundColor: TRAY_BG,
    borderColor: CARD_BORDER,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 3,
    padding: 4,
  },
  rangeBtn: {
    backgroundColor: 'transparent',
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  rangeBtnActive: {
    backgroundColor: RANGE_ACTIVE_BG,
  },
  rangeBtnText: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  rangeBtnTextActive: {
    color: FG,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  botStrip: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  botStripHead: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  botStripActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
    margin: 0,
  },
  sectionDesc: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    marginTop: 5,
  },
  notice: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  loadingText: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    padding: 8,
  },
  notifyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  notifyToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  notifyLabel: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 14,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  roomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  roomSelect: {
    flexBasis: 256,
    flexGrow: 1,
    maxWidth: 448,
    minWidth: 224,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  healthRow: {
    backgroundColor: TRAY_BG,
    borderColor: TRAY_BORDER,
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  healthOk: {
    borderColor: OK_BORDER,
  },
  healthBad: {
    borderColor: BAD_BORDER,
  },
  healthPlatform: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  healthState: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  warnText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 8,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 8,
  },
  botAvatar: {
    borderRadius: 999,
    flexShrink: 0,
    height: 56,
    width: 56,
  },
  botAvatarPh: {
    alignItems: 'center',
    backgroundColor: '#2a303a',
    borderRadius: 999,
    flexShrink: 0,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  botAvatarPhText: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  botUpload: {
    alignItems: 'center',
    backgroundColor: TRAY_BG,
    borderColor: CARD_BORDER,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  botUploadText: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  botNameField: {
    flexBasis: 192,
    flexGrow: 1,
    gap: 4,
    maxWidth: 320,
    minWidth: 160,
  },
  botNameLabel: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  botNameInput: {
    backgroundColor: TRAY_BG,
    borderColor: CARD_BORDER,
    borderRadius: 8,
    borderWidth: 1,
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: 146,
    minWidth: 260,
    overflow: 'hidden',
  },
  kpiTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  kpiLabel: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginBottom: 4,
  },
  kpiValue: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 22,
  },
  kpiTrend: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  kpiChart: {
    backgroundColor: CHART_TRAY_BG,
    borderRadius: 8,
    height: 42,
    marginBottom: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  breakdown: {
    borderTopColor: CARD_BORDER,
    borderTopWidth: 1,
    marginTop: 'auto',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  breakdownTitle: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginBottom: 10,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  breakdownItem: {
    alignItems: 'center',
    backgroundColor: TRAY_BG,
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  breakdownName: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  breakdownCount: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  channelLogo: {
    height: 28,
    marginBottom: 4,
    resizeMode: 'contain',
    width: 28,
  },
  meta: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  opsBlock: {
    gap: 8,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  opsCard: {
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 260,
    overflow: 'hidden',
  },
  opsCardTitle: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  opsPanel: {
    maxHeight: 256,
    padding: 8,
  },
  opsEmpty: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  opsItem: {
    backgroundColor: TRAY_BG,
    borderColor: TRAY_BORDER,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  opsTime: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  opsInvoice: {
    color: FG,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  opsDetail: {
    color: MUTED_FG,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
});
