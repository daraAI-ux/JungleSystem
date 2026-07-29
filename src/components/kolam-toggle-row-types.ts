import type { KolamRowFrameVariant } from './kolam-row-frame-types';

export interface KolamToggleRowProps {
  active: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  variant?: KolamRowFrameVariant;
}
