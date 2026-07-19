import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';

export function KolamCheckoutSubmitButton({
  canCreateDraft,
  isCreatingSale,
  onCreateSaleDraft,
}: {
  canCreateDraft: boolean;
  isCreatingSale: boolean;
  onCreateSaleDraft: () => void;
}) {
  return (
    <KolamActionControlButton
      label="Buat sale draft"
      loading={isCreatingSale}
      loadingLabel="Membuat draft..."
      intent="primary"
      size="md"
      onPress={onCreateSaleDraft}
      canRun={canCreateDraft}
    />
  );
}
