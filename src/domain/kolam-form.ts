export type KolamFormSectionId =
  | 'brand-detail'
  | 'cashflow-open'
  | 'customer-create';

export interface KolamFormSection {
  id: KolamFormSectionId;
  title: string;
  description: string;
}

export interface KolamFormVisualContract {
  sourceComponent: string;
  section: {
    layout: 'single-column';
    columnGap: number;
    rowGap: number;
    separator: true;
  };
  fieldGrid: {
    desktopColumns: 1;
    gap: number;
  };
  actions: {
    justify: 'end';
    gap: number;
    paddingTop: number;
  };
  input: {
    height: number;
    radius: number;
    borderColor: 'input';
    shadow: 'shadow-xs';
    fontSize: number;
  };
}

export const kolamFormVisualContract: KolamFormVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\form-section.tsx',
  section: {
    layout: 'single-column',
    columnGap: 32,
    rowGap: 24,
    separator: true,
  },
  fieldGrid: {
    desktopColumns: 1,
    gap: 16,
  },
  actions: {
    justify: 'end',
    gap: 8,
    paddingTop: 16,
  },
  input: {
    height: 36,
    radius: 8,
    borderColor: 'input',
    shadow: 'shadow-xs',
    fontSize: 13,
  },
};

const kolamFormSections: Record<KolamFormSectionId, KolamFormSection> = {
  'brand-detail': {
    id: 'brand-detail',
    title: 'Data Merek',
    description:
      'Kelola nama, negara asal, status, tautan, dan logo utama merek.',
  },
  'cashflow-open': {
    id: 'cashflow-open',
    title: 'Open Session',
    description:
      'Buat nama shift sebelum membuka cashflow supaya sale draft mengikuti sesi kasir aktif.',
  },
  'customer-create': {
    id: 'customer-create',
    title: 'Customer Detail',
    description:
      'Input customer mengikuti form section Kolam live: identitas di kiri, kontrol data di kanan.',
  },
};

export function getKolamFormSection(
  sectionId: KolamFormSectionId,
): KolamFormSection {
  return { ...kolamFormSections[sectionId] };
}

export function getKolamFormVisualContract(): KolamFormVisualContract {
  return {
    ...kolamFormVisualContract,
    section: { ...kolamFormVisualContract.section },
    fieldGrid: { ...kolamFormVisualContract.fieldGrid },
    actions: { ...kolamFormVisualContract.actions },
    input: { ...kolamFormVisualContract.input },
  };
}
