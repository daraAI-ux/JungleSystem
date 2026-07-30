import {StyleSheet} from 'react-native';

/**
 * Canonical list toolbar chrome (AGENTS SoT).
 *
 * Composition:
 *   <View style={row}>
 *     <KolamFormTextField style={searchInput} />
 *     <View style={controls}>{filters + actions}</View>
 *   </View>
 *
 * Search fills leftover width; controls stay right and hug their labels.
 */
export const kolamTableToolbarStyles = StyleSheet.create({
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
