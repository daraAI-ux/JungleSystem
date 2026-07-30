import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

/**
 * Canonical list toolbar chrome (AGENTS SoT).
 *
 * Composition:
 *   <View style={shell}>                 // kotak pembungkus (Stock Opname / Species)
 *     <View style={row}>
 *       <KolamFormTextField style={searchInput} />
 *       <View style={controls}>{filters + actions}</View>
 *     </View>
 *   </View>
 *
 * Search fills leftover width; controls stay right and hug their labels.
 */
export const kolamTableToolbarStyles = StyleSheet.create({
  shell: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'visible',
    padding: 4,
  },
  row: {
    alignItems: 'center',
    elevation: 96,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    minHeight: 40,
    overflow: 'visible',
    zIndex: 9200,
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
});
