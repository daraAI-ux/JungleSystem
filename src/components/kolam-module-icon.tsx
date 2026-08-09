import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Svg, {Path, SvgXml} from 'react-native-svg';
import {KOLAM_AI_MODULE_ICON_SVG} from '../assets/icons/ai-module-icon-svg';
import {KOLAM_ARCHIVE_MODULE_ICON_SVG} from '../assets/icons/archive-module-icon-svg';
import {KOLAM_ASSET_PURCHASE_MODULE_ICON_SVG} from '../assets/icons/asset-purchase-module-icon-svg';
import {KOLAM_BRAND_MODULE_ICON_SVG} from '../assets/icons/brand-module-icon-svg';
import {KOLAM_CAMPAIGN_MODULE_ICON_SVG} from '../assets/icons/campaign-module-icon-svg';
import {KOLAM_CASHFLOW_SESSION_MODULE_ICON_SVG} from '../assets/icons/cashflow-session-module-icon-svg';
import {KOLAM_COMMISSION_MODULE_ICON_SVG} from '../assets/icons/commission-module-icon-svg';
import {KOLAM_COMPLAINT_MODULE_ICON_SVG} from '../assets/icons/complaint-module-icon-svg';
import {KOLAM_CUSTOMER_MODULE_ICON_SVG} from '../assets/icons/customer-module-icon-svg';
import {KOLAM_DARA_MARKET_INTEL_MODULE_ICON_SVG} from '../assets/icons/dara-market-intel-module-icon-svg';
import {KOLAM_DARA_SEO_MODULE_ICON_SVG} from '../assets/icons/dara-seo-module-icon-svg';
import {KOLAM_DARA_TAX_MODULE_ICON_SVG} from '../assets/icons/dara-tax-module-icon-svg';
import {KOLAM_DARA_TRAINING_MODULE_ICON_SVG} from '../assets/icons/dara-training-module-icon-svg';
import {KOLAM_DISCOUNT_APPROVAL_MODULE_ICON_SVG} from '../assets/icons/discount-approval-module-icon-svg';
import {KOLAM_DOWNLOAD_TOPBAR_ICON_SVG} from '../assets/icons/download-topbar-icon-svg';
import {KOLAM_EMPLOYEE_BONUS_MODULE_ICON_SVG} from '../assets/icons/employee-bonus-module-icon-svg';
import {KOLAM_FINANCE_SUMMARY_MODULE_ICON_SVG} from '../assets/icons/finance-summary-module-icon-svg';
import {KOLAM_LOCATION_MODULE_ICON_SVG} from '../assets/icons/location-module-icon-svg';
import {KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG} from '../assets/icons/media-camera-topbar-icon-svg';
import {KOLAM_PACKING_MODULE_ICON_SVG} from '../assets/icons/packing-module-icon-svg';
import {KOLAM_PAYABLE_MODULE_ICON_SVG} from '../assets/icons/payable-module-icon-svg';
import {KOLAM_PAYROLL_MODULE_ICON_SVG} from '../assets/icons/payroll-module-icon-svg';
import {KOLAM_PRODUCT_MODULE_ICON_SVG} from '../assets/icons/product-module-icon-svg';
import {KOLAM_PROJECT_MODULE_ICON_SVG} from '../assets/icons/project-module-icon-svg';
import {KOLAM_PRODUCTION_MODULE_ICON_SVG} from '../assets/icons/production-module-icon-svg';
import {KOLAM_PURCHASE_ORDER_MODULE_ICON_SVG} from '../assets/icons/purchase-order-module-icon-svg';
import {KOLAM_RAW_MODULE_ICON_SVG} from '../assets/icons/raw-module-icon-svg';
import {KOLAM_RECEIVABLE_MODULE_ICON_SVG} from '../assets/icons/receivable-module-icon-svg';
import {KOLAM_ROUTINE_EXPENSE_MODULE_ICON_SVG} from '../assets/icons/routine-expense-module-icon-svg';
import {KOLAM_SALES_SOURCE_MODULE_ICON_SVG} from '../assets/icons/sales-source-module-icon-svg';
import {KOLAM_SALES_MODULE_ICON_SVG} from '../assets/icons/sales-module-icon-svg';
import {KOLAM_SERVICE_MODULE_ICON_SVG} from '../assets/icons/service-module-icon-svg';
import {KOLAM_SHIPPING_METHOD_MODULE_ICON_SVG} from '../assets/icons/shipping-method-module-icon-svg';
import {KOLAM_SERIAL_MODULE_ICON_SVG} from '../assets/icons/serial-module-icon-svg';
import {KOLAM_SPECIES_MODULE_ICON_SVG} from '../assets/icons/species-module-icon-svg';
import {KOLAM_STOCK_MOVEMENT_MODULE_ICON_SVG} from '../assets/icons/stock-movement-module-icon-svg';
import {KOLAM_STOCK_OPNAME_MODULE_ICON_SVG} from '../assets/icons/stock-opname-module-icon-svg';
import {KOLAM_SUPPLIER_MODULE_ICON_SVG} from '../assets/icons/supplier-module-icon-svg';
import {KOLAM_TASK_TOPBAR_ICON_SVG} from '../assets/icons/task-topbar-icon-svg';
import {KOLAM_TERMS_MODULE_ICON_SVG} from '../assets/icons/terms-module-icon-svg';
import {KOLAM_TAXONOMY_MODULE_ICON_SVG} from '../assets/icons/taxonomy-module-icon-svg';
import {KOLAM_UNIT_MODULE_ICON_SVG} from '../assets/icons/unit-module-icon-svg';
import {KOLAM_UNEXPECTED_EXPENSE_MODULE_ICON_SVG} from '../assets/icons/unexpected-expense-module-icon-svg';
import {KOLAM_UNEXPECTED_INCOME_MODULE_ICON_SVG} from '../assets/icons/unexpected-income-module-icon-svg';
import {KOLAM_VOUCHER_MODULE_ICON_SVG} from '../assets/icons/voucher-module-icon-svg';
import {KOLAM_WALLET_MODULE_ICON_SVG} from '../assets/icons/wallet-module-icon-svg';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';

