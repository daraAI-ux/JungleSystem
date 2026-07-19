import React from 'react';
import {KolamSearchField} from './kolam-search-field';
import {pluginRegistryListStyles as styles} from './kolam-plugin-registry-list-styles';

export function KolamPluginRegistrySearch({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange?: (query: string) => void;
}) {
  return (
    <KolamSearchField
      value={search}
      onChangeText={onSearchChange}
      placeholder="cari plugin, route, package, capability"
      containerStyle={styles.pluginSearchField}
      inputStyle={styles.pluginSearchInput}
    />
  );
}
