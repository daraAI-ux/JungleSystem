import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {SettingsRoleMemberPreview} from '../domain/settings-surface';
import {KolamAvatarPillList} from './kolam-avatar-pill-list';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';

export function KolamSettingsRoleMemberPreview({
  preview,
}: {
  preview: SettingsRoleMemberPreview;
}) {
  return (
    <KolamInlineFrame variant="roleMemberPreview">
      <KolamInlineFrame variant="roleMemberHeader">
        <View style={styles.settingsRoleMemberIcon}>
          <View style={styles.settingsRoleMemberIconHead} />
          <View style={styles.settingsRoleMemberIconBody} />
        </View>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: [preview.label, ' (', preview.count, ')'],
              style: styles.settingsRoleMemberTitle,
            },
          ]}
        />
      </KolamInlineFrame>
      <KolamAvatarPillList
        accessibilityLabel={`${preview.label} members`}
        emptyLabel="No members yet"
        items={preview.members}
      />
    </KolamInlineFrame>
  );
}

const styles = StyleSheet.create({
  settingsRoleMemberIcon: {
    width: 16,
    height: 16,
    position: 'relative',
  },
  settingsRoleMemberIconHead: {
    position: 'absolute',
    left: 5,
    top: 1,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: V.colors.mutedFg,
  },
  settingsRoleMemberIconBody: {
    position: 'absolute',
    left: 2,
    bottom: 1,
    width: 12,
    height: 7,
    borderRadius: 999,
    backgroundColor: V.colors.mutedFg,
  },
  settingsRoleMemberTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
});