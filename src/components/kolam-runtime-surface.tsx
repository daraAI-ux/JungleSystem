import React from 'react';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {
  KolamRuntimeActionsSurface,
  KolamRuntimeActivitySurface,
  KolamRuntimeAuthSurface,
  KolamRuntimeCommandIndexSurface,
  KolamRuntimeIdentitySurface,
  KolamRuntimeReadinessSurface,
  KolamRuntimeSyncSurface,
  type KolamAuthPanelProps,
  type KolamCommandIndexSurfaceProps,
  type KolamReadinessPanelProps,
  type KolamRuntimeActionSurfaceProps,
  type KolamRuntimeIdentityProps,
  type KolamSyncStatusProps,
} from './kolam-runtime-panel-surfaces';

export interface KolamRuntimeSurfaceProps {
  auth: KolamAuthPanelProps;
  commandIndex: KolamCommandIndexSurfaceProps;
  readiness: KolamReadinessPanelProps;
  runtimeActions: KolamRuntimeActionSurfaceProps;
  runtimeIdentity: KolamRuntimeIdentityProps;
  syncActivity: SyncActivityEntry[];
  syncStatus: KolamSyncStatusProps;
}

export function KolamRuntimeSurface({
  auth,
  commandIndex,
  readiness,
  runtimeActions,
  runtimeIdentity,
  syncActivity,
  syncStatus,
}: KolamRuntimeSurfaceProps) {
  return (
    <>
      <KolamRuntimeAuthSurface auth={auth} />
      <KolamRuntimeIdentitySurface runtimeIdentity={runtimeIdentity} />
      <KolamRuntimeSyncSurface syncStatus={syncStatus} />
      <KolamRuntimeActivitySurface syncActivity={syncActivity} />
      <KolamRuntimeReadinessSurface readiness={readiness} />
      <KolamRuntimeActionsSurface runtimeActions={runtimeActions} />
      <KolamRuntimeCommandIndexSurface commandIndex={commandIndex} />
    </>
  );
}
