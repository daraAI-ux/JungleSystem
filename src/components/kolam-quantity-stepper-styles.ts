import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const quantityStepperStyles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: V.colors.secondary,
  },
  text: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  quantity: {
    width: 36,
    textAlign: 'center',
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
});
