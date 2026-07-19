import {getSyncActivitySummary, type SyncActivityEntry} from '../domain/sync-activity';

export function getSyncActivityPanelMeta(entries: SyncActivityEntry[]) {
  const summary = getSyncActivitySummary(entries);

  return `${summary.live} live - ${summary.fallback} fallback - ${summary.disabled} disabled - ${summary.seed} seed`;
}
