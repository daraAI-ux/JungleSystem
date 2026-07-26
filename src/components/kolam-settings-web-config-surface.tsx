import React from 'react';
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
};

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  onToggleMaintenanceMode,
  onToggleStorefrontEnabled,
  onSave,
  onWebTitleChange,
  readOnly = false,
  saveMessage,
  saveStatus,
  sections,
  setDraftField,
  storefrontEnabled,
  draft,
  webTitle,
}: {
  draft: WebSettingDraft;
  fields: SettingsWebConfigField[];
  maintenanceMode: boolean;
  onToggleMaintenanceMode: () => void;
  onToggleStorefrontEnabled: () => void;
  onSave: () => void;
  onWebTitleChange: (value: string) => void;
  readOnly?: boolean;
  saveMessage: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  sections: SettingsWebFormSection[];
  setDraftField: (key: keyof WebSettingDraft, value: string | boolean) => void;
  storefrontEnabled: boolean;
  webTitle: string;
}) {
  const disabled = readOnly || saveStatus === 'saving';

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
