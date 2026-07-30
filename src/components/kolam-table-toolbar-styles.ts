import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

/**
 * Canonical list toolbar chrome (AGENTS SoT).
 *
 * Composition (Stock Opname / Species FE):
 *   <View style={shell}>
 *     <View style={row}>
 *       <View style={filters}>
 *         <KolamFormTextField style={searchInput} />
 *         {filter triggers}
 *       </View>
 *       <View style={actions}>{action buttons}</View>
 *     </View>
 *   </View>
 *
 * Search fills leftover width inside filters so filter triggers sit flush
 * before the actions divider (right side of the filters zone). Do not cap
 * search with maxWidth — that parks filters on the left with a hollow gap.
 * Actions stay right behind a divider.
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
    gap: 6,
    justifyContent: 'space-between',
    minHeight: 40,
    overflow: 'visible',
    zIndex: 9200,
  },
  filters: {
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    minWidth: 0,
    overflow: 'visible',
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
  },
  /** @deprecated Prefer `filters` + `actions` with border divider. */
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
  actions: {
    alignItems: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
});
