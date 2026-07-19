import type {ReactNode} from 'react';

export interface KolamCommandPaletteItemProps {
  description?: string;
  icon: ReactNode;
  label: string;
  meta?: string;
  onPress: () => void;
  showDescription?: boolean;
  showMeta?: boolean;
}
