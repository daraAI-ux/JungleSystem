import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {
  SettingsWebConfigField,
  SettingsWebFormSection,
} from '../domain/settings-surface';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamSettingsWebFormSections} from './kolam-settings-web-widgets';
import {KolamTextFieldRow} from './kolam-text-field-row';
import {KolamToggleRow} from './kolam-toggle-row';
import type {
  KolamNotificationSoundType,
  KolamPluginConfigKey,
} from '../services/kolam-api';

type WebSettingDraft = {
  versionKolam: string;
  versionEnclonura: string;
  versionPos: string;
  versionMarketplace: string;
  companyName: string;
  companyTagline: string;
  address: string;
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  maintenancePos: boolean;
  maintenanceMarketplace: boolean;
  livechatOnline: boolean;
  originAddressLine1: string;
  originCity: string;
  originProvince: string;
  originPostalCode: string;
  originLatitude: string;
  originLongitude: string;
  staffDesktopOnlyEnabled: boolean;
  staffDesktopOnlyRedirectUrl: string;
  kolamMacAccessEnabled: boolean;
  kolamMacAccessAllowWebBrowser: boolean;
  kolamMacAccessBypassSuperAdmin: boolean;
  kolamMacAccessAllowedMacAddresses: string;
  staffOtpLoginEnabled: boolean;
  staffOtpExpireMinutes: string;
  staffOtpResendCooldownSeconds: string;
  staffOtpMaxAttempts: string;
  staffOtpLockMinutes: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpSecure: boolean;
  firebaseEnabled: boolean;
  firebaseProjectId: string;
  firebaseClientEmail: string;
  firebasePrivateKey: string;
  chatStoreEnabled: boolean;
  teamChatGroupCallEnabled: boolean;
  daraBusinessEnabled: boolean;
  daraToolsEnabled: boolean;
  daraKnowledgeEnabled: boolean;
  daraHandoffNotifyEnabled: boolean;
  daraInsightsEnabled: boolean;
  daraAutoReportEnabled: boolean;
  daraImageAnalysisEnabled: boolean;
  daraTaxEnabled: boolean;
  daraSeoEnabled: boolean;
  daraTaxRegulationWatcherEnabled: boolean;
  daraTaxComplianceJobEnabled: boolean;
  daraTaxLlmNarrativeEnabled: boolean;
  daraWebstoreFulfillmentEnabled: boolean;
  daraStaffOpsNotifyEnabled: boolean;
  daraStaffWaNotifyEnabled: boolean;
  daraOlshopCustomerNotifyEnabled: boolean;
  daraOwnerDigestEnabled: boolean;
  daraOwnerDigestWaEnabled: boolean;
  daraOwnerDigestFcmEnabled: boolean;
  daraOwnerFcmUrgentEnabled: boolean;
  notificationSound: string;
  unassignedNotificationSound: string;
  handoffNotificationSound: string;
  groupCallRingtone: string;
  salesNotificationSound: string;
  pluginControls: Record<KolamPluginConfigKey, boolean>;
};

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  onToggleMaintenanceMode,
  onToggleStorefrontEnabled,
  onSave,
  onDeleteNotificationSound,
  onPluginControlChange,
  onUploadNotificationSound,
  onWebTitleChange,
  readOnly = false,
  saveMessage,
  saveStatus,
  sections,
  setDraftField,
  storefrontEnabled,
  draft,
  notificationSoundStatus,
  webTitle,
}: {
  draft: WebSettingDraft;
  fields: SettingsWebConfigField[];
  maintenanceMode: boolean;
  onToggleMaintenanceMode: () => void;
  onToggleStorefrontEnabled: () => void;
  onSave: () => void;
  onDeleteNotificationSound: (type: KolamNotificationSoundType) => void;
  onPluginControlChange: (key: KolamPluginConfigKey, enabled: boolean) => void;
  onUploadNotificationSound: (type: KolamNotificationSoundType) => void;
  onWebTitleChange: (value: string) => void;
  notificationSoundStatus: Partial<
    Record<KolamNotificationSoundType, 'idle' | 'uploading' | 'deleting'>
  >;
  readOnly?: boolean;
  saveMessage: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  sections: SettingsWebFormSection[];
  setDraftField: (key: keyof WebSettingDraft, value: string | boolean) => void;
  storefrontEnabled: boolean;
  webTitle: string;
}) {
  const disabled = readOnly || saveStatus === 'saving';
  const notificationSoundItems = [
    {
      id: 'notification-sound',
      label: 'Notification sound',
      type: 'assigned' as const,
      value: draft.notificationSound,
    },
    {
      id: 'unassigned-notification-sound',
      label: 'Unassigned sound',
      type: 'unassigned' as const,
      value: draft.unassignedNotificationSound,
    },
    {
      id: 'handoff-notification-sound',
      label: 'Handoff sound',
      type: 'handoff' as const,
      value: draft.handoffNotificationSound,
    },
    {
      id: 'group-call-ringtone',
      label: 'Group call ringtone',
      type: 'group-call' as const,
      value: draft.groupCallRingtone,
    },
    {
      id: 'sales-notification-sound',
      label: 'Sales sound',
      type: 'sales' as const,
      value: draft.salesNotificationSound,
    },
  ];

  return (
    <KolamContentFrame variant="settingsWebConfig">
      <KolamTextFieldRow
        label={fields[0].label}
        description={fields[0].description}
        value={draft.companyName || webTitle}
        onChangeText={value => {
          if (disabled) {
            return;
          }
          setDraftField('companyName', value);
          onWebTitleChange(value);
        }}
        placeholder="Storefront title"
      />
      <KolamTextFieldRow
        label="Company Tagline"
        description="Tagline branding yang tampil di storefront."
        value={draft.companyTagline}
        onChangeText={value => setDraftField('companyTagline', value)}
        placeholder="Your trusted pet store"
      />
      <KolamTextFieldRow
        label="Kolam Version"
        description="Disimpan melalui PUT /websetting/version untuk app kolam."
        value={draft.versionKolam}
        onChangeText={value => setDraftField('versionKolam', value)}
        placeholder="1.0.0"
      />
      <KolamTextFieldRow
        label="Enclonura Version"
        description="Disimpan melalui endpoint version app enclonura."
        value={draft.versionEnclonura}
        onChangeText={value => setDraftField('versionEnclonura', value)}
        placeholder="1.0.0"
      />
      <KolamTextFieldRow
        label="POS Version"
        description="Disimpan melalui endpoint version app pos."
        value={draft.versionPos}
        onChangeText={value => setDraftField('versionPos', value)}
        placeholder="1.0.0"
      />
      <KolamTextFieldRow
        label="Marketplace Version"
        description="Disimpan melalui endpoint version app marketplace."
        value={draft.versionMarketplace}
        onChangeText={value => setDraftField('versionMarketplace', value)}
        placeholder="1.0.0"
      />
      <KolamTextFieldRow
        label="Phone"
        description="Nomor kontak customer."
        value={draft.phone}
        onChangeText={value => setDraftField('phone', value)}
        placeholder="+62 812-3456-7890"
      />
      <KolamTextFieldRow
        label="Email"
        description="Email kontak customer."
        value={draft.email}
        onChangeText={value => setDraftField('email', value)}
        placeholder="info@duniaanura.com"
      />
      <KolamTextFieldRow
        label="Address"
        description="Alamat bisnis utama."
        value={draft.address}
        onChangeText={value => setDraftField('address', value)}
        placeholder="Jl. Contoh No. 1"
      />
      <KolamToggleRow
        label={fields[1].label}
        description={fields[1].description}
        active={draft.livechatOnline}
        onPress={() => {
          if (disabled) {
            return;
          }
          setDraftField('livechatOnline', !draft.livechatOnline);
          onToggleStorefrontEnabled();
        }}
      />
      <KolamToggleRow
        label={fields[2].label}
        description={fields[2].description}
        active={draft.maintenancePos}
        onPress={() => {
          if (disabled) {
            return;
          }
          setDraftField('maintenancePos', !draft.maintenancePos);
          onToggleMaintenanceMode();
        }}
      />
      <KolamToggleRow
        label="Marketplace maintenance"
        description="Aktifkan mode pemeliharaan untuk Marketplace."
        active={draft.maintenanceMarketplace}
        onPress={() =>
          !disabled &&
          setDraftField('maintenanceMarketplace', !draft.maintenanceMarketplace)
        }
      />
      <KolamTextFieldRow
        label="Origin Address"
        description="Alamat asal pengiriman."
        value={draft.originAddressLine1}
        onChangeText={value => setDraftField('originAddressLine1', value)}
        placeholder="Jl. Taman Ratu Raya No.34"
      />
      <KolamTextFieldRow
        label="Origin City"
        description="Kota asal pengiriman."
        value={draft.originCity}
        onChangeText={value => setDraftField('originCity', value)}
        placeholder="Jakarta Barat"
      />
      <KolamTextFieldRow
        label="Origin Province"
        description="Provinsi asal pengiriman."
        value={draft.originProvince}
        onChangeText={value => setDraftField('originProvince', value)}
        placeholder="DKI Jakarta"
      />
      <KolamTextFieldRow
        label="Origin Postal Code"
        description="Kode pos asal pengiriman."
        value={draft.originPostalCode}
        onChangeText={value => setDraftField('originPostalCode', value)}
        placeholder="11550"
      />
      <KolamTextFieldRow
        label="Origin Latitude"
        description="Koordinat latitude origin."
        value={draft.originLatitude}
        onChangeText={value => setDraftField('originLatitude', value)}
        placeholder="-6.1687829"
      />
      <KolamTextFieldRow
        label="Origin Longitude"
        description="Koordinat longitude origin."
        value={draft.originLongitude}
        onChangeText={value => setDraftField('originLongitude', value)}
        placeholder="106.7676678"
      />
      <KolamTextFieldRow
        label="Facebook"
        description="Link Facebook storefront."
        value={draft.facebook}
        onChangeText={value => setDraftField('facebook', value)}
        placeholder="https://facebook.com/..."
      />
      <KolamTextFieldRow
        label="Instagram"
        description="Link Instagram storefront."
        value={draft.instagram}
        onChangeText={value => setDraftField('instagram', value)}
        placeholder="https://instagram.com/..."
      />
      <KolamTextFieldRow
        label="Twitter"
        description="Link Twitter/X storefront."
        value={draft.twitter}
        onChangeText={value => setDraftField('twitter', value)}
        placeholder="https://twitter.com/..."
      />
      <KolamTextFieldRow
        label="YouTube"
        description="Link YouTube storefront."
        value={draft.youtube}
        onChangeText={value => setDraftField('youtube', value)}
        placeholder="https://youtube.com/..."
      />
      <KolamTextFieldRow
        label="TikTok"
        description="Link TikTok storefront."
        value={draft.tiktok}
        onChangeText={value => setDraftField('tiktok', value)}
        placeholder="https://tiktok.com/..."
      />
      <KolamToggleRow
        label="Staff desktop only"
        description="Batasi staff ke aplikasi desktop sesuai policy BE."
        active={draft.staffDesktopOnlyEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'staffDesktopOnlyEnabled',
            !draft.staffDesktopOnlyEnabled,
          )
        }
      />
      <KolamTextFieldRow
        label="Staff redirect URL"
        description="URL redirect jika staff desktop-only aktif."
        value={draft.staffDesktopOnlyRedirectUrl}
        onChangeText={value => setDraftField('staffDesktopOnlyRedirectUrl', value)}
        placeholder="https://..."
      />
      <KolamToggleRow
        label="MAC access"
        description="Batasi akses Kolam berdasarkan daftar MAC address."
        active={draft.kolamMacAccessEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('kolamMacAccessEnabled', !draft.kolamMacAccessEnabled)
        }
      />
      <KolamToggleRow
        label="Allow web browser"
        description="Izinkan browser web tetap masuk saat MAC access aktif."
        active={draft.kolamMacAccessAllowWebBrowser}
        onPress={() =>
          !disabled &&
          setDraftField(
            'kolamMacAccessAllowWebBrowser',
            !draft.kolamMacAccessAllowWebBrowser,
          )
        }
      />
      <KolamToggleRow
        label="Bypass super admin"
        description="Super admin tidak diblokir oleh validasi MAC."
        active={draft.kolamMacAccessBypassSuperAdmin}
        onPress={() =>
          !disabled &&
          setDraftField(
            'kolamMacAccessBypassSuperAdmin',
            !draft.kolamMacAccessBypassSuperAdmin,
          )
        }
      />
      <KolamTextFieldRow
        label="Allowed MAC addresses"
        description="Pisahkan dengan koma atau baris baru."
        value={draft.kolamMacAccessAllowedMacAddresses}
        onChangeText={value =>
          setDraftField('kolamMacAccessAllowedMacAddresses', value)
        }
        placeholder="AA:BB:CC:DD:EE:FF"
      />
      <KolamToggleRow
        label="Staff OTP login"
        description="Aktifkan OTP untuk login staff produksi."
        active={draft.staffOtpLoginEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('staffOtpLoginEnabled', !draft.staffOtpLoginEnabled)
        }
      />
      <KolamTextFieldRow
        label="OTP expire minutes"
        description="Durasi OTP aktif sebelum kadaluarsa."
        value={draft.staffOtpExpireMinutes}
        onChangeText={value => setDraftField('staffOtpExpireMinutes', value)}
        placeholder="10"
      />
      <KolamTextFieldRow
        label="OTP resend cooldown"
        description="Jeda detik sebelum OTP boleh dikirim ulang."
        value={draft.staffOtpResendCooldownSeconds}
        onChangeText={value =>
          setDraftField('staffOtpResendCooldownSeconds', value)
        }
        placeholder="60"
      />
      <KolamTextFieldRow
        label="OTP max attempts"
        description="Batas percobaan OTP sebelum lock."
        value={draft.staffOtpMaxAttempts}
        onChangeText={value => setDraftField('staffOtpMaxAttempts', value)}
        placeholder="5"
      />
      <KolamTextFieldRow
        label="OTP lock minutes"
        description="Durasi lock setelah percobaan OTP melewati batas."
        value={draft.staffOtpLockMinutes}
        onChangeText={value => setDraftField('staffOtpLockMinutes', value)}
        placeholder="15"
      />
      <KolamTextFieldRow
        label="SMTP host"
        description="Host SMTP untuk email system."
        value={draft.smtpHost}
        onChangeText={value => setDraftField('smtpHost', value)}
        placeholder="smtp.gmail.com"
      />
      <KolamTextFieldRow
        label="SMTP port"
        description="Port SMTP produksi."
        value={draft.smtpPort}
        onChangeText={value => setDraftField('smtpPort', value)}
        placeholder="465"
      />
      <KolamTextFieldRow
        label="SMTP user"
        description="Username SMTP."
        value={draft.smtpUser}
        onChangeText={value => setDraftField('smtpUser', value)}
        placeholder="mailer@duniaanura.com"
      />
      <KolamTextFieldRow
        label="SMTP password"
        description="Biarkan ******** agar secret BE tidak dikirim ulang."
        value={draft.smtpPass}
        onChangeText={value => setDraftField('smtpPass', value)}
        placeholder="********"
      />
      <KolamTextFieldRow
        label="SMTP from email"
        description="Alamat pengirim email system."
        value={draft.smtpFromEmail}
        onChangeText={value => setDraftField('smtpFromEmail', value)}
        placeholder="no-reply@duniaanura.com"
      />
      <KolamTextFieldRow
        label="SMTP from name"
        description="Nama pengirim email system."
        value={draft.smtpFromName}
        onChangeText={value => setDraftField('smtpFromName', value)}
        placeholder="Kolam"
      />
      <KolamToggleRow
        label="SMTP secure"
        description="Gunakan koneksi SMTP secure."
        active={draft.smtpSecure}
        onPress={() =>
          !disabled && setDraftField('smtpSecure', !draft.smtpSecure)
        }
      />
      <KolamToggleRow
        label="Firebase"
        description="Aktifkan Firebase Admin untuk notifikasi."
        active={draft.firebaseEnabled}
        onPress={() =>
          !disabled && setDraftField('firebaseEnabled', !draft.firebaseEnabled)
        }
      />
      <KolamTextFieldRow
        label="Firebase project ID"
        description="Project ID Firebase produksi."
        value={draft.firebaseProjectId}
        onChangeText={value => setDraftField('firebaseProjectId', value)}
        placeholder="dunia-anura"
      />
      <KolamTextFieldRow
        label="Firebase client email"
        description="Client email service account."
        value={draft.firebaseClientEmail}
        onChangeText={value => setDraftField('firebaseClientEmail', value)}
        placeholder="firebase-adminsdk@..."
      />
      <KolamTextFieldRow
        label="Firebase private key"
        description="Biarkan ******** agar private key BE tidak dikirim ulang."
        value={draft.firebasePrivateKey}
        onChangeText={value => setDraftField('firebasePrivateKey', value)}
        placeholder="********"
      />
      <KolamToggleRow
        label="Chat store"
        description="Aktifkan chat pada storefront."
        active={draft.chatStoreEnabled}
        onPress={() =>
          !disabled && setDraftField('chatStoreEnabled', !draft.chatStoreEnabled)
        }
      />
      <KolamToggleRow
        label="Team chat group call"
        description="Aktifkan panggilan grup di team chat."
        active={draft.teamChatGroupCallEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'teamChatGroupCallEnabled',
            !draft.teamChatGroupCallEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA business"
        description="Aktifkan fitur bisnis DARA."
        active={draft.daraBusinessEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraBusinessEnabled', !draft.daraBusinessEnabled)
        }
      />
      <KolamToggleRow
        label="DARA tools"
        description="Aktifkan tool runtime DARA."
        active={draft.daraToolsEnabled}
        onPress={() =>
          !disabled && setDraftField('daraToolsEnabled', !draft.daraToolsEnabled)
        }
      />
      <KolamToggleRow
        label="DARA knowledge"
        description="Aktifkan knowledge base DARA."
        active={draft.daraKnowledgeEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraKnowledgeEnabled', !draft.daraKnowledgeEnabled)
        }
      />
      <KolamToggleRow
        label="DARA tax"
        description="Aktifkan modul pajak DARA."
        active={draft.daraTaxEnabled}
        onPress={() =>
          !disabled && setDraftField('daraTaxEnabled', !draft.daraTaxEnabled)
        }
      />
      <KolamToggleRow
        label="DARA SEO"
        description="Aktifkan fitur SEO DARA."
        active={draft.daraSeoEnabled}
        onPress={() =>
          !disabled && setDraftField('daraSeoEnabled', !draft.daraSeoEnabled)
        }
      />
      <KolamToggleRow
        label="DARA handoff notify"
        description="Kirim notifikasi saat handoff customer."
        active={draft.daraHandoffNotifyEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraHandoffNotifyEnabled',
            !draft.daraHandoffNotifyEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA insights"
        description="Aktifkan insight otomatis DARA."
        active={draft.daraInsightsEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraInsightsEnabled', !draft.daraInsightsEnabled)
        }
      />
      <KolamToggleRow
        label="DARA auto report"
        description="Aktifkan laporan otomatis DARA."
        active={draft.daraAutoReportEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraAutoReportEnabled', !draft.daraAutoReportEnabled)
        }
      />
      <KolamToggleRow
        label="DARA image analysis"
        description="Aktifkan analisis gambar DARA."
        active={draft.daraImageAnalysisEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraImageAnalysisEnabled',
            !draft.daraImageAnalysisEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA tax watcher"
        description="Pantau regulasi pajak secara otomatis."
        active={draft.daraTaxRegulationWatcherEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraTaxRegulationWatcherEnabled',
            !draft.daraTaxRegulationWatcherEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA tax compliance"
        description="Aktifkan job kepatuhan pajak."
        active={draft.daraTaxComplianceJobEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraTaxComplianceJobEnabled',
            !draft.daraTaxComplianceJobEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA tax narrative"
        description="Aktifkan narasi LLM untuk pajak."
        active={draft.daraTaxLlmNarrativeEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraTaxLlmNarrativeEnabled',
            !draft.daraTaxLlmNarrativeEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA fulfillment"
        description="Aktifkan fulfillment webstore DARA."
        active={draft.daraWebstoreFulfillmentEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraWebstoreFulfillmentEnabled',
            !draft.daraWebstoreFulfillmentEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA staff ops"
        description="Aktifkan notifikasi operasional staff."
        active={draft.daraStaffOpsNotifyEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraStaffOpsNotifyEnabled',
            !draft.daraStaffOpsNotifyEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA staff WhatsApp"
        description="Aktifkan notifikasi WhatsApp staff."
        active={draft.daraStaffWaNotifyEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraStaffWaNotifyEnabled', !draft.daraStaffWaNotifyEnabled)
        }
      />
      <KolamToggleRow
        label="DARA olshop notify"
        description="Aktifkan notifikasi customer olshop."
        active={draft.daraOlshopCustomerNotifyEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraOlshopCustomerNotifyEnabled',
            !draft.daraOlshopCustomerNotifyEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA owner digest"
        description="Aktifkan ringkasan owner."
        active={draft.daraOwnerDigestEnabled}
        onPress={() =>
          !disabled &&
          setDraftField('daraOwnerDigestEnabled', !draft.daraOwnerDigestEnabled)
        }
      />
      <KolamToggleRow
        label="DARA owner WhatsApp"
        description="Kirim digest owner melalui WhatsApp."
        active={draft.daraOwnerDigestWaEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraOwnerDigestWaEnabled',
            !draft.daraOwnerDigestWaEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA owner FCM"
        description="Kirim digest owner melalui FCM."
        active={draft.daraOwnerDigestFcmEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraOwnerDigestFcmEnabled',
            !draft.daraOwnerDigestFcmEnabled,
          )
        }
      />
      <KolamToggleRow
        label="DARA urgent FCM"
        description="Kirim notifikasi urgent owner melalui FCM."
        active={draft.daraOwnerFcmUrgentEnabled}
        onPress={() =>
          !disabled &&
          setDraftField(
            'daraOwnerFcmUrgentEnabled',
            !draft.daraOwnerFcmUrgentEnabled,
          )
        }
      />
      <View style={styles.notificationSoundList}>
        {notificationSoundItems.map(item => {
          const status = notificationSoundStatus[item.type] ?? 'idle';
          const busy = status === 'uploading' || status === 'deleting';

          return (
            <View key={item.id} style={styles.notificationSoundRow}>
              <KolamCopyStack
                containerStyle={styles.notificationSoundCopy}
                items={[
                  {
                    id: `${item.id}-label`,
                    text: item.label,
                    style: styles.notificationSoundLabel,
                  },
                  {
                    id: `${item.id}-path`,
                    text: item.value || '-',
                    style: styles.notificationSoundPath,
                  },
                ]}
              />
              <View style={styles.notificationSoundActions}>
                <KolamActionControlButton
                  label="Upload"
                  loading={status === 'uploading'}
                  loadingLabel="Uploading..."
                  disabled={disabled || busy}
                  onPress={() => onUploadNotificationSound(item.type)}
                />
                <KolamActionControlButton
                  label="Reset"
                  intent="danger"
                  loading={status === 'deleting'}
                  loadingLabel="Resetting..."
                  disabled={disabled || busy || !item.value}
                  onPress={() => onDeleteNotificationSound(item.type)}
                />
              </View>
            </View>
          );
        })}
      </View>
      <KolamToggleRow
        label="Plugin Enclosure"
        description="Aktifkan route dan registry plugin enclosure."
        active={draft.pluginControls.enclosure}
        onPress={() =>
          !disabled &&
          onPluginControlChange('enclosure', !draft.pluginControls.enclosure)
        }
      />
      <KolamToggleRow
        label="Plugin Task Manager"
        description="Aktifkan route dan registry plugin manajemen tugas."
        active={draft.pluginControls.taskManager}
        onPress={() =>
          !disabled &&
          onPluginControlChange(
            'taskManager',
            !draft.pluginControls.taskManager,
          )
        }
      />
      <KolamToggleRow
        label="Plugin Layanan"
        description="Aktifkan route dan registry plugin layanan."
        active={draft.pluginControls.layanan}
        onPress={() =>
          !disabled &&
          onPluginControlChange('layanan', !draft.pluginControls.layanan)
        }
      />
      <KolamToggleRow
        label="Plugin Freyer"
        description="Aktifkan route dan registry plugin Freyer."
        active={draft.pluginControls.freyer}
        onPress={() =>
          !disabled &&
          onPluginControlChange('freyer', !draft.pluginControls.freyer)
        }
      />
      <KolamToggleRow
        label="Plugin KPI"
        description="Aktifkan route dan registry plugin KPI."
        active={draft.pluginControls.kpi}
        onPress={() =>
          !disabled &&
          onPluginControlChange('kpi', !draft.pluginControls.kpi)
        }
      />
      <KolamToggleRow
        label="Plugin Chat"
        description="Aktifkan route dan registry plugin chat."
        active={draft.pluginControls.chat}
        onPress={() =>
          !disabled &&
          onPluginControlChange('chat', !draft.pluginControls.chat)
        }
      />
      <KolamToggleRow
        label="Plugin DARA"
        description="Aktifkan route dan registry plugin DARA."
        active={draft.pluginControls.dara}
        onPress={() =>
          !disabled &&
          onPluginControlChange('dara', !draft.pluginControls.dara)
        }
      />
      <KolamToggleRow
        label="Plugin Proyek"
        description="Aktifkan route dan registry plugin proyek."
        active={draft.pluginControls.proyek}
        onPress={() =>
          !disabled &&
          onPluginControlChange('proyek', !draft.pluginControls.proyek)
        }
      />
      <KolamActionControlButton
        label="Save"
        loading={saveStatus === 'saving'}
        loadingLabel="Saving..."
        intent="primary"
        onPress={disabled ? undefined : onSave}
      />
      {saveMessage ? (
        <KolamCopyStack
          items={[
            {
              id: 'save-message',
              text: saveMessage,
            },
          ]}
        />
      ) : null}
      <KolamSettingsWebFormSections sections={sections} />
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  notificationSoundActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  notificationSoundCopy: {
    flex: 1,
    gap: 4,
    minWidth: 260,
  },
  notificationSoundLabel: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
  },
  notificationSoundList: {
    gap: 10,
  },
  notificationSoundPath: {
    color: '#6b7280',
    fontSize: 12,
  },
  notificationSoundRow: {
    alignItems: 'center',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
});
