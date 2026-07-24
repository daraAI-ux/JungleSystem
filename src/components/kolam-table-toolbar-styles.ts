import {StyleSheet} from 'react-native';

export const kolamTableToolbarStyles = StyleSheet.create({
  row: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 9200,
    elevation: 96,
  },
  searchInput: {
    width: 240,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 'auto',
  },
});