const IUCN_MODULE_ICON_SOURCE = require('../assets/icons/iucn-module-icon.png');
const TERANURA_MODULE_ICON_SOURCE = require('../assets/icons/teranura-module-icon.png');
const ENCLOSURE_MODULE_ICON_SOURCE = require('../assets/icons/enclosure-module-icon.png');

const MODULE_ICON_LABEL: Record<KolamNavigationModuleIcon, string> = {
  ai: 'Icon Pusat AI',
  archive: 'Icon Arsip',
  assetPurchase: 'Icon Pembelian Aset',
  brand: 'Icon Merek',
  campaign: 'Icon Kampanye',
  cashflowSession: 'Icon Sesi Tunai',
  category: 'Icon Kategori',
  commission: 'Icon Komisi',
  complaint: 'Icon Komplain',
  customer: 'Icon Pelanggan',
  daraMarketIntel: 'Icon Intel Pasar',
  daraSeo: 'Icon DARA SEO',
  daraTax: 'Icon DARA Pajak',
  daraTraining: 'Icon Pelatihan DARA',
  discountApproval: 'Icon Persetujuan Diskon',
  download: 'Icon Download',
  employeeBonus: 'Icon Bonus Karyawan',
  enclosure: 'Icon Kandang',
  fieldcustom: 'Icon Field Kustom',
  financeSummary: 'Icon Ringkasan Keuangan',
  iucn: 'Icon Status IUCN',
  location: 'Icon Lokasi',
  media: 'Icon Media',
  packing: 'Icon Bahan Kemasan',
  payable: 'Icon Hutang',
  payroll: 'Icon Penggajian',
  product: 'Icon Produk',
  project: 'Icon Proyek',
  production: 'Icon Produksi',
  purchaseOrder: 'Icon Pesanan Pembelian',
  raw: 'Icon Bahan Baku',
  receivable: 'Icon Piutang',
  routineExpense: 'Icon Pengeluaran Rutin',
  sales: 'Icon Penjualan',
  salesSource: 'Icon Sumber Penjualan',
  service: 'Icon Layanan',
  shippingMethod: 'Icon Metode Pengiriman',
  serial: 'Icon Serial Produk',
  species: 'Icon Spesies',
  stockMovement: 'Icon Transaksi Stok',
  stockOpname: 'Icon Stock Opname',
  supplier: 'Icon Pemasok',
  tag: 'Icon Tag',
  taskManager: 'Icon Manajemen Tugas',
  terms: 'Icon Syarat dan Ketentuan',
  taxonomy: 'Icon Taksonomi',
  teranura: 'Icon Teranura',
  unexpectedExpense: 'Icon Pengeluaran Tak Terduga',
  unexpectedIncome: 'Icon Pemasukan Tak Terduga',
  unit: 'Icon Satuan',
  voucher: 'Icon Voucher',
  wallet: 'Icon Dompet',
};

