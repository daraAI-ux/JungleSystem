import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {AppModule} from '../domain/app-shell';
import {
  getAppLaunchCoverage,
  type AppLaunchArea,
  type AppLaunchModule,
} from '../domain/app-launch';
import type {CommandEntry} from '../domain/command-index';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamSearchField} from './kolam-search-field';
import {KolamSummaryCardList} from './kolam-summary-card-list';

export interface KolamAppLaunchSurfaceProps {
  onCommandSelect?: (command: CommandEntry) => void;
  onSelectModule?: (module: AppModule) => void;
}

const launchCoverage = getAppLaunchCoverage();
const ROUTE_ATLAS_PREVIEW_LIMIT = 16;
const ROUTE_ATLAS_SEARCH_LIMIT = 64;

export function KolamAppLaunchSurface({
  onCommandSelect,
  onSelectModule,
}: KolamAppLaunchSurfaceProps) {
  const [routeQuery, setRouteQuery] = useState('');

  return (
    <KolamModulePanel
      title="JungleSystem Launch Map"
      hint="Aplikasi digeser ke breadth-first: semua area utama bisa dibuka dulu, tampilan final menyusul setelah coverage udara penuh.">
      <KolamDescriptionList
        accessibilityLabel="JungleSystem launch coverage summary"
        rows={[
          {
            id: 'coverage',
            label: 'Coverage',
            value: `${launchCoverage.routeCount} route / ${launchCoverage.moduleCount} modul`,
            meta: 'Kolam, POS, AM, dan Plugin Hub diperlakukan sebagai satu aplikasi native.',
            tone: 'success',
          },
          {
            id: 'plugins',
            label: 'Plugin',
            value: `${launchCoverage.pluginReadyCount} ready / ${launchCoverage.pluginRouteCount} route`,
            meta: 'Registry plugin tetap dibaca sebagai host contract, bukan tombol per modul.',
            tone: 'default',
          },
          {
            id: 'backend',
            label: 'Backend',
            value: 'Server existing',
            meta: launchCoverage.serverRule,
            tone: 'success',
          },
        ]}
      />
      <KolamSearchField
        placeholder="Cari route Kolam, POS, AM, atau plugin"
        trailingLabel={`${launchCoverage.commandCount} command`}
        value={routeQuery}
        onChangeText={setRouteQuery}
      />
      <View style={styles.grid}>
        <KolamMappedList
          items={launchCoverage.areas}
          getKey={area => area.id}
          renderItem={area => (
            <LaunchAreaCard
              area={area}
              onCommandSelect={onCommandSelect}
              onSelectModule={onSelectModule}
              routeQuery={routeQuery}
            />
          )}
        />
      </View>
    </KolamModulePanel>
  );
}

