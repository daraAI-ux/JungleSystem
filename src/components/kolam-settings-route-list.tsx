import React from 'react';
import type {SettingsSurfaceItem} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamInfoListRow} from './kolam-info-list-row';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamSettingsRouteList({
  activeSurfaceId,
  items,
  onSelectSurface,
}: {
  activeSurfaceId: SettingsSurfaceItem['id'];
  items: SettingsSurfaceItem[];
  onSelectSurface: (id: SettingsSurfaceItem['id']) => void;
}) {
  return (
    <KolamCardFrame variant="settingsRouteList">
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => (
          <KolamInfoListRow
            detail={item.route}
            description={item.description}
            metaDetail={item.status}
            metaLabel={item.badge}
            onPress={() => onSelectSurface(item.id)}
            selected={activeSurfaceId === item.id}
            title={item.title}
            variant="route"
          />
        )}
      />
    </KolamCardFrame>
  );
}