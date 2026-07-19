import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const settingsWebFormStyles = StyleSheet.create({
  settingsWebFormSections: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 16,
    gap: 16,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsWebFormHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  settingsWebFormTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  settingsWebFormDescription: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  settingsWebFormSection: {
    gap: 12,
  },
  settingsWebSeparator: {
    height: 1,
    backgroundColor: V.colors.border,
  },
  settingsWebFormSectionHeader: {
    gap: 3,
  },
  settingsWebFormSectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  settingsWebFormSectionDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  settingsWebFormFields: {
    gap: 10,
  },
  settingsWebFormFieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  settingsWebFormField: {
    minWidth: 210,
    flexGrow: 1,
    flexBasis: '45%',
    gap: 6,
  },
  settingsWebFormFieldTextarea: {
    flexBasis: '100%',
  },
  settingsWebFormFieldLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  settingsWebFormFieldValue: {
    minHeight: V.control.inputHeight,
    paddingHorizontal: V.control.inputPaddingX,
    paddingVertical: 9,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    color: V.colors.fg,
    backgroundColor: V.colors.bg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  settingsWebFormFieldValueTextarea: {
    minHeight: 68,
    lineHeight: 17,
  },
  settingsWebFormFieldHint: {
    flex: 1,
    minWidth: 0,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  settingsWebFormSwitchRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsWebLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsWebLogoPreview: {
    width: 80,
    height: 80,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
});