function LaunchAreaCard({
  area,
  onCommandSelect,
  onSelectModule,
  routeQuery,
}: {
  area: AppLaunchArea;
  onCommandSelect?: (command: CommandEntry) => void;
  onSelectModule?: (module: AppModule) => void;
  routeQuery: string;
}) {
  const routeCommands = getVisibleRouteCommands(area.routeCommands, routeQuery);

  return (
    <KolamPanelFrame
      accessibilityLabel={`${area.label} launch area`}
      variant="surface"
      style={styles.card}>
      <KolamCopyStack
        items={[
          {id: 'label', text: area.label, style: styles.cardTitle},
          {
            id: 'summary',
            text: area.summary,
            style: styles.cardSummary,
          },
          {
            id: 'meta',
            text: `${area.routeCount} route - ${getStatusLabel(area.status)}`,
            style: styles.cardMeta,
          },
          {
            id: 'source',
            text: area.sourceRepo,
            style: styles.cardSource,
          },
        ]}
      />
      <View style={styles.moduleGrid}>
        <KolamMappedList
          items={area.modules}
          getKey={module => module.id}
          renderItem={module => (
            <LaunchModuleButton
              module={module}
              primary={module.id === area.moduleId}
              onSelectModule={onSelectModule}
            />
          )}
        />
      </View>
      <KolamCopyStack
        items={[
          {
            id: 'route-atlas',
            text: 'Route Atlas',
            style: styles.routeTitle,
          },
          {
            id: 'route-atlas-hint',
            text: `${routeCommands.length} dari ${area.routeCommands.length} route command bisa langsung dibuka.`,
            style: styles.cardMetaMuted,
          },
        ]}
      />
      <KolamDescriptionList
        accessibilityLabel={`${area.label} launch runway`}
        rows={area.runway}
      />
      <KolamCopyStack
        items={[
          {
            id: 'screen-packs',
            text: 'Screen Pack Prioritas',
            style: styles.routeTitle,
          },
          {
            id: 'screen-packs-hint',
            text: 'Route dikelompokkan berdasarkan intent agar screen native bisa dibangun batch.',
            style: styles.cardMetaMuted,
          },
        ]}
      />
      <KolamSummaryCardList
        accessibilityLabel={`${area.label} launch screen packs`}
        items={area.screenPacks.map(pack => ({
          id: pack.id,
          title: `${pack.label} (${pack.routeCount})`,
          meta: `${pack.nextBuildStep}: ${pack.routePreview}`,
          badges: [getScreenPackPriorityLabel(pack.priority)],
        }))}
        variant="compact"
      />
      <View style={styles.routeGrid}>
        <KolamMappedList
          items={routeCommands}
          getKey={command => command.id}
          renderItem={command => (
            <LaunchRouteButton
              command={command}
              onCommandSelect={onCommandSelect}
            />
          )}
        />
      </View>
    </KolamPanelFrame>
  );
}

function LaunchModuleButton({
  module,
  onSelectModule,
  primary,
}: {
  module: AppLaunchModule;
  onSelectModule?: (module: AppModule) => void;
  primary: boolean;
}) {
  return (
    <KolamButton
      accessibilityLabel={`Buka ${module.label} module`}
      intent={primary ? 'primary' : 'outline'}
      label={`${module.label} (${module.routeCount})`}
      onPress={() => onSelectModule?.(module.id)}
      size="sm"
      style={styles.moduleButton}
    />
  );
}

function LaunchRouteButton({
  command,
  onCommandSelect,
}: {
  command: CommandEntry;
  onCommandSelect?: (command: CommandEntry) => void;
}) {
  return (
    <KolamButton
      accessibilityLabel={`Buka ${command.label} route atlas`}
      intent="outline"
      label={getRouteButtonLabel(command)}
      onPress={() => {
        onCommandSelect?.(command);
      }}
      size="sm"
      style={styles.routeButton}
    />
  );
}

function getRouteButtonLabel(command: CommandEntry) {
  if (command.route) {
    return command.route;
  }

  return command.label;
}

function getVisibleRouteCommands(commands: CommandEntry[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return commands.slice(0, ROUTE_ATLAS_PREVIEW_LIMIT);
  }

  return commands
    .filter(command =>
      [
        command.area,
        command.kind,
        command.moduleId,
        command.label,
        command.description,
        command.route,
        command.source,
        command.pluginId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
    .slice(0, ROUTE_ATLAS_SEARCH_LIMIT);
}

function getStatusLabel(status: AppLaunchArea['status']) {
  switch (status) {
    case 'live-runtime':
      return 'runtime server';
    case 'contract-ready':
      return 'contract ready';
    case 'plugin-host':
      return 'plugin host';
    case 'native-scaffold':
    default:
      return 'native scaffold';
  }
}

function getScreenPackPriorityLabel(
  priority: AppLaunchArea['screenPacks'][number]['priority'],
) {
  switch (priority) {
    case 'build-next':
      return 'build next';
    case 'coverage-ready':
      return 'coverage ready';
    case 'later':
    default:
      return 'later';
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: 260,
    flexGrow: 1,
    gap: 12,
    padding: 14,
  },
  cardTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSummary: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 18,
  },
  cardMeta: {
    marginTop: 10,
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  cardSource: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleButton: {
    alignSelf: 'flex-start',
  },
  routeTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  cardMetaMuted: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeButton: {
    alignSelf: 'flex-start',
    maxWidth: 280,
  },
});
