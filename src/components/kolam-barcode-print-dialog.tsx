import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import {
  createCode128BHtml,
  createCode128BPattern,
  sanitizeCode128BValue,
  type KolamBarcodeLabelItem,
} from '../domain/kolam-barcode';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import {KolamModalDialog} from './kolam-modal-dialog';

const KolamWebView = WebView as unknown as React.ComponentType<any>;

type WebViewHandle = {
  injectJavaScript: (script: string) => void;
};

export function KolamBarcodePrintDialog({
  description = 'Label CODE128 memakai SKU. Ukuran label mengikuti web: 30mm dengan tinggi barcode 20mm.',
  items,
  onOpenChange,
  title,
  visible,
}: {
  description?: string;
  items: KolamBarcodeLabelItem[];
  onOpenChange: (open: boolean) => void;
  title: string;
  visible: boolean;
}) {
  const barcodeItems = React.useMemo(
    () =>
      items
        .map(item => ({
          ...item,
          code: sanitizeCode128BValue(item.code),
        }))
        .filter(item => item.code),
    [items],
  );
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(barcodeItems.map(item => item.id)),
  );
  const [showName, setShowName] = React.useState(true);
  const [showPrice, setShowPrice] = React.useState(true);
  const webViewRef = React.useRef<WebViewHandle | null>(null);

  React.useEffect(() => {
    if (visible) {
      setSelectedIds(new Set(barcodeItems.map(item => item.id)));
    }
  }, [barcodeItems, visible]);

  const selectedItems = React.useMemo(
    () => barcodeItems.filter(item => selectedIds.has(item.id)),
    [barcodeItems, selectedIds],
  );
  const html = React.useMemo(
    () =>
      createBarcodePrintHtml({
        items: selectedItems,
        showName,
        showPrice,
      }),
    [selectedItems, showName, showPrice],
  );

  if (!visible) {
    return null;
  }

  const close = () => onOpenChange(false);
  const allSelected = selectedIds.size === barcodeItems.length;

  return (
    <KolamModalDialog
      description={description}
      dialogStyle={styles.dialog}
      height={560}
      maxWidth="92%"
      onClose={close}
      title={title}
      visible={visible}
      width={820}
      footer={
        <>
          <KolamCopyStack
            containerStyle={styles.footerMeta}
            items={[
              {
                id: 'meta',
                text: selectedItems.length
                  ? 'Gunakan tombol Cetak untuk membuka dialog printer Windows.'
                  : 'Pilih minimal satu SKU untuk dicetak.',
                style: styles.footerText,
              },
            ]}
          />
          <KolamButton label="Tutup" onPress={close} />
        </>
      }>
        <View style={styles.controls}>
          <KolamButton
            label={allSelected ? 'Kosongkan' : 'Pilih Semua'}
            onPress={() => {
              setSelectedIds(
                allSelected
                  ? new Set()
                  : new Set(barcodeItems.map(item => item.id)),
              );
            }}
          />
          <KolamButton
            intent={showName ? 'primary' : 'outline'}
            label="Nama"
            onPress={() => setShowName(current => !current)}
          />
          <KolamButton
            intent={showPrice ? 'primary' : 'outline'}
            label="Harga"
            onPress={() => setShowPrice(current => !current)}
          />
          <KolamButton
            disabled={!selectedItems.length}
            intent="primary"
            label="Cetak"
            onPress={() => {
              webViewRef.current?.injectJavaScript('window.print(); true;');
            }}
          />
        </View>

        <View style={styles.body}>
          <View style={styles.itemPanel}>
            <KolamCopyStack
              items={[
                {
                  id: 'count',
                  text: `${selectedItems.length} / ${barcodeItems.length} SKU dipilih`,
                  style: styles.panelTitle,
                },
              ]}
            />
            <ScrollView
              contentContainerStyle={styles.itemListContent}
              keyboardShouldPersistTaps="handled"
              style={styles.itemList}
            >
              {barcodeItems.map(item => {
                const selected = selectedIds.has(item.id);
                return (
                  <KolamButton
                    intent={selected ? 'primary' : 'outline'}
                    key={item.id}
                    label={`${selected ? '✓ ' : ''}${item.code}`}
                    onPress={() => {
                      setSelectedIds(current => {
                        const next = new Set(current);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        return next;
                      });
                    }}
                    style={styles.itemButton}
                    textStyle={styles.itemButtonText}
                  />
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.previewPanel}>
            <ScrollView contentContainerStyle={styles.previewList}>
              {selectedItems.length ? (
                selectedItems.map(item => (
                  <NativeBarcodePreview
                    item={item}
                    key={item.id}
                    showName={showName}
                    showPrice={showPrice}
                  />
                ))
              ) : (
                <Text style={styles.emptyPreview}>Belum ada SKU dipilih.</Text>
              )}
            </ScrollView>
          </View>
          <View pointerEvents="none" style={styles.printWebViewHost}>
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
        </View>
    </KolamModalDialog>
  );
}

function NativeBarcodePreview({
  item,
  showName,
  showPrice,
}: {
  item: KolamBarcodeLabelItem;
  showName: boolean;
  showPrice: boolean;
}) {
  const patterns = createCode128BPattern(item.code);
  return (
    <View style={styles.nativeLabel}>
      <View style={styles.nativeBarcodeBars}>
        {patterns.flatMap((pattern: string, patternIndex: number) =>
          pattern.split('').map((width: string, index: number) => {
            const isBar = index % 2 === 0;
            return (
              <View
                key={`${item.id}-${patternIndex}-${index}`}
                style={[
                  styles.nativeBarcodeSegment,
                  {
                    backgroundColor: isBar ? '#000000' : '#ffffff',
                    width: Math.max(1, Number(width) || 1),
                  },
                ]}
              />
            );
          }),
        )}
      </View>
      {showName ? (
        <Text numberOfLines={2} style={styles.nativeLabelName}>{item.name ?? ''}</Text>
      ) : null}
      {showPrice && item.price ? (
        <Text style={styles.nativeLabelPrice}>{formatPrice(item.price)}</Text>
      ) : null}
      <Text style={styles.nativeLabelSku}>{item.code}</Text>
    </View>
  );
}
function createBarcodePrintHtml({
  items,
  showName,
  showPrice,
}: {
  items: KolamBarcodeLabelItem[];
  showName: boolean;
  showPrice: boolean;
}) {
  const labels = items
    .map(
      item => `
        <article class="label">
          <div class="barcode" aria-label="${escapeHtml(item.code)}">
            ${createCode128BHtml(item.code)}
          </div>
          ${
            showName
              ? `<div class="name">${escapeHtml(item.name ?? '')}</div>`
              : ''
          }
          ${
            showPrice && item.price
              ? `<div class="price">${formatPrice(item.price)}</div>`
              : ''
          }
          <div class="sku">${escapeHtml(item.code)}</div>
        </article>
      `,
    )
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light only" />
  <style>
    @page { margin: 4mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      background: #f8fafc;
      color: #111827;
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 10px;
    }
    .sheet {
      align-content: flex-start;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .label {
      align-items: center;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      height: 38mm;
      justify-content: center;
      overflow: hidden;
      padding: 2mm;
      width: 30mm;
    }
    .barcode {
      align-items: stretch;
      display: flex;
      height: 20mm;
      justify-content: center;
      line-height: 0;
      max-width: 27mm;
      overflow: hidden;
      width: 27mm;
    }
    .bar { background: #000; display: block; flex-shrink: 0; }
    .space { background: transparent; display: block; flex-shrink: 0; }
    .bar, .space { height: 20mm; }
    .name {
      font-size: 7px;
      font-weight: 700;
      line-height: 9px;
      margin-top: 2px;
      max-height: 18px;
      overflow: hidden;
      text-align: center;
      width: 100%;
    }
    .price {
      font-size: 7px;
      font-weight: 700;
      line-height: 9px;
      text-align: center;
    }
    .sku {
      font-family: Consolas, Monaco, monospace;
      font-size: 7px;
      font-weight: 700;
      line-height: 9px;
      text-align: center;
    }
    .empty {
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
      padding: 18px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .sheet { gap: 0; }
      .label { border: none; break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    ${labels || '<div class="empty">Belum ada SKU dipilih.</div>'}
  </main>
</body>
</html>`;
}

function formatPrice(value: number) {
  return formatRupiah(value || 0);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const styles = StyleSheet.create({
  dialog: {
    overflow: 'hidden',
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 0,
  },
  itemPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
    width: 250,
  },
  panelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  itemList: {
    flex: 1,
  },
  itemListContent: {
    gap: 6,
  },
  itemButton: {
    justifyContent: 'flex-start',
    minHeight: 34,
  },
  itemButtonText: {
    fontFamily: 'Consolas',
    textAlign: 'left',
  },
  previewList: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  nativeLabel: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 6,
    borderWidth: 1,
    height: 148,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
    width: 116,
  },
  nativeBarcodeBars: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    height: 68,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nativeBarcodeSegment: {
    height: 68,
  },
  nativeLabelName: {
    color: '#111827',
    fontFamily: V.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  nativeLabelPrice: {
    color: '#111827',
    fontFamily: V.fontFamily,
    fontSize: 8,
    fontWeight: '800',
    lineHeight: 10,
    textAlign: 'center',
  },
  nativeLabelSku: {
    color: '#111827',
    fontFamily: 'Consolas',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
    textAlign: 'center',
  },
  emptyPreview: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    padding: 18,
  },
  printWebViewHost: {
    height: 1,
    left: -9999,
    opacity: 0,
    position: 'absolute',
    top: -9999,
    width: 1,
  },
  previewPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
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






