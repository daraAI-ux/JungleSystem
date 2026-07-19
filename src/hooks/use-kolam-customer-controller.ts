import {useState} from 'react';
import type {Customer} from '../domain/pos';
import {
  createCustomer,
  type CreateCustomerBody,
} from '../services/pos-api';

const emptyCustomerForm: CreateCustomerBody = {
  name: '',
  gender: 'other',
  address: '',
  phone: '',
  email: '',
  notes: '',
};

export function useKolamCustomerController({
  hasPosAccess,
  onCustomerCreated,
  onMessage,
  signedIn,
}: {
  hasPosAccess: boolean;
  onCustomerCreated: (customer: Customer) => void;
  onMessage: (message: string) => void;
  signedIn: boolean;
}) {
  const [customerForm, setCustomerForm] =
    useState<CreateCustomerBody>(emptyCustomerForm);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const handleCreateCustomer = async () => {
    if (!signedIn) {
      onMessage('Login kasir dulu sebelum membuat customer.');
      return;
    }

    if (!hasPosAccess) {
      onMessage('User ini tidak punya akses POS untuk membuat customer.');
      return;
    }

    if (!customerForm.name || !customerForm.phone) {
      onMessage('Nama dan nomor telepon customer wajib diisi.');
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const createdCustomer = await createCustomer({
        ...customerForm,
        address: customerForm.address || '-',
        email: customerForm.email || '-',
      });
      onCustomerCreated(createdCustomer);
      setCustomerForm(emptyCustomerForm);
      onMessage(`Customer dibuat: ${createdCustomer.name}`);
    } catch (error) {
      onMessage(
        error instanceof Error ? error.message : 'Gagal membuat customer.',
      );
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  return {
    customerForm,
    handleCreateCustomer,
    isCreatingCustomer,
    setCustomerForm,
  };
}