const CATEGORY_ICON_PATH =
  'M 809.832031 333.3125 L 809.832031 476.859375 C 809.832031 487.992188 800.722656 496.929688 789.757812 496.929688 L 646.210938 496.929688 C 635.078125 496.929688 626.140625 487.820312 626.140625 476.859375 L 626.140625 333.3125 C 626.140625 322.179688 635.246094 313.238281 646.210938 313.238281 L 789.757812 313.238281 C 800.722656 313.070312 809.832031 322.179688 809.832031 333.3125 Z M 789.757812 0 L 646.210938 0 C 635.078125 0 626.140625 9.109375 626.140625 20.074219 L 626.140625 163.621094 C 626.140625 174.753906 635.246094 183.691406 646.210938 183.691406 L 789.757812 183.691406 C 800.890625 183.691406 809.832031 174.582031 809.832031 163.621094 L 809.832031 20.074219 C 809.832031 9.109375 800.722656 0 789.757812 0 Z M 789.757812 626.308594 L 646.210938 626.308594 C 635.078125 626.308594 626.140625 635.417969 626.140625 646.378906 L 626.140625 789.925781 C 626.140625 801.058594 635.246094 810 646.210938 810 L 789.757812 810 C 800.890625 810 809.832031 800.890625 809.832031 789.925781 L 809.832031 646.378906 C 809.832031 635.246094 800.722656 626.308594 789.757812 626.308594 Z M 167.835938 338.035156 C 130.894531 338.035156 100.871094 368.058594 100.871094 405 C 100.871094 441.941406 130.894531 471.964844 167.835938 471.964844 C 204.777344 471.964844 234.800781 441.941406 234.800781 405 C 234.800781 368.058594 204.777344 338.035156 167.835938 338.035156 Z M 335.671875 405 C 335.671875 497.605469 260.609375 572.667969 168.003906 572.667969 C 75.398438 572.667969 0.167969 497.605469 0.167969 405 C 0.167969 312.394531 75.230469 237.332031 167.835938 237.332031 C 260.441406 237.332031 335.671875 312.394531 335.671875 405 Z M 268.539062 405 C 268.539062 349.503906 223.332031 304.296875 167.835938 304.296875 C 112.339844 304.296875 67.132812 349.503906 67.132812 405 C 67.132812 460.496094 112.339844 505.703125 167.835938 505.703125 C 223.332031 505.703125 268.539062 460.496094 268.539062 405 Z M 562.714844 110.148438 C 571.992188 110.148438 579.582031 102.558594 579.582031 93.28125 C 579.582031 84.003906 571.992188 76.410156 562.714844 76.410156 L 459.484375 76.410156 C 450.207031 76.410156 442.617188 84.003906 442.617188 93.28125 L 442.617188 388.132812 L 393.53125 388.132812 C 384.253906 388.132812 376.660156 395.722656 376.660156 405 C 376.660156 414.277344 384.253906 421.867188 393.53125 421.867188 L 442.617188 421.867188 L 442.617188 716.71875 C 442.617188 725.996094 450.207031 733.589844 459.484375 733.589844 L 562.714844 733.589844 C 571.992188 733.589844 579.582031 725.996094 579.582031 716.71875 C 579.582031 707.441406 571.992188 699.851562 562.714844 699.851562 L 476.351562 699.851562 L 476.351562 421.867188 L 562.714844 421.867188 C 571.992188 421.867188 579.582031 414.277344 579.582031 405 C 579.582031 395.722656 571.992188 388.132812 562.714844 388.132812 L 476.351562 388.132812 L 476.351562 110.148438 Z M 562.714844 110.148438';
