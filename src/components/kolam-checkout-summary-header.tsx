import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {checkoutSummaryStyles as styles} from './kolam-checkout-summary-styles';

export function KolamCheckoutSummaryHeader({
  cartItemCount,
  onClearCart,
}: {
  cartItemCount: number;
  onClearCart: () => void;
}) {
  return (
    <KolamHeaderFrame variant="checkoutSummary">
      <KolamCopyStack
        items={[{id: 'title', text: 'Checkout', style: styles.sectionTitle}]}
      />
      <KolamActionControlButton
        label="Kosongkan"
        intent="outline"
        size="sm"
        onPress={onClearCart}
        canRun={Boolean(cartItemCount)}
      />
    </KolamHeaderFrame>
  );
}