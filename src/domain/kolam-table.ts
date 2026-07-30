export type KolamTableId =
  | 'brand'
  | 'catalog'
  | 'category'
  | 'custom-field'
  | 'customer'
  | 'iucn-status'
  | 'location'
  | 'location-asset'
  | 'location-enclosure'
  | 'location-product'
  | 'packing-material'
  | 'product'
  | 'product-serial'
  | 'production'
  | 'production-materials'
  | 'purchase-order'
  | 'purchase-order-items'
  | 'purchase-order-form-items'
  | 'sales'
  | 'sales-ops'
  | 'species'
  | 'supplier'
  | 'supplier-catalog'
  | 'tag'
  | 'teranura'
  | 'taxonomy'
  | 'unit';

export type KolamTableColumnAlign = 'center' | 'left' | 'right';

export interface KolamTableColumn {
  id:
    | 'primary'
    | 'meta'
    | 'amount'
    | 'children'
    | 'marketplace'
    | 'price'
    | 'products'
    | 'raws'
    | 'notes'
    | 'status'
    | 'actions';
  label: string;
  align: KolamTableColumnAlign;
  headerAlign?: KolamTableColumnAlign;
  width?: number;
}

export type KolamTableColumnWidthMap = Partial<
  Record<KolamTableColumn['id'], number>
>;

export interface KolamTableColumnSizing {
  id: KolamTableColumn['id'];
  values?: Array<number | string | null | undefined>;
  minWidth: number;
  maxWidth: number;
  charWidth?: number;
  padding?: number;
}

export interface KolamTableVisualContract {
  sourceComponent: string;
  wrapper: {
    card: true;
    overflowHidden: true;
    overflowX: true;
    whitespaceNoWrap: true;
    cardSpacing: 0;
  };
  root: {
    minWidth: '100%';
    captionSide: 'bottom';
    fontSize: 14;
    lineHeight: 24;
  };
  header: {
    background: 'secondary/50';
    resolvedBackground: '#f2f3f5';
    borderY: true;
    columnPaddingX: number;
    gutterY: number;
    fontSize: number;
    lineHeight: number;
    fontWeight: 'medium';
  };
  body: {
    emptyStateHeight: number;
    rowMinHeight: number;
    rowBorderBottom: true;
    lastRowBorderBottom: false;
    cellPaddingX: number;
    gutterY: number;
    primaryWeight: 'semibold';
    amountWeight: 'semibold';
  };
  interaction: {
    selectedBackground: 'secondary/50';
    resolvedSelectedBackground: '#f2f3f5';
    selectedText: 'fg';
    hoverBackground: 'secondary/50';
    disabledOpacity: 0.5;
  };
}

export const kolamTableVisualContract: KolamTableVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
  wrapper: {
    card: true,
    overflowHidden: true,
    overflowX: true,
    whitespaceNoWrap: true,
    cardSpacing: 0,
  },
  root: {
    minWidth: '100%',
    captionSide: 'bottom',
    fontSize: 14,
    lineHeight: 24,
  },
  header: {
    background: 'secondary/50',
    resolvedBackground: '#f2f3f5',
    borderY: true,
    columnPaddingX: 20,
    gutterY: 12,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'medium',
  },
  body: {
    emptyStateHeight: 288,
    rowMinHeight: 52,
    rowBorderBottom: true,
    lastRowBorderBottom: false,
    cellPaddingX: 20,
    gutterY: 12,
    primaryWeight: 'semibold',
    amountWeight: 'semibold',
  },
  interaction: {
    selectedBackground: 'secondary/50',
    resolvedSelectedBackground: '#f2f3f5',
    selectedText: 'fg',
    hoverBackground: 'secondary/50',
    disabledOpacity: 0.5,
  },
};

