import type {PluginSurfaceSummaryCard} from '../domain/plugin-surface';
import {pluginSummaryCardStyles as styles} from './kolam-plugin-summary-card-styles';

export function getPluginSummaryCardToneStyle(
  tone: PluginSurfaceSummaryCard['tone'],
) {
  if (tone === 'success') {
    return styles.pluginSummaryCardSuccess;
  }

  if (tone === 'warning') {
    return styles.pluginSummaryCardWarning;
  }

  if (tone === 'info') {
    return styles.pluginSummaryCardInfo;
  }

  return undefined;
}

export function getPluginSummaryIconToneStyle(
  tone: PluginSurfaceSummaryCard['tone'],
) {
  if (tone === 'success') {
    return styles.pluginSummaryIconSuccess;
  }

  if (tone === 'warning') {
    return styles.pluginSummaryIconWarning;
  }

  if (tone === 'info') {
    return styles.pluginSummaryIconInfo;
  }

  return undefined;
}

export function getPluginSummaryValueToneStyle(
  tone: PluginSurfaceSummaryCard['tone'],
) {
  if (tone === 'success') {
    return styles.pluginSummaryValueSuccess;
  }

  if (tone === 'warning') {
    return styles.pluginSummaryValueWarning;
  }

  if (tone === 'info') {
    return styles.pluginSummaryValueInfo;
  }

  return undefined;
}
