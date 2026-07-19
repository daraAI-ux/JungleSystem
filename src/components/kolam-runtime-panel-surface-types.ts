import React from 'react';
import type {AppModule} from '../domain/app-shell';
import type {AccessScope} from '../domain/auth';
import type {CommandEntry} from '../domain/command-index';
import type {RuntimeAction} from '../domain/runtime-actions';
import {KolamSyncStatusBar, KolamAuthPanel} from './kolam-shell-widgets';
import {
  KolamReadinessPanel,
  KolamRuntimeIdentityStrip,
} from './kolam-status-runtime-widgets';

export type KolamAuthPanelProps = React.ComponentProps<typeof KolamAuthPanel>;
export type KolamRuntimeIdentityProps = React.ComponentProps<
  typeof KolamRuntimeIdentityStrip
>;
export type KolamReadinessPanelProps = React.ComponentProps<
  typeof KolamReadinessPanel
>;
export type KolamSyncStatusProps = React.ComponentProps<
  typeof KolamSyncStatusBar
>;

export interface KolamRuntimeActionSurfaceProps {
  accessScope: AccessScope;
  moduleId: AppModule;
  onAction: (action: RuntimeAction) => void;
}

export interface KolamCommandIndexSurfaceProps {
  commands: CommandEntry[];
  coverageCommands?: CommandEntry[];
  onSearchChange: (query: string) => void;
  onSelect: (command: CommandEntry) => void;
  search: string;
  totalCount: number;
}

