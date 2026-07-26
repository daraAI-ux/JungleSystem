import React from 'react';
import {KolamFilterControl} from './kolam-filter-control';
import {KolamFilterRefreshButton} from './kolam-filter-refresh-button';
import {
  type KolamFilterBarControl,
  type KolamFilterBarProps,
} from './kolam-filter-bar-types';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export type {KolamFilterBarControl, KolamFilterBarProps};
export {KolamRefreshIcon} from './kolam-refresh-icon';

export function KolamFilterBar({
  accessibilityLabel,
  controls,
  values = {},
  onChange,
  onRefresh,
  refreshLabel = 'Refresh',
}: KolamFilterBarProps) {
  return (
    <KolamListFrame
      accessibilityLabel={accessibilityLabel}
      variant="filterBar">
      <KolamMappedList
        items={controls}
        getKey={control => control.id}
        renderItem={control => (
          <KolamFilterControl
            control={control}
            value={values[control.id] ?? ''}
            onChange={value => onChange?.(control.id, value)}
          />
        )}
      />
      <KolamFilterRefreshButton
        refreshLabel={refreshLabel}
        onRefresh={onRefresh}
      />
    </KolamListFrame>
  );
}
