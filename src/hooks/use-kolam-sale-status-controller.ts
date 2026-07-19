import {useState} from 'react';
import type {SaleSummary} from '../domain/pos';
import {updateSaleStatus} from '../services/pos-api';

export function useKolamSaleStatusController({
  hasPosAccess,
  onMessage,
  onSaleUpdated,
  signedIn,
}: {
  hasPosAccess: boolean;
  onMessage: (message: string) => void;
  onSaleUpdated: (sale: SaleSummary) => void;
  signedIn: boolean;
}) {
  const [updatingSaleId, setUpdatingSaleId] = useState<string | null>(null);

  const handleSaleStatus = async (
    saleId: string,
    status: SaleSummary['status'],
  ) => {
    if (!signedIn) {
      onMessage('Login kasir dulu sebelum mengubah status sale.');
      return;
    }

    if (!hasPosAccess) {
      onMessage('User ini tidak punya akses POS untuk mengubah status sale.');
      return;
    }

    setUpdatingSaleId(saleId);
    try {
      const updatedSale = await updateSaleStatus(saleId, status);
      onSaleUpdated(updatedSale);
      onMessage(`${updatedSale.invoiceCode} menjadi ${updatedSale.status}.`);
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal mengubah status sale.',
      );
    } finally {
      setUpdatingSaleId(null);
    }
  };

  return {
    handleSaleStatus,
    updatingSaleId,
  };
}
