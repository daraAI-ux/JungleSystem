export type KolamInfoListRowVariant = 'command' | 'route';

export interface KolamInfoListRowProps {
  detail?: string;
  description: string;
  metaDetail: string;
  metaLabel: string;
  onPress: () => void;
  selected?: boolean;
  title: string;
  variant?: KolamInfoListRowVariant;
}
