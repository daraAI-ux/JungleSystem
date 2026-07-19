import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {quantityStepperStyles as styles} from './kolam-quantity-stepper-styles';

export function KolamQuantityStepperButton({
  label,
  onPress,
}: {
  label: '-' | '+';
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame onPress={onPress} style={styles.button}>
      <KolamCopyStack
        items={[{id: 'label', text: label, style: styles.text}]}
      />
    </KolamInteractionFrame>
  );
}
