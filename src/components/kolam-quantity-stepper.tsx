import React from 'react';
import {View} from 'react-native';
import {KolamQuantityStepperButton} from './kolam-quantity-stepper-button';
import {quantityStepperStyles as styles} from './kolam-quantity-stepper-styles';
import type {KolamQuantityStepperProps} from './kolam-quantity-stepper-types';
import {KolamQuantityStepperValue} from './kolam-quantity-stepper-value';

export type {KolamQuantityStepperProps} from './kolam-quantity-stepper-types';

export function KolamQuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
}: KolamQuantityStepperProps) {
  return (
    <View style={styles.stepper}>
      <KolamQuantityStepperButton label="-" onPress={onDecrement} />
      <KolamQuantityStepperValue quantity={quantity} />
      <KolamQuantityStepperButton label="+" onPress={onIncrement} />
    </View>
  );
}
