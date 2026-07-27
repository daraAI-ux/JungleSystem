import type { KolamRowFrameVariant } from './kolam-row-frame-types';

export interface KolamToggleRowProps {
  active: boolean;
  description: string;
  label: string;
  onPress: () => void;
  variant?: KolamRowFrameVariant;
}
