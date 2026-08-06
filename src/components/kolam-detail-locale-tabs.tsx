import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { KolamCountryFlagOption } from '../domain/kolam-country-flags';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamLabelFieldDetailSectionItem } from './kolam-label-field-detail-overview';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { KolamFlagIcon } from './kolam-flag-icon';
import { KolamInteractionFrame } from './kolam-interaction-frame';

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
  const activeLocaleFlag = getLocaleFlagOption(activeItem.badge);

  return (
    <View style={styles.stack}>
      <View style={styles.tabs}>
        {items.map((item, index) => {
          const key = getLocaleItemKey(item, index);
          const selected = key === safeActiveKey;
          const localeFlag = getLocaleFlagOption(item.badge ?? item.title);
          return (
            <KolamInteractionFrame
              accessibilityLabel={`Buka terjemahan ${item.title}`}
              key={key}
              onPress={() => setActiveKey(key)}
              selected={selected}
              style={[styles.tab, selected ? styles.tabActive : null]}
            >
              {localeFlag ? (
                <KolamFlagIcon option={localeFlag} />
              ) : (
                <Text
                  style={[
                    styles.tabText,
                    selected ? styles.tabTextActive : null,
                  ]}
                >
                  {item.badge || item.title}
                </Text>
              )}
            </KolamInteractionFrame>
          );
        })}
      </View>
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.title}>{activeItem.title}</Text>
          {activeLocaleFlag ? (
            <KolamFlagIcon option={activeLocaleFlag} size="md" />
          ) : activeItem.badge ? (
            <Text style={styles.panelBadgeFallback}>{activeItem.badge}</Text>
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

function getLocaleFlagOption(
  value: string | undefined,
): KolamCountryFlagOption | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (
    normalized === 'id' ||
    normalized === 'id-id' ||
    normalized === 'indonesia' ||
    normalized === 'indonesian' ||
    normalized === 'bahasa indonesia'
  ) {
    return createLocaleFlagOption('ID', 'Indonesia');
  }

  if (
    normalized === 'en' ||
    normalized === 'en-us' ||
    normalized === 'english' ||
    normalized === 'inggris'
  ) {
    return createLocaleFlagOption('US', 'English');
  }

  if (normalized === 'en-gb' || normalized === 'gb' || normalized === 'uk') {
    return createLocaleFlagOption('GB', 'English');
  }

  if (normalized === 'ja' || normalized === 'jp' || normalized === 'japanese') {
    return createLocaleFlagOption('JP', 'Japanese');
  }

  if (normalized === 'ko' || normalized === 'kr' || normalized === 'korean') {
    return createLocaleFlagOption('KR', 'Korean');
  }

  if (normalized === 'zh' || normalized === 'cn' || normalized === 'chinese') {
    return createLocaleFlagOption('CN', 'Chinese');
  }

  return null;
}

function createLocaleFlagOption(
  code: string,
  country: string,
): KolamCountryFlagOption {
  return {
    code,
    country,
    flag: code,
    imageUrl: null,
  };
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
  panelBadgeFallback: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
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
