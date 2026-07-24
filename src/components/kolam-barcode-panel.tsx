import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createCode128BPattern} from '../domain/kolam-barcode';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';

export function KolamBarcodePanel({
  name,
  onPrint,
  priceLabel,
  sku,
}: {
  name: string;
  onPrint?: () => void;
  priceLabel?: string;
  sku: string;
}) {
  const bars = createCode128BPattern(sku);

  return (
    <View style={styles.panel}>
      <Text numberOfLines={2} style={styles.title}>
        {name}
      </Text>
      <View style={styles.bars}>
        {bars.flatMap((pattern, patternIndex) =>
          pattern.split('').map((width, index) => {
            const isBar = index % 2 === 0;
            return (
              <View
                key={`${patternIndex}-${index}`}
                style={[
                  styles.segment,
                  {
                    backgroundColor: isBar ? V.colors.fg : 'transparent',
                    width: Math.max(1, Number(width) || 1),
                  },
                ]}
              />
            );
          }),
        )}
      </View>
      <Text selectable style={styles.code}>
        {sku || '-'}
      </Text>
      {priceLabel ? <Text style={styles.price}>{priceLabel}</Text> : null}
      {onPrint ? (
        <KolamButton
          intent="primary"
          label="Cetak barcode"
          onPress={onPrint}
          style={styles.printButton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
  },
  bars: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: 42,
    justifyContent: 'center',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  segment: {
    height: 46,
  },
  code: {
    color: V.colors.fg,
    fontFamily: 'Consolas',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  price: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  printButton: {
    marginTop: 2,
    minWidth: 92,
  },
});
