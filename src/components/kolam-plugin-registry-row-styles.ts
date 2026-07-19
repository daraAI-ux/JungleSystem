import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const pluginRegistryRowStyles = StyleSheet.create({
  pluginRow: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    backgroundColor: V.colors.bg,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  pluginIdentity: {
    flex: 1,
  },
  pluginTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  pluginPackage: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  pluginRoute: {
    marginTop: 4,
    color: V.colors.info,
    fontSize: 11,
    fontWeight: '800',
  },
  pluginCapabilities: {
    width: 360,
  },
  pluginCapabilityText: {
    color: V.colors.info,
    fontSize: 12,
    fontWeight: '800',
  },
  pluginRepo: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  pluginRepoRoute: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  pluginRepoText: {
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  pluginStatusBox: {
    width: 150,
    alignItems: 'flex-end',
  },
  pluginVersion: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 6,
  },
  pluginManifestVersion: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
    textAlign: 'right',
  },
});