const kolamTableColumns: Record<KolamTableId, KolamTableColumn[]> = {
  brand: [
    // Manual widths (preferred); fit still fills the measured body.
    {
      id: 'primary',
      label: 'Merek',
      align: 'center',
      headerAlign: 'center',
      width: 200,
    },
    {
      id: 'meta',
      label: 'Negara',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'products',
      label: 'Produk',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'raws',
      label: 'Bahan',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'notes',
      label: 'Catatan',
      align: 'center',
      headerAlign: 'center',
      width: 160,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    // 7th column: blank header, overflow actions in the body.
    { id: 'actions', label: '', align: 'center', headerAlign: 'center', width: 64 },
  ],
  catalog: [
    { id: 'primary', label: 'Catalog', align: 'left' },
    { id: 'meta', label: 'Stock', align: 'left', width: 150 },
    { id: 'amount', label: 'Price', align: 'right', width: 170 },
  ],
  category: [
    {
      id: 'primary',
      label: 'Kategori',
      align: 'left',
      headerAlign: 'left',
      width: 220,
    },
    {
      id: 'children',
      label: 'Subkategori',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'products',
      label: 'Produk',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'meta',
      label: 'Species',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  tag: [
    {
      id: 'primary',
      label: 'Tag',
      align: 'left',
      headerAlign: 'left',
      width: 200,
    },
    {
      id: 'meta',
      label: 'Warna',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'notes',
      label: 'Deskripsi',
      align: 'center',
      headerAlign: 'center',
      width: 280,
    },
    {
      id: 'amount',
      label: 'Digunakan',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  'custom-field': [
    {
      id: 'primary',
      label: 'Label',
      align: 'left',
      headerAlign: 'left',
      width: 220,
    },
    {
      id: 'meta',
      label: 'Kunci',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'notes',
      label: 'Tipe',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'children',
      label: 'Aturan',
      align: 'center',
      headerAlign: 'center',
      width: 220,
    },
    {
      id: 'amount',
      label: 'Urutan',
      align: 'center',
      headerAlign: 'center',
      width: 90,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  customer: [
    { id: 'primary', label: 'Pelanggan', align: 'left' },
    { id: 'meta', label: 'Phone', align: 'left', width: 150 },
    { id: 'amount', label: 'Email', align: 'right', width: 170 },
  ],
  'packing-material': [
    // Manual widths (preferred); fitPackingListColumns fills the measured body.
    {
      id: 'meta',
      label: 'Foto',
      align: 'center',
      headerAlign: 'center',
      width: 72,
    },
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 220,
    },
    {
      id: 'children',
      label: 'Kategori',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'notes',
      label: 'Dimensi',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'marketplace',
      label: 'Berat',
      align: 'center',
      headerAlign: 'center',
      width: 90,
    },
    {
      id: 'amount',
      label: 'HPP',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'raws',
      label: 'Stok',
      align: 'center',
      headerAlign: 'center',
      width: 72,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    { id: 'actions', label: '', align: 'center', headerAlign: 'center', width: 64 },
  ],
  product: [
    // Manual widths (preferred); fitProductListColumns fills the measured body.
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 260,
    },
    {
      id: 'meta',
      label: 'SKU',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'price',
      label: 'Merek',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'amount',
      label: 'Harga Jual',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'products',
      label: 'Stok',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'marketplace',
      label: 'Sinkron Terakhir',
      align: 'center',
      headerAlign: 'center',
      width: 150,
    },
    {
      id: 'children',
      label: 'Informasi',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    // 8th column: blank header, overflow actions in the body.
    { id: 'actions', label: '', align: 'center', headerAlign: 'center', width: 64 },
  ],
  'iucn-status': [
    {
      id: 'meta',
      label: 'Gambar',
      align: 'center',
      headerAlign: 'center',
      width: 84,
    },
    {
      id: 'children',
      label: 'Singkatan',
      align: 'center',
      headerAlign: 'center',
      width: 118,
    },
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 240,
    },
    {
      id: 'amount',
      label: 'Urutan',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 116,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  location: [
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 220,
    },
    {
      id: 'meta',
      label: 'Tipe',
      align: 'center',
      headerAlign: 'center',
      width: 112,
    },
    {
      id: 'children',
      label: 'Tingkat',
      align: 'center',
      headerAlign: 'center',
      width: 104,
    },
    {
      id: 'notes',
      label: 'Induk',
      align: 'center',
      headerAlign: 'center',
      width: 156,
    },
    {
      id: 'marketplace',
      label: 'Telepon',
      align: 'center',
      headerAlign: 'center',
      width: 132,
    },
    {
      id: 'status',
      label: 'Deskripsi',
      align: 'center',
      headerAlign: 'center',
      width: 220,
    },
    {
      id: 'amount',
      label: 'Dibuat',
      align: 'center',
      headerAlign: 'center',
      width: 128,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  'location-product': [
    { id: 'meta', label: '', align: 'left', width: 64 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'children', label: 'SKU', align: 'left', width: 118 },
    { id: 'amount', label: 'Stok', align: 'right', width: 90 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'location-enclosure': [
    { id: 'meta', label: '', align: 'left', width: 64 },
    { id: 'children', label: 'Kode', align: 'left', width: 104 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'notes', label: 'Tipe', align: 'left', width: 120 },
    { id: 'marketplace', label: 'PIC', align: 'left', width: 140 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'location-asset': [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'Kode', align: 'left', width: 126 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  species: [
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 320,
    },
    {
      id: 'meta',
      label: 'SKU',
      align: 'center',
      headerAlign: 'center',
      width: 126,
    },
    {
      id: 'amount',
      label: 'Harga Jual',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'children',
      label: 'Stok',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'marketplace',
      label: 'Sinkron Terakhir',
      align: 'center',
      headerAlign: 'center',
      width: 168,
    },
    {
      id: 'notes',
      label: 'Informasi',
      align: 'center',
      headerAlign: 'center',
      width: 136,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  supplier: [
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'center',
      width: 200,
    },
    {
      id: 'meta',
      label: 'Telepon',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'notes',
      label: 'Email',
      align: 'center',
      headerAlign: 'center',
      width: 160,
    },
    {
      id: 'children',
      label: 'Total PO',
      align: 'center',
      headerAlign: 'center',
      width: 96,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  'supplier-catalog': [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'price', label: 'Harga', align: 'right', width: 120 },
    { id: 'children', label: 'Total order', align: 'right', width: 110 },
    { id: 'amount', label: 'Total value order', align: 'right', width: 140 },
    { id: 'notes', label: 'Terakhir purchase', align: 'left', width: 140 },
  ],
  'product-serial': [
    {
      id: 'primary',
      label: 'Nomor Seri',
      align: 'left',
      headerAlign: 'center',
    },
    {
      id: 'meta',
      label: 'Produk',
      align: 'center',
      headerAlign: 'center',
      width: 180,
    },
    {
      id: 'notes',
      label: 'Tipe',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'marketplace',
      label: 'Tanggal Produksi',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'products',
      label: 'Opname',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  production: [
    {
      id: 'primary',
      label: 'Target',
      align: 'left',
      headerAlign: 'center',
    },
    {
      id: 'meta',
      label: 'Varian',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'children',
      label: 'Kemajuan',
      align: 'center',
      headerAlign: 'center',
      width: 88,
    },
    {
      id: 'amount',
      label: 'Est. Biaya',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'notes',
      label: 'Batch ID',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'products',
      label: 'PIC',
      align: 'center',
      headerAlign: 'center',
      width: 72,
    },
    {
      id: 'marketplace',
      label: 'Tanggal',
      align: 'center',
      headerAlign: 'center',
      width: 104,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  'production-materials': [
    { id: 'primary', label: 'Komponen', align: 'left' },
    { id: 'meta', label: 'Varian', align: 'left', width: 120 },
    { id: 'notes', label: 'SKU / Kode', align: 'left', width: 120 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'children', label: 'Qty Dibutuhkan', align: 'right', width: 100 },
    { id: 'raws', label: 'Stok Tersedia', align: 'right', width: 100 },
    { id: 'status', label: 'Kecukupan', align: 'right', width: 100 },
    { id: 'price', label: 'Harga / Satuan', align: 'right', width: 120 },
    { id: 'amount', label: 'Subtotal', align: 'right', width: 130 },
  ],
  'purchase-order': [
    {
      id: 'primary',
      label: 'Kode PO',
      align: 'left',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'meta',
      label: 'Pemasok',
      align: 'center',
      headerAlign: 'center',
      width: 180,
    },
    {
      id: 'children',
      label: 'Total Item',
      align: 'center',
      headerAlign: 'center',
      width: 100,
    },
    {
      id: 'amount',
      label: 'Total Biaya',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'marketplace',
      label: 'Dibuat',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  'purchase-order-items': [
    { id: 'primary', label: 'Produk', align: 'left' },
    { id: 'meta', label: 'SKU / Kode', align: 'left', width: 120 },
    { id: 'notes', label: 'Varian', align: 'left', width: 120 },
    { id: 'children', label: 'Jumlah', align: 'right', width: 80 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'price', label: 'Harga Satuan', align: 'right', width: 120 },
    { id: 'raws', label: 'Diterima', align: 'right', width: 90 },
    { id: 'amount', label: 'Total', align: 'right', width: 130 },
  ],
  'purchase-order-form-items': [
    { id: 'primary', label: 'Produk', align: 'left' },
    { id: 'meta', label: 'SKU / Kode', align: 'left', width: 110 },
    { id: 'notes', label: 'Varian', align: 'left', width: 110 },
    { id: 'children', label: 'Jumlah', align: 'right', width: 90 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'price', label: 'Harga Satuan', align: 'right', width: 120 },
    { id: 'amount', label: 'Total', align: 'right', width: 120 },
    { id: 'actions', label: '', align: 'right', width: 72 },
  ],
  teranura: [
    // Manual widths (preferred); fitTeranuraListColumns fills the measured body.
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 240,
    },
    {
      id: 'meta',
      label: 'SKU',
      align: 'center',
      headerAlign: 'center',
      width: 118,
    },
    {
      id: 'price',
      label: 'Merek',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'children',
      label: 'Varian',
      align: 'center',
      headerAlign: 'center',
      width: 112,
    },
    {
      id: 'amount',
      label: 'Harga Jual',
      align: 'center',
      headerAlign: 'center',
      width: 132,
    },
    {
      id: 'products',
      label: 'Stok',
      align: 'center',
      headerAlign: 'center',
      width: 104,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 118,
    },
    { id: 'actions', label: '', align: 'center', headerAlign: 'center', width: 64 },
  ],
  taxonomy: [
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 200,
    },
    {
      id: 'meta',
      label: 'Tingkat',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'notes',
      label: 'Nama Ilmiah',
      align: 'center',
      headerAlign: 'center',
      width: 160,
    },
    {
      id: 'children',
      label: 'Anak',
      align: 'center',
      headerAlign: 'center',
      width: 90,
    },
    {
      id: 'marketplace',
      label: 'Jalur',
      align: 'center',
      headerAlign: 'center',
      width: 200,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  unit: [
    {
      id: 'primary',
      label: 'Nama',
      align: 'left',
      headerAlign: 'left',
      width: 220,
    },
    {
      id: 'meta',
      label: 'Simbol/Inisial',
      align: 'center',
      headerAlign: 'center',
      width: 140,
    },
    {
      id: 'notes',
      label: 'Tipe',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'children',
      label: 'Satuan Dasar',
      align: 'center',
      headerAlign: 'center',
      width: 130,
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'actions',
      label: '',
      align: 'center',
      headerAlign: 'center',
      width: 64,
    },
  ],
  sales: [
    { id: 'primary', label: 'Sale', align: 'left' },
    { id: 'meta', label: 'Status', align: 'left', width: 92 },
    { id: 'amount', label: 'Total', align: 'right', width: 150 },
    { id: 'actions', label: 'Actions', align: 'right', width: 180 },
  ],
  /** Backoffice `/sales` list (FE Invoice/Pembeli/Sumber/…); not POS Sales Terbaru. */
  'sales-ops': [
    {
      id: 'primary',
      label: 'Invoice',
      align: 'left',
      headerAlign: 'center',
    },
    {
      id: 'meta',
      label: 'Pembeli',
      align: 'center',
      headerAlign: 'center',
      width: 160,
    },
    {
      id: 'children',
      label: 'Sumber',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'amount',
      label: 'Total',
      align: 'center',
      headerAlign: 'center',
      width: 120,
    },
    {
      id: 'status',
      label: 'Bayar',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      id: 'marketplace',
      label: 'Kirim',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
  ],
};

export function getKolamTableColumns(
  tableId: KolamTableId,
): KolamTableColumn[] {
  const columns = kolamTableColumns[tableId];
  if (!columns) {
    throw new Error(`Unknown Kolam table columns for "${tableId}"`);
  }
  return columns.map(column => ({ ...column }));
}

export function applyKolamAdaptiveColumnWidths(
  columns: KolamTableColumn[],
  sizing: KolamTableColumnSizing[],
): KolamTableColumn[] {
  const sizingById = new Map(sizing.map(item => [item.id, item]));

  return columns.map(column => {
    const columnSizing = sizingById.get(column.id);

    if (!columnSizing) {
      return { ...column };
    }

    return {
      ...column,
      width: getKolamAdaptiveColumnWidth(column.label, columnSizing),
    };
  });
}

export type KolamTableColumnValueMap = Partial<
  Record<KolamTableColumn['id'], Array<string | number | null | undefined>>
>;

type KolamTableAdaptivePreset = Partial<
  Record<
    KolamTableColumn['id'],
    Pick<KolamTableColumnSizing, 'minWidth' | 'maxWidth' | 'charWidth' | 'padding'>
  >
>;

/**
 * Shared per-table adaptive bounds. Surfaces only pass cell text values —
 * they should not hand-tune min/max/charWidth per screen.
 */
const KOLAM_TABLE_ADAPTIVE_PRESETS: Partial<
  Record<KolamTableId, KolamTableAdaptivePreset>
> = {
  brand: {
    // Logo (132) + nama merek — selaras FE list (logo + name).
    primary: { minWidth: 160, maxWidth: 280, charWidth: 8, padding: 28 },
    meta: { minWidth: 88, maxWidth: 140, charWidth: 8, padding: 16 },
    products: { minWidth: 64, maxWidth: 100, charWidth: 8, padding: 16 },
    raws: { minWidth: 64, maxWidth: 100, charWidth: 8, padding: 16 },
    notes: { minWidth: 120, maxWidth: 240, charWidth: 8, padding: 16 },
    status: { minWidth: 88, maxWidth: 120, charWidth: 8, padding: 16 },
    actions: { minWidth: 64, maxWidth: 64, padding: 0 },
  },
  production: {
    primary: { minWidth: 88, maxWidth: 200, charWidth: 8, padding: 20 },
    meta: { minWidth: 56, maxWidth: 120, charWidth: 8, padding: 16 },
    children: { minWidth: 72, maxWidth: 100, charWidth: 8, padding: 16 },
    amount: { minWidth: 88, maxWidth: 128, charWidth: 8, padding: 16 },
    notes: { minWidth: 100, maxWidth: 200, charWidth: 8, padding: 16 },
    status: { minWidth: 88, maxWidth: 120, charWidth: 8, padding: 16 },
    products: { minWidth: 56, maxWidth: 64, charWidth: 8, padding: 12 },
    marketplace: { minWidth: 88, maxWidth: 104, charWidth: 8, padding: 16 },
    actions: { minWidth: 64, maxWidth: 64, padding: 0 },
  },
};

export interface ResolveKolamDataTableColumnsInput {
  tableId: KolamTableId;
  containerWidth: number;
  /** Longest-content samples per column (usually current page rows). */
  columnValues?: KolamTableColumnValueMap;
  gap?: number;
  paddingX?: number;
}

/**
 * One-shot shared resolver: base columns → char-based preferred widths → fit to body.
 * Modules pass data values only; sizing bounds live in shared presets.
 */
export function resolveKolamDataTableColumns({
  tableId,
  containerWidth,
  columnValues = {},
  gap,
  paddingX,
}: ResolveKolamDataTableColumnsInput): KolamTableColumn[] {
  const base = getKolamTableColumns(tableId);
  const preset = KOLAM_TABLE_ADAPTIVE_PRESETS[tableId] ?? {};

  const sizing: KolamTableColumnSizing[] = base.map(column => {
    const columnPreset = preset[column.id];
    const fallbackMin =
      column.id === 'primary' ? 88 : column.id === 'actions' ? 64 : 48;
    const fallbackMax =
      column.id === 'primary'
        ? 200
        : column.id === 'actions'
          ? 64
          : column.width ?? 160;

    return {
      id: column.id,
      values: columnValues[column.id] ?? [],
      minWidth: columnPreset?.minWidth ?? fallbackMin,
      maxWidth: columnPreset?.maxWidth ?? fallbackMax,
      charWidth: columnPreset?.charWidth,
      padding: columnPreset?.padding,
    };
  });

  const preferred = applyKolamAdaptiveColumnWidths(base, sizing);
  return fitKolamDataTableColumns(preferred, containerWidth, {
    actionsMinWidth: 64,
    gap,
    paddingX,
    primaryMinWidth: preset.primary?.minWidth ?? 88,
    secondaryMinWidth: 48,
  });
}

export interface FitKolamDataTableColumnsOptions {
  /** Row gap between cells. */
  gap?: number;
  /** Total horizontal padding on the row (left + right). */
  paddingX?: number;
  /** Minimum width for the primary/name column when preferred width is missing. */
  primaryMinWidth?: number;
  /** Minimum width reserved for the overflow-actions column. */
  actionsMinWidth?: number;
  /** Floor when shrinking content columns. */
  secondaryMinWidth?: number;
}

/**
 * Fit preferred column widths into the measured table body width (no horizontal scroll).
 * Content columns start from char-based preferred widths, then scale to fill the budget
 * (grow when there is leftover, shrink when too wide). Actions stay fixed and reserved.
 */
export function fitKolamDataTableColumns(
  columns: KolamTableColumn[],
  containerWidth: number,
  options: FitKolamDataTableColumnsOptions = {},
): KolamTableColumn[] {
  if (containerWidth <= 0 || columns.length === 0) {
    return columns.map(column => ({ ...column }));
  }

  const gap = options.gap ?? 16;
  const paddingX = options.paddingX ?? 40;
  const primaryMinWidth = options.primaryMinWidth ?? 88;
  const actionsMinWidth = options.actionsMinWidth ?? 64;
  const secondaryMinWidth = options.secondaryMinWidth ?? 48;

  const gapsTotal = gap * Math.max(0, columns.length - 1);
  const budget = Math.max(0, containerWidth - paddingX - gapsTotal);

  const actionsPreferred =
    columns.find(column => column.id === 'actions')?.width ?? actionsMinWidth;
  const actionsWidth = Math.max(actionsPreferred, actionsMinWidth);
  const contentBudget = Math.max(0, budget - actionsWidth);

  const contentColumns = columns.filter(column => column.id !== 'actions');
  const preferredById = new Map(
    contentColumns.map(column => {
      const preferred =
        column.width ??
        (column.id === 'primary' ? primaryMinWidth : secondaryMinWidth);
      return [column.id, preferred] as const;
    }),
  );

  const preferredTotal = Array.from(preferredById.values()).reduce(
    (sum, width) => sum + width,
    0,
  );

  let fittedWidths: Map<string, number>;

  if (contentColumns.length === 0) {
    fittedWidths = new Map();
  } else if (preferredTotal <= 0) {
    const equalWidth = Math.max(
      32,
      Math.floor(contentBudget / contentColumns.length),
    );
    fittedWidths = new Map(
      contentColumns.map(column => [column.id, equalWidth] as const),
    );
  } else {
    // Grow or shrink proportionally so content columns fill the body budget.
    const scale = contentBudget / preferredTotal;
    fittedWidths = new Map(
      contentColumns.map(column => {
        const preferred = preferredById.get(column.id) ?? secondaryMinWidth;
        const floor =
          column.id === 'primary'
            ? Math.min(primaryMinWidth, 72)
            : Math.min(secondaryMinWidth, 32);
        return [
          column.id,
          Math.max(floor, Math.floor(preferred * scale)),
        ] as const;
      }),
    );
  }

  let fittedTotal = Array.from(fittedWidths.values()).reduce(
    (sum, width) => sum + width,
    0,
  );

  // Absorb rounding remainder into the widest content column so the row fills exactly.
  if (contentColumns.length > 0 && fittedTotal !== contentBudget) {
    const delta = contentBudget - fittedTotal;
    let widestId = contentColumns[0].id;
    let widestWidth = fittedWidths.get(widestId) ?? 0;
    for (const column of contentColumns) {
      const width = fittedWidths.get(column.id) ?? 0;
      if (width > widestWidth) {
        widestId = column.id;
        widestWidth = width;
      }
    }
    fittedWidths.set(widestId, Math.max(32, widestWidth + delta));
  }

  return columns.map(column => {
    if (column.id === 'actions') {
      return { ...column, width: actionsWidth };
    }

    return {
      ...column,
      width:
        fittedWidths.get(column.id) ??
        column.width ??
        (column.id === 'primary' ? primaryMinWidth : secondaryMinWidth),
    };
  });
}

/** Exported for unit tests and surfaces that need a single-column estimate. */
export function estimateKolamAdaptiveColumnWidth(
  label: string,
  sizing: KolamTableColumnSizing,
) {
  return getKolamAdaptiveColumnWidth(label, sizing);
}

export function getKolamTableColumnWidthMap(
  columns: KolamTableColumn[],
): KolamTableColumnWidthMap {
  return columns.reduce<KolamTableColumnWidthMap>((widths, column) => {
    if (typeof column.width === 'number') {
      widths[column.id] = column.width;
    }

    return widths;
  }, {});
}

export function getKolamTableVisualContract(): KolamTableVisualContract {
  return {
    ...kolamTableVisualContract,
    wrapper: { ...kolamTableVisualContract.wrapper },
    root: { ...kolamTableVisualContract.root },
    header: { ...kolamTableVisualContract.header },
    body: { ...kolamTableVisualContract.body },
    interaction: { ...kolamTableVisualContract.interaction },
  };
}

function getKolamAdaptiveColumnWidth(
  label: string,
  sizing: KolamTableColumnSizing,
) {
  const values: Array<number | string | null | undefined> = [
    label,
    ...(sizing.values ?? []),
  ];
  const maxLength = values.reduce<number>(
    (length, value) =>
      Math.max(length, stringifyKolamColumnValue(value).length),
    0,
  );
  const charWidth = sizing.charWidth ?? 8;
  const padding = sizing.padding ?? 28;
  const preferredWidth = Math.ceil(maxLength * charWidth + padding);

  return Math.min(
    sizing.maxWidth,
    Math.max(sizing.minWidth, preferredWidth),
  );
}

function stringifyKolamColumnValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}
