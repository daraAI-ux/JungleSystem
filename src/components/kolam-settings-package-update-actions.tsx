import React from 'react';
import {StyleSheet, Text, View, type DimensionValue} from 'react-native';
import {useKolamPackageUpdateController} from '../hooks/use-kolam-package-update-controller';
import {isKolamPackageUpdateEmptyRelease} from '../domain/kolam-package-update';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {textFieldRowStyles} from './kolam-text-field-row-styles';

export function KolamSettingsPackageUpdateActions({
  fieldWidth = 240,
}: {
  fieldWidth?: number;
} = {}) {
  const update = useKolamPackageUpdateController();
  const busy =
    update.phase === 'checking' ||
    update.phase === 'downloading' ||
    update.phase === 'installing';
  const showProgress =
    update.phase === 'downloading' || update.phase === 'installing';
  const emptyRelease = isKolamPackageUpdateEmptyRelease(update.errorMessage);

  return (
    <View style={[styles.column, {width: fieldWidth}]}>
      <View style={[textFieldRowStyles.input, styles.versionBox, {width: fieldWidth}]}>
        <Text style={styles.versionText}>{update.currentVersion || '—'}</Text>
      </View>
      <View style={styles.row}>
        <KolamButton
          disabled={busy}
          label="Periksa"
          onPress={() => {
            void update.check();
          }}
        />
        <KolamButton
          disabled={!update.canInstall}
          intent="primary"
          label="Pasang"
          onPress={() => {
            void update.install();
          }}
        />
      </View>
      {showProgress ? (
        <View style={styles.progressBlock}>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{min: 0, max: 100, now: update.percent}}
            style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${update.percent}%` as DimensionValue},
              ]}
            />
          </View>
          <Text style={styles.percent}>{`${update.percent}%`}</Text>
        </View>
      ) : null}
      {update.errorMessage ? (
        <Text style={emptyRelease ? styles.status : styles.error}>
          {update.errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 8,
  },
  versionBox: {
    justifyContent: 'center',
  },
  versionText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  status: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 2,
    flex: 1,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    height: 4,
  },
  percent: {
    color: V.colors.mutedFg,
    fontSize: 12,
    minWidth: 32,
  },
  error: {
    color: V.colors.danger,
    fontSize: 12,
  },
});
