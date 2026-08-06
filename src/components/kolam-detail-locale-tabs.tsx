import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamLabelFieldDetailSectionItem } from './kolam-label-field-detail-overview';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamStatusBadge } from './kolam-status-badge';

export interface KolamDetailLocaleField {
  label: string;
  value?: string | null;
}

export function KolamDetailLocaleTabs({
  emptyText = 'Belum ada data terjemahan.',
  items,
}: {
  emptyText?: string;
  items: KolamLabelFieldDetailSectionItem[];
}) {
  const [activeKey, setActiveKey] = React.useState(() =>
    getLocaleItemKey(items[0], 0),
  );

  React.useEffect(() => {
    if (!items.length) {
      setActiveKey('');
      return;
    }

    const keys = items.map(getLocaleItemKey);
    if (!keys.includes(activeKey)) {
      setActiveKey(keys[0]);
    }
  }, [activeKey, items]);

  if (!items.length) {
    return <Text style={styles.emptyText}>{emptyText}</Text>;
  }

  const safeActiveKey = activeKey || getLocaleItemKey(items[0], 0);
  const activeIndex = Math.max(
    0,
    items.findIndex(
      (item, index) => getLocaleItemKey(item, index) === safeActiveKey,
    ),
  );
  const activeItem = items[activeIndex] ?? items[0];
  const localeFields = activeItem.fields?.filter(field => field.label) ?? [];

  return (
    <View style={styles.stack}>
      <View style={styles.tabs}>
        {items.map((item, index) => {
          const key = getLocaleItemKey(item, index);
          const selected = key === safeActiveKey;
          const localeFlag = getLocaleFlag(item.badge ?? item.title);
          return (
            <KolamInteractionFrame
              accessibilityLabel={`Buka terjemahan ${item.title}`}
              key={key}
              onPress={() => setActiveKey(key)}
              selected={selected}
              style={[styles.tab, selected ? styles.tabActive : null]}
            >
              <Text
                style={[styles.tabText, selected ? styles.tabTextActive : null]}
              >
                {localeFlag || item.badge || item.title}
              </Text>
            </KolamInteractionFrame>
          );
        })}
      </View>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.title}>{activeItem.title}</Text>
          {activeItem.badge ? (
            <KolamStatusBadge
              intent="success"
              label={getLocaleFlag(activeItem.badge) || activeItem.badge}
            />
          ) : null}
        </View>
        {activeItem.meta ? (
          <LocaleContent muted value={activeItem.meta} />
        ) : null}
        {localeFields.length ? (
          <LocaleFieldList fields={localeFields} localeKey={safeActiveKey} />
        ) : activeItem.value ? (
          <LocaleContent value={activeItem.value} />
        ) : null}
      </View>
    </View>
  );
}

function LocaleFieldList({
  fields,
  localeKey,
}: {
  fields: KolamDetailLocaleField[];
  localeKey: string;
}) {
  const hasHtml = fields.some(field => containsHtmlMarkup(field.value));

  if (hasHtml) {
    return (
      <KolamHtmlContent
        html={createLocaleFieldsHtml(fields)}
        key={localeKey}
        style={styles.htmlContent}
      />
    );
  }

  return (
    <View style={styles.fieldGrid}>
      {fields.map(field => (
        <View key={field.label} style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>{field.label}</Text>
          {field.value?.trim() ? (
            <Text style={styles.value}>{field.value}</Text>
          ) : (
            <Text style={styles.emptyField}>-</Text>
          )}
        </View>
      ))}
    </View>
  );
}

function LocaleContent({
  muted = false,
  value,
}: {
  muted?: boolean;
  value: string;
}) {
  if (containsHtmlMarkup(value)) {
    return <KolamHtmlContent html={value} style={styles.htmlContent} />;
  }

  return (
    <Text style={[styles.value, muted ? styles.valueMuted : null]}>
      {value}
    </Text>
  );
}

function createLocaleFieldsHtml(fields: KolamDetailLocaleField[]) {
  return `<div class="locale-field-grid">${fields
    .map(field => {
      const value = field.value?.trim();
      return `<section class="locale-field-card"><div class="locale-field-label">${escapeHtml(
        field.label,
      )}</div><div class="locale-field-body">${
        value
          ? normalizeLocaleFieldValue(value)
          : '<span class="locale-empty">-</span>'
      }</div></section>`;
    })
    .join('')}</div>`;
}

function normalizeLocaleFieldValue(value: string) {
  if (containsHtmlMarkup(value)) {
    return value;
  }

  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLocaleItemKey(
  item: KolamLabelFieldDetailSectionItem | undefined,
  index: number,
) {
  return item ? `${item.badge ?? item.title}-${index}` : '';
}

function getLocaleFlag(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return '';
  }

  if (
    normalized === 'id' ||
    normalized === 'id-id' ||
    normalized === 'indonesia' ||
    normalized === 'indonesian' ||
    normalized === 'bahasa indonesia'
  ) {
    return '🇮🇩';
  }

  if (
    normalized === 'en' ||
    normalized === 'en-us' ||
    normalized === 'english' ||
    normalized === 'inggris'
  ) {
    return '🇺🇸';
  }

  if (normalized === 'en-gb' || normalized === 'gb' || normalized === 'uk') {
    return '🇬🇧';
  }

  if (normalized === 'ja' || normalized === 'jp' || normalized === 'japanese') {
    return '🇯🇵';
  }

  if (normalized === 'ko' || normalized === 'kr' || normalized === 'korean') {
    return '🇰🇷';
  }

  if (normalized === 'zh' || normalized === 'cn' || normalized === 'chinese') {
    return '🇨🇳';
  }

  return '';
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
    width: '100%',
  },
  tabs: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 54,
    paddingHorizontal: 12,
  },
  tabActive: {
    backgroundColor: '#16a34a',
  },
  tabText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  panel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
    width: '100%',
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  fieldGrid: {
    alignItems: 'stretch',
    gap: 10,
    width: '100%',
  },
  fieldCard: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
    width: '100%',
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  value: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  valueMuted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyField: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
  },
  htmlContent: {
    width: '100%',
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
});
