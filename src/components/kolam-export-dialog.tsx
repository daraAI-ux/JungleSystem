import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  downloadKolamXlsxExport,
  fetchKolamExportCatalog,
  groupKolamExportFields,
  type KolamExportCatalog,
  type KolamExportField,
  type KolamExportMode,
} from '../services/kolam-export-api';
import { getLocalDataStore } from '../services/local-data-store';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamModalBackdrop } from './kolam-modal-backdrop';

interface KolamExportDialogProps {
  catalogEndpoint: string;
  catalogParams?: Record<string, string | number | boolean | undefined>;
  defaultPresetKey?: string;
  description?: string;
  downloadEndpoint: string;
  downloadParams?: Record<
    string,
    string | number | boolean | string[] | undefined
  >;
  filenameHint: string;
  onOpenChange: (open: boolean) => void;
  storageKey: string;
  title: string;
  visible: boolean;
}

interface PersistedExportState {
  fields: string[];
  mode: KolamExportMode;
}

const DEFAULT_MODE: KolamExportMode = 'doc';

export function KolamExportDialog({
  catalogEndpoint,
  catalogParams,
  defaultPresetKey,
  description,
  downloadEndpoint,
  downloadParams,
  filenameHint,
  onOpenChange,
  storageKey,
  title,
  visible,
}: KolamExportDialogProps) {
  const [catalog, setCatalog] = React.useState<KolamExportCatalog | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [mode, setMode] = React.useState<KolamExportMode>(DEFAULT_MODE);
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadCatalog = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const nextCatalog = await fetchKolamExportCatalog({
        endpoint: catalogEndpoint,
        params: catalogParams,
      });
      const initialState = await hydrateInitialExportState(
        nextCatalog,
        storageKey,
        defaultPresetKey,
      );
      setCatalog(nextCatalog);
      setSelected(new Set(initialState.fields));
      setMode(initialState.mode);
    } catch (loadError) {
      setError(getExportErrorMessage(loadError, 'Gagal memuat field export.'));
    } finally {
      setLoading(false);
    }
  }, [catalogEndpoint, catalogParams, defaultPresetKey, storageKey]);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    void loadCatalog();
  }, [loadCatalog, visible]);

  const groupedFields = React.useMemo(
    () => groupKolamExportFields(catalog?.fields ?? []),
    [catalog],
  );
  const validSelectedFields = React.useMemo(
    () => getSelectedFieldsForMode(catalog, selected, mode),
    [catalog, mode, selected],
  );
  const heavySelected = React.useMemo(
    () =>
      (catalog?.fields ?? []).filter(
        field => field.heavy && selected.has(field.key),
      ),
    [catalog, selected],
  );

  const close = () => {
    if (!downloading) {
      onOpenChange(false);
    }
  };

  const handleExport = async () => {
    if (!catalog) {
      return;
    }

    if (!validSelectedFields.length) {
      setError('Pilih setidaknya satu field yang valid untuk mode export ini.');
      return;
    }

    setDownloading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await downloadKolamXlsxExport({
        endpoint: downloadEndpoint,
        extraParams: { ...catalogParams, ...downloadParams },
        fields: validSelectedFields,
        filenameHint,
        mode,
      });
      await persistExportState(storageKey, {
        fields: validSelectedFields,
        mode,
      });
      setMessage(
        result.path
          ? `Export berhasil: ${result.path}`
          : `Export berhasil: ${result.name}`,
      );
      onOpenChange(false);
    } catch (downloadError) {
      setError(getExportErrorMessage(downloadError, 'Export gagal.'));
    } finally {
      setDownloading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <KolamModalBackdrop onPress={close} />
      <View accessibilityLabel={title} style={styles.dialog}>
        <View style={styles.header}>
          <KolamCopyStack
            items={[
              { id: 'title', text: title, style: styles.title },
              ...(description
                ? [
                    {
                      id: 'description',
                      text: description,
                      style: styles.description,
                    },
                  ]
                : []),
            ]}
          />
        </View>

        {loading ? (
          <KolamCopyStack
            items={[
              {
                id: 'loading',
                text: 'Memuat field catalog...',
                style: styles.mutedText,
              },
            ]}
          />
        ) : null}

        {error ? (
          <KolamCopyStack
            containerStyle={styles.errorBox}
            items={[{ id: 'error', text: error, style: styles.errorText }]}
          />
        ) : null}

        {message ? (
          <KolamCopyStack
            containerStyle={styles.successBox}
            items={[
              { id: 'message', text: message, style: styles.successText },
            ]}
          />
        ) : null}

        {catalog && !loading ? (
          <View style={styles.body}>
            <View style={styles.pinnedControls}>
              <ExportModeSwitcher
                mode={mode}
                onChange={setMode}
                supportsVariant={catalog.modes.includes('variant')}
              />
              <ExportPresetBar
                onApply={presetKey => {
                  const preset = catalog.presets[presetKey];
                  if (preset) {
                    setSelected(new Set(preset));
                  }
                }}
                onClear={() => setSelected(new Set())}
                presets={catalog.presets}
              />
              {heavySelected.length ? (
                <KolamCopyStack
                  containerStyle={styles.warningBox}
                  items={[
                    {
                      id: 'warning',
                      text: `Perhatian: ${
                        heavySelected.length
                      } field berat dipilih (${heavySelected
                        .map(field => field.header)
                        .join(', ')}). File XLSX bisa besar.`,
                      style: styles.warningText,
                    },
                  ]}
                />
              ) : null}
            </View>

            <View style={styles.fieldArea}>
              <ScrollView
                contentContainerStyle={styles.fieldScrollContent}
                keyboardShouldPersistTaps="handled"
                style={styles.fieldScroll}
              >
                {groupedFields.map(group => (
                  <ExportFieldGroup
                    fields={group.fields}
                    group={group.group}
                    key={group.group}
                    onToggle={fieldKey => {
                      setSelected(current => {
                        const next = new Set(current);
                        if (next.has(fieldKey)) {
                          next.delete(fieldKey);
                        } else {
                          next.add(fieldKey);
                        }
                        return next;
                      });
                    }}
                    onToggleGroup={() => {
                      setSelected(current =>
                        toggleFieldGroup(current, group.fields),
                      );
                    }}
                    selected={selected}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <KolamCopyStack
            containerStyle={styles.footerMeta}
            items={[
              {
                id: 'count',
                text: catalog
                  ? `${validSelectedFields.length} / ${
                      catalog.fields.length
                    } field dipilih - max ${formatNumber(
                      catalog.maxRows,
                    )} baris`
                  : 'Field export belum dimuat.',
                style: styles.footerText,
              },
            ]}
          />
          <KolamCancelButton disabled={downloading} onPress={close} />
          <KolamButton
            disabled={downloading || loading || !validSelectedFields.length}
            intent="primary"
            label={downloading ? 'Mengekspor...' : 'Export XLSX'}
            onPress={() => {
              void handleExport();
            }}
          />
        </View>
      </View>
    </View>
  );
}

function ExportModeSwitcher({
  mode,
  onChange,
  supportsVariant,
}: {
  mode: KolamExportMode;
  onChange: (mode: KolamExportMode) => void;
  supportsVariant: boolean;
}) {
  return (
    <View style={styles.controlRow}>
      <KolamBadge intent="muted" label="Mode" shape="square" />
      <View style={styles.segmentGroup}>
        <KolamButton
          intent={mode === 'doc' ? 'primary' : 'plain'}
          label="Per Document"
          onPress={() => onChange('doc')}
          style={styles.segmentButton}
        />
        {supportsVariant ? (
          <KolamButton
            intent={mode === 'variant' ? 'primary' : 'plain'}
            label="Per Variant"
            onPress={() => onChange('variant')}
            style={styles.segmentButton}
          />
        ) : null}
      </View>
    </View>
  );
}

function ExportPresetBar({
  onApply,
  onClear,
  presets,
}: {
  onApply: (key: string) => void;
  onClear: () => void;
  presets: Record<string, string[]>;
}) {
  const keys = Object.keys(presets);
  if (!keys.length) {
    return null;
  }

  return (
    <View style={styles.controlRow}>
      <KolamBadge intent="muted" label="Preset" shape="square" />
      <View style={styles.presetButtons}>
        {keys.map(key => (
          <KolamButton
            key={key}
            label={formatPresetLabel(key)}
            onPress={() => onApply(key)}
            style={styles.presetButton}
          />
        ))}
        <KolamButton intent="plain" label="Clear" onPress={onClear} />
      </View>
    </View>
  );
}

function ExportFieldGroup({
  fields,
  group,
  onToggle,
  onToggleGroup,
  selected,
}: {
  fields: KolamExportField[];
  group: string;
  onToggle: (fieldKey: string) => void;
  onToggleGroup: () => void;
  selected: Set<string>;
}) {
  const allSelected = fields.every(field => selected.has(field.key));
  const someSelected = fields.some(field => selected.has(field.key));

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldGroupHeader}>
        <KolamCopyStack
          items={[{ id: 'group', text: group, style: styles.groupTitle }]}
        />
        <KolamButton
          intent="plain"
          label={
            allSelected
              ? 'Clear group'
              : someSelected
              ? 'Select all'
              : 'Select all'
          }
          onPress={onToggleGroup}
        />
      </View>
      <View style={styles.fieldGrid}>
        {fields.map(field => {
          const checked = selected.has(field.key);
          return (
            <KolamButton
              intent={checked ? 'primary' : 'outline'}
              key={field.key}
              label={`${checked ? '✓ ' : ''}${field.header}${
                field.heavy ? ' · heavy' : ''
              }`}
              onPress={() => onToggle(field.key)}
              style={styles.fieldButton}
              textStyle={styles.fieldButtonText}
            />
          );
        })}
      </View>
    </View>
  );
}

function getSelectedFieldsForMode(
  catalog: KolamExportCatalog | null,
  selected: Set<string>,
  mode: KolamExportMode,
) {
  if (!catalog) {
    return [];
  }

  return catalog.fields
    .filter(field => selected.has(field.key))
    .filter(
      field =>
        field.level === 'both' ||
        field.level === mode ||
        (mode === 'variant' && field.level === 'doc'),
    )
    .map(field => field.key);
}

function toggleFieldGroup(selected: Set<string>, fields: KolamExportField[]) {
  const allSelected = fields.every(field => selected.has(field.key));
  const next = new Set(selected);
  fields.forEach(field => {
    if (allSelected) {
      next.delete(field.key);
    } else {
      next.add(field.key);
    }
  });
  return next;
}

async function hydrateInitialExportState(
  catalog: KolamExportCatalog,
  storageKey: string,
  defaultPresetKey: string | undefined,
): Promise<PersistedExportState> {
  const persisted = await readPersistedExportState(storageKey);
  if (persisted) {
    const validFields = persisted.fields.filter(fieldKey =>
      catalog.fields.some(field => field.key === fieldKey),
    );
    const validMode = catalog.modes.includes(persisted.mode)
      ? persisted.mode
      : DEFAULT_MODE;
    if (validFields.length) {
      return { fields: validFields, mode: validMode };
    }
  }

  const presetKey =
    defaultPresetKey && catalog.presets[defaultPresetKey]
      ? defaultPresetKey
      : Object.keys(catalog.presets)[0];
  return {
    fields: presetKey ? catalog.presets[presetKey] ?? [] : [],
    mode: DEFAULT_MODE,
  };
}

async function readPersistedExportState(storageKey: string) {
  const record = await getLocalDataStore().read<PersistedExportState>(
    getExportStorageKey(storageKey),
  );
  if (!record?.value || !Array.isArray(record.value.fields)) {
    return null;
  }

  if (record.value.mode !== 'doc' && record.value.mode !== 'variant') {
    return null;
  }

  return record.value;
}

async function persistExportState(
  storageKey: string,
  value: PersistedExportState,
) {
  await getLocalDataStore().write({
    key: getExportStorageKey(storageKey),
    revision: `${Date.now()}`,
    updatedAt: new Date().toISOString(),
    value,
  });
}

function getExportStorageKey(storageKey: string) {
  return `export:${storageKey}`;
}

function getExportErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const record = error as {
      payload?: { message?: string };
      message?: string;
    };
    return record.payload?.message ?? record.message ?? fallback;
  }

  return fallback;
}

function formatPresetLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, value => value.toUpperCase())
    .trim();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    bottom: 0,
    elevation: 1400,
    justifyContent: 'center',
    left: 0,
    padding: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 140000,
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1401,
    gap: 12,
    height: 560,
    maxWidth: '88%',
    padding: 16,
    shadowColor: V.colors.fg,
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: 780,
    zIndex: 140001,
  },
  header: {
    gap: 8,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  description: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 4,
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  errorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  successText: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  body: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  pinnedControls: {
    flexShrink: 0,
    gap: 10,
  },
  controlRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segmentGroup: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 2,
    padding: 2,
  },
  segmentButton: {
    borderRadius: 999,
  },
  presetButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    borderRadius: 999,
  },
  warningBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  warningText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  fieldArea: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 180,
    overflow: 'hidden',
  },
  fieldScroll: {
    flex: 1,
  },
  fieldScrollContent: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 8,
  },
  fieldGroup: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  fieldGroupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldButton: {
    flexBasis: 250,
    flexGrow: 1,
    justifyContent: 'flex-start',
    minHeight: 36,
  },
  fieldButtonText: {
    textAlign: 'left',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    flexShrink: 0,
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
