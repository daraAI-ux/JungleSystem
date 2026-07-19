export interface KolamDetailPanelField {
  id: string;
  label: string;
  mono?: boolean;
  value: string;
}

export interface KolamDetailPanelProps {
  closeLabel?: string;
  fields: KolamDetailPanelField[];
  onClose: () => void;
  subtitle: string;
  title: string;
  warningFlags?: string[];
  warningTitle?: string;
}