const TAG_ICON_PATH =
  'M 786.105469 387.988281 L 421.808594 23.691406 C 407.023438 9.113281 386.773438 0 364.5 0 L 81 0 C 36.246094 0 0 36.246094 0 81 L 0 364.5 C 0 386.976562 9.113281 407.226562 23.894531 421.808594 L 388.394531 786.308594 C 402.976562 800.886719 423.226562 810 445.5 810 C 467.773438 810 488.226562 800.886719 502.808594 786.308594 L 786.308594 502.808594 C 800.886719 488.023438 810 467.773438 810 445.5 C 810 423.023438 800.886719 402.773438 786.105469 387.988281 Z M 141.75 202.5 C 108.136719 202.5 81 175.363281 81 141.75 C 81 108.136719 108.136719 81 141.75 81 C 175.363281 81 202.5 108.136719 202.5 141.75 C 202.5 175.363281 175.363281 202.5 141.75 202.5 Z M 141.75 202.5';
const FIELDCUSTOM_ICON_PATHS = [
  'M 696.511719 129.164062 C 740.304688 175.574219 771.835938 231.179688 789.789062 290.722656 C 748.625 312.179688 720.597656 355.523438 720.597656 405 C 720.597656 454.914062 748.625 497.820312 790.230469 519.277344 C 781.46875 548.609375 769.207031 577.507812 753.003906 605.53125 C 736.800781 633.550781 717.972656 658.507812 696.949219 680.835938 C 657.539062 655.882812 606.300781 653.253906 562.945312 677.773438 C 520.03125 702.730469 496.382812 748.703125 498.570312 795.113281 C 438.136719 809.5625 374.203125 810 312.015625 795.113281 C 314.207031 748.703125 290.558594 702.730469 247.640625 677.773438 C 204.726562 652.816406 153.050781 655.882812 113.636719 680.835938 C 69.84375 634.425781 38.3125 578.820312 20.359375 519.277344 C 61.523438 497.820312 89.550781 454.476562 89.550781 405 C 89.550781 355.085938 61.523438 312.179688 19.921875 290.722656 C 28.679688 261.390625 40.941406 232.492188 57.144531 204.46875 C 73.347656 176.449219 92.179688 151.492188 113.199219 129.164062 C 152.613281 154.117188 203.847656 156.746094 247.203125 132.226562 C 290.121094 107.269531 313.769531 61.296875 311.578125 14.886719 C 372.011719 0.4375 435.949219 0 498.132812 14.886719 C 495.945312 61.296875 519.59375 107.269531 562.507812 132.226562 C 605.425781 157.183594 657.101562 154.117188 696.511719 129.164062 Z M 608.050781 522.339844 C 672.863281 410.253906 634.328125 266.644531 522.21875 201.84375 C 410.109375 137.042969 266.472656 175.574219 201.660156 287.660156 C 136.847656 399.746094 175.382812 543.355469 287.492188 608.15625 C 399.601562 672.957031 543.238281 634.425781 608.050781 522.339844 Z M 608.050781 522.339844',
  'M 348.363281 491.253906 C 348.363281 501.761719 343.984375 510.957031 337.414062 517.523438 C 333.035156 521.902344 326.90625 525.40625 320.773438 527.15625 L 320.773438 558.242188 C 320.773438 563.496094 316.394531 567.875 311.140625 567.875 C 305.886719 567.875 301.507812 563.496094 301.507812 558.242188 L 301.507812 527.15625 C 294.9375 525.40625 289.246094 521.902344 284.863281 517.523438 C 278.296875 510.957031 273.917969 501.324219 273.917969 491.253906 C 273.917969 481.183594 278.296875 471.550781 284.863281 464.984375 C 289.246094 460.605469 295.375 457.101562 301.507812 455.351562 L 301.507812 252.195312 C 301.507812 246.941406 305.886719 242.5625 311.140625 242.5625 C 316.394531 242.5625 320.773438 246.941406 320.773438 252.195312 L 320.773438 455.351562 C 327.34375 457.101562 333.035156 460.605469 337.414062 464.984375 C 343.984375 471.550781 348.363281 481.183594 348.363281 491.253906 Z M 348.363281 491.253906',
  'M 414.492188 441.339844 L 414.492188 558.679688 C 414.492188 563.933594 410.109375 568.3125 404.855469 568.3125 C 399.601562 568.3125 395.222656 563.933594 395.222656 558.679688 L 395.222656 441.339844 C 388.652344 439.589844 382.960938 436.085938 378.582031 431.707031 C 372.011719 425.140625 367.632812 415.507812 367.632812 405.4375 C 367.632812 395.367188 372.011719 385.734375 378.582031 379.167969 C 382.960938 374.789062 389.089844 371.285156 395.222656 369.535156 L 395.222656 252.195312 C 395.222656 246.941406 399.601562 242.5625 404.855469 242.5625 C 410.109375 242.5625 414.492188 246.941406 414.492188 252.195312 L 414.492188 369.535156 C 421.058594 371.285156 426.753906 374.789062 431.132812 379.167969 C 437.699219 385.734375 442.078125 395.367188 442.078125 405.4375 C 442.078125 415.507812 437.699219 425.140625 431.132812 431.707031 C 426.753906 436.085938 420.621094 439.589844 414.492188 441.339844 Z M 414.492188 441.339844',
  'M 535.796875 319.183594 C 535.796875 329.691406 531.414062 338.886719 524.847656 345.453125 C 520.46875 349.832031 514.335938 353.335938 508.207031 355.085938 L 508.207031 558.242188 C 508.207031 563.496094 503.828125 567.875 498.570312 567.875 C 493.316406 567.875 488.9375 563.496094 488.9375 558.242188 L 488.9375 355.085938 C 482.367188 353.335938 476.675781 349.832031 472.296875 345.453125 C 465.726562 338.886719 461.347656 329.253906 461.347656 319.183594 C 461.347656 309.113281 465.726562 299.480469 472.296875 292.914062 C 476.675781 288.535156 482.804688 285.03125 488.9375 283.28125 L 488.9375 252.195312 C 488.9375 246.941406 493.316406 242.5625 498.570312 242.5625 C 503.828125 242.5625 508.207031 246.941406 508.207031 252.195312 L 508.207031 283.28125 C 514.773438 285.03125 520.46875 288.535156 524.847656 292.914062 C 531.414062 299.480469 535.796875 309.113281 535.796875 319.183594 Z M 535.796875 319.183594',
] as const;
const BRAND_ICON_PATHS = getSvgPathData(KOLAM_BRAND_MODULE_ICON_SVG);
const ARCHIVE_ICON_PATHS = getSvgPathData(KOLAM_ARCHIVE_MODULE_ICON_SVG);
const ASSET_PURCHASE_ICON_PATHS = getSvgPathData(
  KOLAM_ASSET_PURCHASE_MODULE_ICON_SVG,
);
const CAMPAIGN_ICON_PATHS = getSvgPathData(KOLAM_CAMPAIGN_MODULE_ICON_SVG);
const CASHFLOW_SESSION_ICON_PATHS = getSvgPathData(
  KOLAM_CASHFLOW_SESSION_MODULE_ICON_SVG,
);
const COMMISSION_ICON_PATHS = getSvgPathData(KOLAM_COMMISSION_MODULE_ICON_SVG);
const COMPLAINT_ICON_PATHS = getSvgPathData(KOLAM_COMPLAINT_MODULE_ICON_SVG);
const DOWNLOAD_ICON_PATHS = getSvgPathData(KOLAM_DOWNLOAD_TOPBAR_ICON_SVG);
const EMPLOYEE_BONUS_ICON_PATHS = getSvgPathData(
  KOLAM_EMPLOYEE_BONUS_MODULE_ICON_SVG,
);
const LOCATION_ICON_PATHS = getSvgPathData(KOLAM_LOCATION_MODULE_ICON_SVG);
const MEDIA_ICON_PATHS = getSvgPathData(KOLAM_MEDIA_CAMERA_TOPBAR_ICON_SVG);
const PACKING_ICON_PATHS = getSvgPathData(KOLAM_PACKING_MODULE_ICON_SVG);
const PAYABLE_ICON_PATHS = getSvgPathData(KOLAM_PAYABLE_MODULE_ICON_SVG);
const PAYROLL_ICON_PATHS = getSvgPathData(KOLAM_PAYROLL_MODULE_ICON_SVG);
const PRODUCT_ICON_PATHS = getSvgPathData(KOLAM_PRODUCT_MODULE_ICON_SVG);
const PROJECT_ICON_PATHS = getSvgPathData(KOLAM_PROJECT_MODULE_ICON_SVG);
const PRODUCTION_ICON_PATHS = getSvgPathData(KOLAM_PRODUCTION_MODULE_ICON_SVG);
const PURCHASE_ORDER_ICON_PATHS = getSvgPathData(
  KOLAM_PURCHASE_ORDER_MODULE_ICON_SVG,
);
const RAW_ICON_PATHS = getSvgPathData(KOLAM_RAW_MODULE_ICON_SVG);
const RECEIVABLE_ICON_PATHS = getSvgPathData(KOLAM_RECEIVABLE_MODULE_ICON_SVG);
const ROUTINE_EXPENSE_ICON_PATHS = getSvgPathData(
  KOLAM_ROUTINE_EXPENSE_MODULE_ICON_SVG,
);
const SALES_SOURCE_ICON_PATHS = getSvgPathData(
  KOLAM_SALES_SOURCE_MODULE_ICON_SVG,
);
const SALES_ICON_PATHS = getSvgPathData(KOLAM_SALES_MODULE_ICON_SVG);
const SERVICE_ICON_PATHS = getSvgPathData(KOLAM_SERVICE_MODULE_ICON_SVG);
const SHIPPING_METHOD_ICON_PATHS = getSvgPathData(
  KOLAM_SHIPPING_METHOD_MODULE_ICON_SVG,
);
const SERIAL_ICON_PATHS = getSvgPathData(KOLAM_SERIAL_MODULE_ICON_SVG);
const SPECIES_ICON_PATHS = getSvgPathData(KOLAM_SPECIES_MODULE_ICON_SVG);
const STOCK_MOVEMENT_ICON_PATHS = getSvgPathData(
  KOLAM_STOCK_MOVEMENT_MODULE_ICON_SVG,
);
const STOCK_OPNAME_ICON_PATHS = getSvgPathData(
  KOLAM_STOCK_OPNAME_MODULE_ICON_SVG,
);
const SUPPLIER_ICON_PATHS = getSvgPathData(KOLAM_SUPPLIER_MODULE_ICON_SVG);
const TASK_MANAGER_ICON_PATHS = getSvgPathData(KOLAM_TASK_TOPBAR_ICON_SVG);
const TERMS_ICON_PATHS = getSvgPathData(KOLAM_TERMS_MODULE_ICON_SVG);
const TAXONOMY_ICON_PATHS = getSvgPathData(KOLAM_TAXONOMY_MODULE_ICON_SVG);
const UNIT_ICON_PATHS = getSvgPathData(KOLAM_UNIT_MODULE_ICON_SVG);
const UNEXPECTED_EXPENSE_ICON_PATHS = getSvgPathData(
  KOLAM_UNEXPECTED_EXPENSE_MODULE_ICON_SVG,
);
const UNEXPECTED_INCOME_ICON_PATHS = getSvgPathData(
  KOLAM_UNEXPECTED_INCOME_MODULE_ICON_SVG,
);
const VOUCHER_ICON_PATHS = getSvgPathData(KOLAM_VOUCHER_MODULE_ICON_SVG);
const WALLET_ICON_PATHS = getSvgPathData(KOLAM_WALLET_MODULE_ICON_SVG);

