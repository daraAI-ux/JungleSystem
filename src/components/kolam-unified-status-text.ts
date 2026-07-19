import {appConfig} from '../config/app';
import type {UnifiedDataset} from '../services/unified-data';

export function getKolamStatusText(dataset: UnifiedDataset) {
  if (dataset.kolam.source === 'live') {
    return `${appConfig.kolamApiBaseUrl} live, ${dataset.kolam.salesGraph.length} titik grafik`;
  }

  return dataset.kolam.errorMessage
    ? `${dataset.kolam.source}: ${dataset.kolam.errorMessage}`
    : `${dataset.kolam.source}: menunggu sesi live`;
}

export function getAmStatusText(dataset: UnifiedDataset) {
  if (dataset.am.source === 'live') {
    return `${dataset.am.baseUrl ?? appConfig.amApiBaseUrl} live`;
  }

  return dataset.am.errorMessage
    ? `${dataset.am.source}: ${dataset.am.errorMessage}`
    : `${dataset.am.source}: menunggu konfigurasi`;
}
