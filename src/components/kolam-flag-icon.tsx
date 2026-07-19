import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { KolamCountryFlagOption } from '../domain/kolam-country-flags';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

export function KolamFlagIcon({
  option,
  size = 'sm',
}: {
  option: KolamCountryFlagOption;
  size?: 'sm' | 'md';
}) {
  if (!option.code) {
    return (
      <View
        accessibilityLabel={`${option.country} flag unavailable`}
        style={[styles.flagSpacer, size === 'md' && styles.flagIconMd]}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${option.country} flag`}
      style={[styles.flagIcon, size === 'md' && styles.flagIconMd]}
    >
      <KolamNativeFlag code={option.code} />
    </View>
  );
}

function KolamNativeFlag({ code }: { code: string }) {
  switch (code) {
    case 'ID':
    case 'PL':
      return <HorizontalFlag colors={['#ef4444', '#ffffff']} />;
    case 'JP':
      return (
        <View style={[styles.fill, styles.white]}>
          <View style={styles.jpCircle} />
        </View>
      );
    case 'US':
    case 'MY':
      return (
        <View style={styles.fill}>
          <HorizontalFlag
            colors={[
              '#b91c1c',
              '#ffffff',
              '#b91c1c',
              '#ffffff',
              '#b91c1c',
              '#ffffff',
              '#b91c1c',
            ]}
          />
          <View style={styles.blueCanton} />
        </View>
      );
    case 'GB':
    case 'AU':
      return <CrossFlag base="#1e3a8a" cross="#dc2626" />;
    case 'CN':
    case 'HK':
    case 'VN':
      return (
        <View style={[styles.fill, styles.red]}>
          <View style={styles.star} />
        </View>
      );
    case 'SG':
      return <HorizontalFlag colors={['#dc2626', '#ffffff']} />;
    case 'KR':
      return (
        <View style={[styles.fill, styles.white]}>
          <View style={styles.krRed} />
          <View style={styles.krBlue} />
        </View>
      );
    case 'TH':
      return (
        <HorizontalFlag
          colors={['#dc2626', '#ffffff', '#1e3a8a', '#ffffff', '#dc2626']}
        />
      );
    case 'TR':
      return (
        <View style={[styles.fill, styles.red]}>
          <View style={styles.trCrescentOuter} />
          <View style={styles.trCrescentInner} />
          <View style={styles.trStar} />
        </View>
      );
    case 'UG':
      return (
        <HorizontalFlag
          colors={[
            '#111827',
            '#facc15',
            '#dc2626',
            '#111827',
            '#facc15',
            '#dc2626',
          ]}
        />
      );
    case 'UA':
      return <HorizontalFlag colors={['#2563eb', '#facc15']} />;
    case 'AE':
      return (
        <View style={styles.fill}>
          <View style={styles.aeStripes}>
            <HorizontalFlag colors={['#16a34a', '#ffffff', '#111827']} />
          </View>
          <View style={styles.aeHoist} />
        </View>
      );
    case 'DE':
      return <HorizontalFlag colors={['#111827', '#dc2626', '#facc15']} />;
    case 'FR':
    case 'NL':
      return <VerticalFlag colors={['#2563eb', '#ffffff', '#dc2626']} />;
    case 'BR':
      return (
        <View style={[styles.fill, styles.green]}>
          <View style={styles.brDiamond} />
          <View style={styles.brCircle} />
        </View>
      );
    case 'IN':
      return <HorizontalFlag colors={['#f97316', '#ffffff', '#16a34a']} />;
    case 'PH':
      return <HorizontalFlag colors={['#2563eb', '#dc2626']} />;
    case 'RU':
      return <HorizontalFlag colors={['#ffffff', '#2563eb', '#dc2626']} />;
    default:
      return <HorizontalFlag colors={getFallbackFlagColors(code)} />;
  }
}

function HorizontalFlag({ colors }: { colors: string[] }) {
  return (
    <View style={styles.fill}>
      {colors.map((color, index) => (
        <View
          key={`${color}-${index}`}
          style={[styles.horizontalStripe, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

function VerticalFlag({ colors }: { colors: string[] }) {
  return (
    <View style={[styles.fill, styles.vertical]}>
      {colors.map((color, index) => (
        <View
          key={`${color}-${index}`}
          style={[styles.verticalStripe, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

function CrossFlag({ base, cross }: { base: string; cross: string }) {
  return (
    <View style={[styles.fill, { backgroundColor: base }]}>
      <View style={[styles.crossHorizontal, { backgroundColor: '#ffffff' }]} />
      <View style={[styles.crossVertical, { backgroundColor: '#ffffff' }]} />
      <View style={[styles.crossHorizontalThin, { backgroundColor: cross }]} />
      <View style={[styles.crossVerticalThin, { backgroundColor: cross }]} />
    </View>
  );
}

function getFallbackFlagColors(code: string) {
  const palette = [
    '#0f766e',
    '#2563eb',
    '#dc2626',
    '#f59e0b',
    '#16a34a',
    '#7c3aed',
    '#be123c',
    '#0891b2',
  ];
  const first = code.charCodeAt(0) || 0;
  const second = code.charCodeAt(1) || first + 3;

  return [
    palette[first % palette.length],
    '#ffffff',
    palette[second % palette.length],
  ];
}

const styles = StyleSheet.create({
  flagIcon: {
    width: 24,
    height: 18,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagSpacer: {
    width: 24,
    height: 18,
  },
  flagIconMd: {
    width: 30,
    height: 22,
  },
  fill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  horizontalStripe: {
    flex: 1,
  },
  vertical: {
    flexDirection: 'row',
  },
  verticalStripe: {
    flex: 1,
  },
  white: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  red: {
    backgroundColor: '#dc2626',
  },
  green: {
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jpCircle: {
    width: '44%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#bc002d',
  },
  blueCanton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '46%',
    height: '54%',
    backgroundColor: '#1d4ed8',
  },
  star: {
    width: '22%',
    aspectRatio: 1,
    marginLeft: '17%',
    marginTop: '16%',
    backgroundColor: '#facc15',
    transform: [{ rotate: '45deg' }],
  },
  krRed: {
    position: 'absolute',
    top: '18%',
    left: '29%',
    width: '42%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#dc2626',
  },
  krBlue: {
    position: 'absolute',
    bottom: '18%',
    left: '29%',
    width: '42%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  brDiamond: {
    width: '58%',
    aspectRatio: 1,
    backgroundColor: '#facc15',
    transform: [{ rotate: '45deg' }],
  },
  brCircle: {
    position: 'absolute',
    width: '30%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#1d4ed8',
  },
  trCrescentOuter: {
    position: 'absolute',
    top: '24%',
    left: '28%',
    width: '28%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  trCrescentInner: {
    position: 'absolute',
    top: '24%',
    left: '35%',
    width: '28%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#dc2626',
  },
  trStar: {
    position: 'absolute',
    top: '40%',
    left: '59%',
    width: '12%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
  },
  aeHoist: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '28%',
    backgroundColor: '#dc2626',
  },
  aeStripes: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '28%',
  },
  crossHorizontal: {
    position: 'absolute',
    top: '38%',
    left: 0,
    width: '100%',
    height: '24%',
  },
  crossVertical: {
    position: 'absolute',
    top: 0,
    left: '40%',
    width: '20%',
    height: '100%',
  },
  crossHorizontalThin: {
    position: 'absolute',
    top: '44%',
    left: 0,
    width: '100%',
    height: '12%',
  },
  crossVerticalThin: {
    position: 'absolute',
    top: 0,
    left: '45%',
    width: '10%',
    height: '100%',
  },
});
