import type {AccessScope} from '../domain/auth';
import type {RuntimeAction} from '../domain/runtime-actions';
import {getRuntimeActionStats} from '../domain/runtime-actions';

export function getRuntimeActionStripMeta(
  accessScope: AccessScope,
  actions: RuntimeAction[],
) {
  const stats = getRuntimeActionStats(accessScope, actions);

  return `${stats.enabled}/${stats.total} aktif - ${stats.liveApi} live API - ${stats.nativeReady} native`;
}
