import {useState} from 'react';
import type {
  CashflowSession,
  CatalogItem,
  CheckoutState,
  Customer,
  PaymentMethod,
} from '../domain/pos';
import {buildSaleDraftPayload} from '../lib/checkout';
import {createSaleDraft} from '../services/pos-api';

export function useKolamSaleDraftController({
  activeSession,
  catalog,
  checkout,
  hasPosAccess,
  onMessage,
  onRefresh,
  selectedCustomer,
  selectedPayment,
  signedIn,
}: {
  activeSession: CashflowSession | null;
  catalog: CatalogItem[];
  checkout: CheckoutState;
  hasPosAccess: boolean;
  onMessage: (message: string) => void;
  onRefresh: () => Promise<void>;
  selectedCustomer?: Customer;
  selectedPayment?: PaymentMethod;
  signedIn: boolean;
}) {
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  const handleCreateSaleDraft = async () => {
    if (!signedIn) {
      onMessage('Login kasir dulu sebelum membuat sale draft.');
      return;
    }

    if (!hasPosAccess) {
      onMessage('User ini tidak punya akses POS untuk membuat sale draft.');
      return;
    }

    if (!selectedCustomer || !selectedPayment) {
      onMessage('Customer dan payment method wajib tersedia.');
      return;
    }

    if (!activeSession) {
      onMessage('Cashflow session belum open.');
      return;
    }

    const payload = buildSaleDraftPayload(checkout, catalog);
    if (!payload.items.length) {
      onMessage('Cart masih kosong.');
      return;
    }

    setIsCreatingSale(true);
    try {
      await createSaleDraft(payload);
      onMessage('Sale draft berhasil dibuat di backend.');
      await onRefresh();
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal membuat sale draft.',
      );
    } finally {
      setIsCreatingSale(false);
    }
  };

  return {
    handleCreateSaleDraft,
    isCreatingSale,
  };
}