const MODULE_ICON_SIZE = {
  header: 64,
  menu: 18,
} as const;

export function KolamModuleIcon({
  kind,
  size = 'menu',
}: {
  kind: KolamNavigationModuleIcon;
  size?: keyof typeof MODULE_ICON_SIZE;
}) {
  const dimension = MODULE_ICON_SIZE[size];

  return (
    <View
      accessibilityLabel={MODULE_ICON_LABEL[kind]}
      style={[styles.root, {height: dimension, width: dimension}]}>
      {kind === 'ai' ? (
        <SvgXml height="100%" width="100%" xml={KOLAM_AI_MODULE_ICON_SVG} />
      ) : kind === 'archive' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {ARCHIVE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'assetPurchase' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {ASSET_PURCHASE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'brand' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {BRAND_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'campaign' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {CAMPAIGN_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'cashflowSession' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {CASHFLOW_SESSION_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'category' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          <Path d={CATEGORY_ICON_PATH} fill="#1a1a1a" fillRule="evenodd" />
        </Svg>
      ) : kind === 'commission' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {COMMISSION_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'complaint' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {COMPLAINT_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'customer' ? (
        <SvgXml height="100%" width="100%" xml={KOLAM_CUSTOMER_MODULE_ICON_SVG} />
      ) : kind === 'daraMarketIntel' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DARA_MARKET_INTEL_MODULE_ICON_SVG}
        />
      ) : kind === 'daraSeo' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DARA_SEO_MODULE_ICON_SVG}
        />
      ) : kind === 'daraTax' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DARA_TAX_MODULE_ICON_SVG}
        />
      ) : kind === 'daraTraining' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DARA_TRAINING_MODULE_ICON_SVG}
        />
      ) : kind === 'discountApproval' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DISCOUNT_APPROVAL_MODULE_ICON_SVG}
        />
      ) : kind === 'download' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {DOWNLOAD_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'employeeBonus' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {EMPLOYEE_BONUS_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'enclosure' ? (
        <Image
          resizeMode="contain"
          source={ENCLOSURE_MODULE_ICON_SOURCE}
          style={styles.imageIcon}
        />
      ) : kind === 'tag' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          <Path d={TAG_ICON_PATH} fill="#1a1a1a" fillRule="nonzero" />
        </Svg>
      ) : kind === 'taskManager' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {TASK_MANAGER_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'terms' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {TERMS_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'taxonomy' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {TAXONOMY_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'teranura' ? (
        <Image
          resizeMode="contain"
          source={TERANURA_MODULE_ICON_SOURCE}
          style={styles.imageIcon}
        />
      ) : kind === 'fieldcustom' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {FIELDCUSTOM_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'financeSummary' ? (
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_FINANCE_SUMMARY_MODULE_ICON_SVG}
        />
      ) : kind === 'iucn' ? (
        <Image
          resizeMode="contain"
          source={IUCN_MODULE_ICON_SOURCE}
          style={styles.imageIcon}
        />
      ) : kind === 'location' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {LOCATION_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'media' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {MEDIA_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'packing' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PACKING_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'payable' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PAYABLE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'payroll' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PAYROLL_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'product' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PRODUCT_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'project' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PROJECT_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'production' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PRODUCTION_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'purchaseOrder' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {PURCHASE_ORDER_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'raw' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {RAW_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'receivable' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {RECEIVABLE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'routineExpense' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {ROUTINE_EXPENSE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'sales' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SALES_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'salesSource' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SALES_SOURCE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'service' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SERVICE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'shippingMethod' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SHIPPING_METHOD_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'serial' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SERIAL_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'species' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SPECIES_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'stockMovement' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {STOCK_MOVEMENT_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'stockOpname' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {STOCK_OPNAME_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'supplier' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {SUPPLIER_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'unit' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {UNIT_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="evenodd" />
          ))}
        </Svg>
      ) : kind === 'unexpectedExpense' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {UNEXPECTED_EXPENSE_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'unexpectedIncome' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {UNEXPECTED_INCOME_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'voucher' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {VOUCHER_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : kind === 'wallet' ? (
        <Svg height="100%" viewBox="0 0 810 809.999993" width="100%">
          {WALLET_ICON_PATHS.map(path => (
            <Path key={path} d={path} fill="#1a1a1a" fillRule="nonzero" />
          ))}
        </Svg>
      ) : (
        null
      )}
    </View>
  );
}

function getSvgPathData(svg: string) {
  const paths: string[] = [];
  const drawableSvg = svg.replace(/<defs[\s\S]*?<\/defs>/g, '');
  const pattern = /\sd="([^"]+)"/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(drawableSvg)) !== null) {
    if (match[1]) {
      paths.push(match[1]);
    }
  }

  return paths;
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
  imageIcon: {
    height: '100%',
    width: '100%',
  },
});
