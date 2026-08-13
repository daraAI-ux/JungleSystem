import React from 'react';
import {StyleSheet, Text, View, type DimensionValue} from 'react-native';
import {useKolamPackageUpdateController} from '../hooks/use-kolam-package-update-controller';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';

export function KolamSettingsPackageUpdateActions() {
  const update = useKolamPackageUpdateController();
  const busy =
    update.phase === 'checking' ||
    update.phase === 'downloading' ||
    update.phase === 'installing';
  const showProgress =
    update.phase === 'downloading' || update.phase === 'installing';

  return (
    <View style={styles.row}>
      {update.currentVersion ? (
        <Text style={styles.version}>{update.currentVersion}</Text>
      ) : null}
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
        <Text style={styles.error}>{update.errorMessage}</Text>
      ) : null}
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
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    gap: 8,
    minHeight: 40,
    paddingLeft: 12,
    paddingRight: 4,
  },
  version: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  progressBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 2,
    height: 4,
    overflow: 'hidden',
    width: 64,
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
    maxWidth: 160,
  },
});
