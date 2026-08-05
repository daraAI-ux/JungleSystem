import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import type { KolamPayrollSlip } from '../domain/kolam-payroll';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { getKolamWebSetting } from '../services/kolam-api';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamModalBackdrop } from './kolam-modal-backdrop';

const KolamWebView = WebView as unknown as React.ComponentType<any>;

type WebViewHandle = {
  injectJavaScript: (script: string) => void;
};

/**
 * Payroll slip print — WebView2 mounts only while `visible`.
 * Barcode print dialog is SKU-specific; this stays local to payroll.
 */
export function KolamPayrollSlipPrintDialog({
  onOpenChange,
  slip,
  visible,
}: {
  onOpenChange: (open: boolean) => void;
  slip: KolamPayrollSlip;
  visible: boolean;
}) {
  const webViewRef = React.useRef<WebViewHandle | null>(null);
  const [logoUrl, setLogoUrl] = React.useState('');
  const [brandName, setBrandName] = React.useState('Dunia Anura');

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    void getKolamWebSetting()
      .then(setting => {
        if (cancelled) {
          return;
        }
        const name = String(setting.companyName ?? '').trim();
        setBrandName(name || 'Dunia Anura');
        const resolved = getKolamFileUrl(setting.logo);
        setLogoUrl(resolved && /^https?:\/\//i.test(resolved) ? resolved : '');
      })
      .catch(() => {
        if (!cancelled) {
          setBrandName('Dunia Anura');
          setLogoUrl('');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const printedAt = React.useMemo(
    () =>
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [visible, slip.id],
  );

  const html = React.useMemo(
    () =>
      createPayrollSlipPrintHtml({
        brandName,
        logoUrl,
        printedAt,
        slip,
      }),
    [brandName, logoUrl, printedAt, slip],
  );

  if (!visible) {
    return null;
  }

  const close = () => onOpenChange(false);

  return (
    <View style={styles.overlay}>
      <KolamModalBackdrop onPress={close} />
      <View accessibilityLabel="Cetak slip gaji" style={styles.dialog}>
        <View style={styles.header}>
          <KolamCopyStack
            items={[
              { id: 'title', text: 'Cetak slip gaji', style: styles.title },
              {
                id: 'description',
                text: `${slip.slipCode || 'Slip'} · Periode ${slip.periodKey || '—'}`,
                style: styles.description,
              },
            ]}
          />
        </View>

        <View style={styles.controls}>
          <KolamButton
            intent="primary"
            label="Cetak"
            onPress={() => {
              webViewRef.current?.injectJavaScript('window.print(); true;');
            }}
          />
        </View>

        <View style={styles.body}>
          <KolamWebView
            containerStyle={styles.webViewContainer}
            javaScriptEnabled
            originWhitelist={['*']}
            ref={webViewRef}
            source={{ html }}
            style={styles.webView}
            useWebView2={Platform.OS === 'windows'}
          />
        </View>

        <View style={styles.footer}>
          <KolamCopyStack
            containerStyle={styles.footerMeta}
            items={[
              {
                id: 'meta',
                text: 'Gunakan tombol Cetak untuk membuka dialog printer Windows. Tutup dialog untuk melepaskan WebView2.',
                style: styles.footerText,
              },
            ]}
          />
          <KolamButton label="Tutup" onPress={close} />
        </View>
      </View>
    </View>
  );
}

export function createPayrollSlipPrintHtml({
  brandName,
  logoUrl,
  printedAt,
  slip,
}: {
  brandName: string;
  logoUrl: string;
  printedAt: string;
  slip: KolamPayrollSlip;
}): string {
  const snapshot = slip.employeeSnapshot;
  const name =
    `${snapshot.firstName} ${snapshot.lastName}`.trim() || slip.userLabel;
  const pphRateLabel = slip.pph21Payroll.applicable
    ? ` (${slip.pph21Payroll.rate}%)`
    : '';
  const brand = escapeHtml(brandName || 'Dunia Anura');
  const logo =
    logoUrl && /^https?:\/\//i.test(logoUrl)
      ? `<img src="${escapeHtml(logoUrl)}" alt="${brand}" class="logo" />`
      : `<span class="brand">${brand}</span>`;

  const warningsHtml =
    slip.warnings.length > 0
      ? `<ul class="warnings">${slip.warnings
          .map(
            warning =>
              `<li><strong>${escapeHtml(warning.code)}:</strong> ${escapeHtml(
                warning.message,
              )}</li>`,
          )
          .join('')}</ul>`
      : '';

  const aiNoteHtml = slip.pph21AiNote
    ? `<section class="ai-note"><p class="ai-title">Catatan PPh 21 (AI — estimasi)</p><p class="ai-body">${escapeHtml(
        slip.pph21AiNote,
      )}</p></section>`
    : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Slip Gaji ${escapeHtml(slip.periodKey)}</title>
  <style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      padding: 24px;
      color: #111827;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      font-size: 13px;
      background: #fff;
    }
    article {
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 28px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .logo { height: 56px; max-width: 200px; object-fit: contain; }
    .brand { font-size: 18px; font-weight: 700; }
    .doc-right { text-align: right; }
    .doc-right .title { font-weight: 700; margin: 0 0 2px; }
    .muted { color: #64748b; }
    .warnings {
      margin: 0 0 16px;
      padding: 10px 12px;
      border: 1px solid #b7791f;
      background: #fff7e6;
      border-radius: 6px;
      list-style: none;
    }
    .warnings li { margin: 2px 0; }
    .identity {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-bottom: 18px;
    }
    .identity .label { color: #64748b; margin: 0 0 2px; font-size: 12px; }
    .identity .value { margin: 0; font-weight: 600; }
    table.amounts { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    table.amounts td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    table.amounts td.amt { text-align: right; white-space: nowrap; }
    table.amounts tr.emphasis td { font-weight: 600; }
    table.amounts tr.deduction td { color: #64748b; }
    table.amounts tr.deduction td.label { padding-left: 14px; }
    table.amounts tr.thp td {
      border-bottom: 0;
      font-weight: 700;
      font-size: 16px;
      padding-top: 12px;
    }
    .ai-note {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .ai-title { margin: 0 0 6px; font-weight: 600; }
    .ai-body { margin: 0; color: #64748b; white-space: pre-wrap; }
    footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      color: #64748b;
      font-size: 11px;
    }
    footer p { margin: 0 0 4px; }
    @media print {
      body { padding: 0; }
      article { border: 0; border-radius: 0; padding: 0; max-width: none; }
      .warnings { display: none; }
    }
  </style>
</head>
<body>
  <article id="payroll-slip-print">
    <header>
      ${logo}
      <div class="doc-right">
        <p class="title">Slip Gaji</p>
        <p>Periode ${escapeHtml(slip.periodKey || '—')}</p>
        <p class="muted">${escapeHtml(slip.slipCode || '—')}</p>
      </div>
    </header>
    ${warningsHtml}
    <section class="identity">
      ${identityCell('Nama', name)}
      ${identityCell('No. Karyawan', snapshot.employeeNumber || '—')}
      ${identityCell('NPWP', snapshot.taxNumber || '—')}
      ${identityCell('PKP', snapshot.isPkp ? 'Berlaku' : 'Tidak berlaku')}
      ${identityCell('Departemen', snapshot.department || '—')}
      ${identityCell('Posisi', snapshot.position || '—')}
    </section>
    <table class="amounts">
      <tbody>
        ${amountRow('Gaji pokok', formatRupiah(slip.baseSalary))}
        ${amountRow('Bonus (verified)', formatRupiah(slip.bonusTotal))}
        ${amountRow('Komisi bruto (released)', formatRupiah(slip.commissionGross))}
        ${amountRow('Bruto', formatRupiah(slip.grossBruto), 'emphasis')}
        ${amountRow(
          'PPh 21 komisi (sudah dipotong)',
          `(${formatRupiah(slip.commissionPph21Withheld)})`,
          'deduction',
        )}
        ${amountRow(
          `PPh 21 gaji+bonus${pphRateLabel}`,
          `(${formatRupiah(slip.pph21Payroll.amount)})`,
          'deduction',
        )}
        ${amountRow('Kasbon', `(${formatRupiah(slip.kasbonTotal)})`, 'deduction')}
        ${amountRow(
          'Potongan gaji',
          `(${formatRupiah(slip.salaryDeductionTotal)})`,
          'deduction',
        )}
        ${amountRow('Take home pay', formatRupiah(slip.takeHomePay), 'thp')}
      </tbody>
    </table>
    ${aiNoteHtml}
    <footer>
      <p>Dokumen estimasi internal. Bukan bukti potong resmi DJP. Rekap PPh 21 bulanan: Tax Intelligence.</p>
      <p>Dicetak: ${escapeHtml(printedAt)}</p>
    </footer>
  </article>
</body>
</html>`;
}

function identityCell(label: string, value: string): string {
  return `<div><p class="label">${escapeHtml(label)}</p><p class="value">${escapeHtml(
    value,
  )}</p></div>`;
}

function amountRow(
  label: string,
  amount: string,
  rowClass?: 'emphasis' | 'deduction' | 'thp',
): string {
  const cls = rowClass ? ` class="${rowClass}"` : '';
  return `<tr${cls}><td class="label">${escapeHtml(label)}</td><td class="amt">${escapeHtml(
    amount,
  )}</td></tr>`;
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    bottom: 0,
    elevation: 1450,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 145000,
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1451,
    gap: 12,
    height: 640,
    maxWidth: '92%',
    overflow: 'hidden',
    padding: 16,
    shadowColor: V.colors.fg,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 860,
    zIndex: 145001,
  },
  header: {
    gap: 4,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  webViewContainer: {
    backgroundColor: V.colors.bg,
    flex: 1,
  },
  webView: {
    backgroundColor: V.colors.bg,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
  footerMeta: {
    flex: 1,
  },
  footerText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});
