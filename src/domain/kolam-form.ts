export type KolamFormSectionId =
  | 'brand-detail'
  | 'catalog-translations'
  | 'cashflow-open'
  | 'customer-create'
  | 'custom-field-detail'
  | 'iucn-status-detail'
  | 'tag-detail'
  | 'taxonomy-detail'
  | 'unit-detail';

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
  'catalog-translations': {
    id: 'catalog-translations',
    title: 'Terjemahan Marketplace',
    description:
      'Isi locale selain Indonesia. Data kosong akan fallback ke field utama.',
  },
  'cashflow-open': {
    id: 'cashflow-open',
    title: 'Open Session',
    description:
      'Buat nama shift sebelum membuka cashflow supaya sale draft mengikuti sesi kasir aktif.',
  },
  'custom-field-detail': {
    id: 'custom-field-detail',
    title: 'Data Field Kustom',
    description:
      'Kelola kunci, label, tipe, aturan, icon, dan deskripsi field kustom.',
  },
  'customer-create': {
    id: 'customer-create',
    title: 'Customer Detail',
    description:
      'Input customer mengikuti form section Kolam live: identitas di kiri, kontrol data di kanan.',
  },
  'iucn-status-detail': {
    id: 'iucn-status-detail',
    title: 'Data Status IUCN',
    description:
      'Kelola nama, singkatan, status, dan gambar badge konservasi IUCN.',
  },
  'tag-detail': {
    id: 'tag-detail',
    title: 'Data Tag',
    description:
      'Kelola nama, warna, status, dan deskripsi tag untuk produk, layanan, dan species.',
  },
  'taxonomy-detail': {
    id: 'taxonomy-detail',
    title: 'Data Taksonomi',
    description:
      'Kelola nama, hierarki, nama ilmiah, status, dan konten locale taksonomi.',
  },
  'unit-detail': {
    id: 'unit-detail',
    title: 'Data Satuan',
    description:
      'Kelola nama dan simbol satuan pengukuran untuk produk dan spesies.',
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



