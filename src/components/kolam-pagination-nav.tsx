import React from 'react';
import {View} from 'react-native';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamPaginationItem} from './kolam-pagination-item';
import {
  paginationFooterStyles as styles,
  SETTINGS_PAGINATION_VISUAL,
} from './kolam-pagination-footer-styles';
import type {KolamPaginationFooterProps} from './kolam-pagination-footer-types';

type KolamPaginationNavProps = Pick<
  KolamPaginationFooterProps,
  'onPageChange' | 'pagination'
>;

export function KolamPaginationNav({
  onPageChange,
  pagination,
}: KolamPaginationNavProps) {
  return (
    <View
      style={styles.nav}
      accessibilityLabel={SETTINGS_PAGINATION_VISUAL.ariaLabel}>
      <KolamPaginationItem
        disabled={!pagination.hasPrevious}
        onPress={() => onPageChange(pagination.page - 1)}
        direction="previous"
      />
      <KolamMappedList
        items={pagination.pages}
        getKey={page => page}
        renderItem={page => (
          <KolamPaginationItem
            label={page}
            selected={page === pagination.page}
            disabled={page === pagination.page}
            onPress={() => onPageChange(page)}
          />
        )}
      />
      <KolamPaginationItem
        disabled={!pagination.hasNext}
        onPress={() => onPageChange(pagination.page + 1)}
        direction="next"
      />
    </View>
  );
}
