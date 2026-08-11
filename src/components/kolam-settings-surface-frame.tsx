import React from 'react';
import { StyleSheet, View } from 'react-native';
import { KolamActionControlButton } from './kolam-action-control-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamPanelFrame } from './kolam-panel-frame';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
import { KolamSettingsSurfaceBody } from './kolam-settings-surface-body';
import { KolamSurfacePanelCopy } from './kolam-surface-panel-copy';

export function KolamSettingsSurfaceFrame({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  const title =
    controller.activeSettingsTab?.label ?? controller.activeSurface.title;
  const description =
    controller.activeSettingsTab?.description ??
    controller.activeSurface.description;
  const showHeaderSaveAction =
    controller.activeSettingsTabId === 'umum' ||
    controller.activeSettingsTabId === 'ai' ||
    controller.activeSettingsTabId === 'sitemap';

  return (
    <KolamPanelFrame variant="settingsSurface">
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <KolamSurfacePanelCopy title={title} description={description} />
        </View>
        {showHeaderSaveAction ? (
          <View style={styles.headerAction}>
            <KolamActionControlButton
              label="Simpan"
              loading={controller.webSettingSaveStatus === 'saving'}
              loadingLabel="Menyimpan..."
              intent="primary"
              onPress={
                controller.webSettingSaveStatus === 'saving'
                  ? undefined
                  : () => {
                      void controller.saveWebSetting();
                    }
              }
            />
            {controller.webSettingMessage ? (
              <KolamCopyStack
                containerStyle={styles.headerMessage}
                items={[
                  {
                    id: 'settings-save-message',
                    text: controller.webSettingMessage,
                    style: styles.headerMessageText,
                  },
                ]}
              />
            ) : null}
          </View>
        ) : null}
      </View>
      <KolamSettingsSurfaceBody controller={controller} />
    </KolamPanelFrame>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    alignItems: 'flex-end',
    gap: 6,
  },
  headerCopy: {
    flex: 1,
    minWidth: 260,
  },
  headerMessage: {
    maxWidth: 360,
  },
  headerMessageText: {
    color: '#6b7280',
    fontSize: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
