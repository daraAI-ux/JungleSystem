import React from 'react';
import {StyleSheet} from 'react-native';
import {
  getCommandIndexStats,
  type CommandEntry,
} from '../domain/command-index';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getStatusPanelDescriptor} from '../domain/status-panel';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamInfoListRow} from './kolam-info-list-row';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSearchField} from './kolam-search-field';
import {KolamStatusPanelFrame} from './kolam-status-panel-frame';

export function KolamCommandIndexPanel({
  commands,
  coverageCommands = commands,
  totalCount,
  search,
  onSearchChange,
  onSelect,
}: {
  commands: CommandEntry[];
  coverageCommands?: CommandEntry[];
  totalCount: number;
  search: string;
  onSearchChange: (query: string) => void;
  onSelect: (command: CommandEntry) => void;
}) {
  const visibleCommands = commands.slice(0, 8);
  const stats = getCommandIndexStats(coverageCommands);
  const filteredStats = getCommandIndexStats(commands);
  const routeCoverage =
    stats.navigationRoutes +
    stats.moduleRoutes +
    stats.kolamSurfaces +
    stats.amRoutes +
    stats.pluginRoutes;

  return (
    <KolamStatusPanelFrame
      panel={getStatusPanelDescriptor('command-index')}
      meta={`${commands.length}/${totalCount} hasil - ${stats.modules} module - ${routeCoverage} route - ${stats.actions} action`}>
      <KolamDescriptionList
        accessibilityLabel="Command index coverage summary"
        rows={[
          {
            id: 'route-coverage',
            label: 'Native Route Coverage',
            value: `${routeCoverage} route`,
            meta: 'Kolam nav, POS/AM module route, Kolam/AM surface, dan plugin route bisa dibuka dari command index.',
            tone: 'success',
          },
          {
            id: 'command-groups',
            label: 'Command Groups',
            value: `${stats.modules} module / ${stats.actions} action / ${stats.pluginRoutes} plugin`,
            meta: 'Satu index untuk Kolam, POS, AM, runtime action, dan Plugin Hub.',
            tone: 'success',
          },
          {
            id: 'current-filter',
            label: 'Current Filter',
            value: `${commands.length}/${coverageCommands.length} hasil`,
            meta: `${filteredStats.navigationRoutes} nav / ${filteredStats.moduleRoutes} module-route / ${filteredStats.pluginRoutes} plugin route.`,
            tone: commands.length ? 'default' : 'warning',
          },
        ]}
      />
      <KolamSearchField
        value={search}
        onChangeText={onSearchChange}
        placeholder="cari module, route navigasi, action, route plugin"
        containerStyle={styles.commandSearchField}
        inputStyle={styles.commandInput}
      />
      <KolamListFrame variant="commandList">
        {visibleCommands.length ? (
          <KolamMappedList
            items={visibleCommands}
            getKey={command => command.id}
            renderItem={command => (
              <KolamInfoListRow
                description={command.description}
                metaDetail={command.source}
                metaLabel={command.kind}
                onPress={() => onSelect(command)}
                title={command.label}
              />
            )}
          />
        ) : (
          <KolamEmptyState
            title="Command tidak ditemukan"
            message="Coba cari nama module, route navigasi, action, route plugin, atau source contract."
            compact
          />
        )}
      </KolamListFrame>
    </KolamStatusPanelFrame>
  );
}

const styles = StyleSheet.create({
  commandSearchField: {
    marginBottom: 8,
  },
  commandInput: {
    fontSize: V.control.fontSize,
  },
});
