import type {AccessScope} from '../domain/auth';
import type {AppModule} from '../domain/app-shell';
import {
  isRuntimeActionEnabled,
  type RuntimeAction,
} from '../domain/runtime-actions';

export function useKolamRuntimeActionController({
  accessScope,
  onCloseCashflow,
  onCreateSaleDraft,
  onMessage,
  onOpenCashflow,
  onPluginSearchChange,
  onRefreshDataset,
  onSelectModule,
}: {
  accessScope: AccessScope;
  onCloseCashflow: () => Promise<void>;
  onCreateSaleDraft: () => Promise<void>;
  onMessage: (message: string) => void;
  onOpenCashflow: () => Promise<void>;
  onPluginSearchChange: (search: string) => void;
  onRefreshDataset: (
    preferLiveApi: boolean,
    enabledAreas?: AccessScope,
  ) => Promise<void>;
  onSelectModule: (module: AppModule) => void;
}) {
  const handleRuntimeAction = async (action: RuntimeAction) => {
    if (!isRuntimeActionEnabled(action, accessScope)) {
      onMessage(`${action.label} membutuhkan akses ${action.requiredAccess}.`);
      return;
    }

    switch (action.id) {
      case 'kolam-sync-finance':
      case 'am-sync-dashboard':
        await onRefreshDataset(true, accessScope);
        return;
      case 'pos-search-catalog':
        onSelectModule('catalog');
        onMessage('Katalog POS siap ditelusuri dari dataset aktif.');
        return;
      case 'pos-create-sale-draft':
        await onCreateSaleDraft();
        return;
      case 'pos-open-cashflow':
        await onOpenCashflow();
        return;
      case 'pos-close-cashflow':
        await onCloseCashflow();
        return;
      case 'pos-create-customer':
        onSelectModule('customer');
        onMessage('Isi form customer untuk membuat customer POS baru.');
        return;
      case 'pos-update-sale-status':
        onSelectModule('sales');
        onMessage('Pilih sale lalu ubah status dari modul Sales.');
        return;
      case 'plugin-route-explorer':
        onSelectModule('plugins');
        onPluginSearchChange('');
        onMessage('Plugin route explorer menampilkan semua route host.');
        return;
      case 'plugin-version-audit':
        onSelectModule('plugins');
        onPluginSearchChange('version-mismatch');
        onMessage('Plugin Hub difilter ke manifest/package mismatch.');
        return;
      default:
        onMessage(`${action.label}: ${action.status} - ${action.sourceContract}`);
    }
  };

  return {
    handleRuntimeAction,
  };
}
