import type {ReadinessCheck} from '../domain/readiness';
import type {RuntimeAction} from '../domain/runtime-actions';
import type {SyncActivityEntry} from '../domain/sync-activity';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamStatusIndicatorIconKind} from './kolam-status-indicator-icon';

export function getStatusIndicatorIconKind(
  kind:
    | RuntimeAction['statusIconKind']
    | ReadinessCheck['statusIconKind']
    | SyncActivityEntry['statusIconKind'],
): KolamStatusIndicatorIconKind {
  return kind;
}

export function getReadinessStatusIconColor(status: ReadinessCheck['status']) {
  if (status === 'ready') {
    return V.colors.success;
  }

  if (status === 'partial') {
    return V.colors.info;
  }

  return V.colors.warning;
}

export function getSyncActivityStatusIconColor(tone: SyncActivityEntry['tone']) {
  if (tone === 'success') {
    return V.colors.success;
  }

  if (tone === 'warning') {
    return V.colors.warning;
  }

  return V.colors.mutedFg;
}