import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamStatusBadge, type KolamStatusBadgeProps} from './kolam-status-badge';

export interface KolamLabelFieldMetric {
  label: string;
  value: string | number;
}

export interface KolamLabelFieldMeta {
  icon?: React.ReactNode;
  label: string;
  onPress?: () => void;
  value: string;
}

export interface KolamLabelFieldDetailSectionItem {
  badge?: string;
  meta?: string;
  thumbnail?: React.ReactNode;
  title: string;
  value?: string;
}

export interface KolamLabelFieldDetailSection {
  accordion?: boolean;
  description: string;
  emptyText: string;
  items?: KolamLabelFieldDetailSectionItem[];
  title: string;
  total: number;
}

export function KolamLabelFieldDetailOverview({
  hero,
  meta,
  metrics,
  sections,
  status,
}: {
  hero: React.ReactNode;
  meta: KolamLabelFieldMeta[];
  metrics: KolamLabelFieldMetric[];
  sections: KolamLabelFieldDetailSection[];
  status: Pick<KolamStatusBadgeProps, 'intent' | 'label'>;
}) {
  return (
    <View style={styles.stack}>
      <View style={styles.heroPanel}>
        <View style={styles.heroAsset}>{hero}</View>
        <View style={styles.heroContent}>
          <View style={styles.metricGrid}>
            <MetricTile
              label="Status"
              value={
                <KolamStatusBadge intent={status.intent} label={status.label} />
              }
            />
            {metrics.map(metric => (
              <MetricTile
                key={metric.label}
                label={metric.label}
                value={String(metric.value)}
              />
            ))}
          </View>
          <View style={styles.metaStack}>
            {meta.map(item => (
              <View key={`${item.label}-${item.value}`} style={styles.metaRow}>
                {item.icon ? <View style={styles.metaIcon}>{item.icon}</View> : null}
                {item.onPress ? (
                  <KolamInteractionFrame
                    accessibilityLabel={`Buka ${item.value}`}
                    onPress={item.onPress}
                    style={styles.metaLink}
                  >
                    <KolamCopyStack
                      containerStyle={styles.metaCopy}
                      items={[
                        {
                          id: 'text',
                          text: `${item.label}: ${item.value}`,
                          style: [styles.metaText, styles.metaLinkText],
                        },
                      ]}
                    />
                  </KolamInteractionFrame>
                ) : (
                  <KolamCopyStack
                    containerStyle={styles.metaCopy}
                    items={[
                      {
                        id: 'text',
                        text: `${item.label}: ${item.value}`,
                        style: styles.metaText,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.sectionGrid}>
        {sections.map(section => (
          <View
            key={section.title}
            style={[
              styles.sectionPanel,
              section.accordion ? styles.sectionPanelWide : null,
            ]}>
            <KolamCopyStack
              items={[
                {
                  id: 'title',
                  text: `${section.title} (${section.total})`,
                  style: styles.sectionTitle,
                },
                {
                  id: 'description',
                  text: section.description,
                  style: styles.sectionDescription,
                },
              ]}
            />
            <View style={styles.sectionBody}>
              <DetailSectionItems section={section} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.metricTile}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: styles.metricLabel,
          },
        ]}
      />
      <View style={styles.metricValueWrap}>
        {typeof value === 'string' ? (
          <KolamCopyStack
            items={[
              {
                id: 'value',
                text: value,
                style: styles.metricValue,
              },
            ]}
          />
        ) : (
          value
        )}
      </View>
    </View>
  );
}

function DetailSectionItems({
  section,
}: {
  section: KolamLabelFieldDetailSection;
}) {
  const [openKey, setOpenKey] = React.useState<string | null>(
    section.accordion && section.items?.length
      ? getDetailItemKey(section.items[0], 0)
      : null,
  );

  React.useEffect(() => {
    if (!section.accordion || !section.items?.length) {
      setOpenKey(null);
      return;
    }

    const keys = section.items.map(getDetailItemKey);
    if (!openKey || !keys.includes(openKey)) {
      setOpenKey(keys[0]);
    }
  }, [openKey, section.accordion, section.items]);

  if (!section.items?.length) {
    return (
      <KolamCopyStack
        items={[
          {
            id: 'empty',
            text: section.emptyText,
            style: styles.emptyText,
          },
        ]}
      />
    );
  }

  if (!section.accordion) {
    return (
      <View style={styles.itemList}>
        {section.items.map((item, index) => (
          <DetailListItem item={item} key={getDetailItemKey(item, index)} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.accordionList}>
      {section.items.map((item, index) => {
        const key = getDetailItemKey(item, index);
        const isOpen = openKey === key;

        return (
          <View key={key} style={styles.accordionItem}>
            <KolamInteractionFrame
              accessibilityLabel={`${isOpen ? 'Tutup' : 'Buka'} ${item.title}`}
              accessibilityState={{expanded: isOpen}}
              onPress={() => setOpenKey(isOpen ? null : key)}
              style={styles.accordionHeader}>
              <View style={styles.accordionHeaderCopy}>
                <KolamCopyStack
                  items={[
                    {
                      id: 'title',
                      text: item.title,
                      style: styles.itemTitle,
                    },
                    ...(item.value
                      ? [
                          {
                            id: 'value',
                            text: item.value,
                            style: styles.accordionSummary,
                          },
                        ]
                      : []),
                  ]}
                />
              </View>
              {item.badge ? (
                <KolamStatusBadge
                  intent={item.badge === 'Aktif' ? 'success' : 'muted'}
                  label={item.badge}
                />
              ) : null}
              <KolamCopyStack
                items={[
                  {
                    id: 'chevron',
                    text: isOpen ? '^' : 'v',
                    style: styles.accordionChevron,
                  },
                ]}
              />
            </KolamInteractionFrame>
            {isOpen ? (
              <View style={styles.accordionContent}>
                {item.thumbnail ? (
                  <View style={styles.itemThumbnail}>{item.thumbnail}</View>
                ) : null}
                <KolamCopyStack
                  containerStyle={styles.itemCopy}
                  items={[
                    ...(item.meta
                      ? [
                          {
                            id: 'meta',
                            text: item.meta,
                            style: styles.itemMeta,
                          },
                        ]
                      : []),
                    ...(item.value
                      ? [
                          {
                            id: 'value',
                            text: item.value,
                            style: styles.itemValue,
                          },
                        ]
                      : []),
                  ]}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function DetailListItem({item}: {item: KolamLabelFieldDetailSectionItem}) {
  return (
    <View style={styles.itemRow}>
      {item.thumbnail ? <View style={styles.itemThumbnail}>{item.thumbnail}</View> : null}
      <KolamCopyStack
        containerStyle={styles.itemCopy}
        items={[
          {
            id: 'title',
            text: item.title,
            style: styles.itemTitle,
          },
          ...(item.meta
            ? [
                {
                  id: 'meta',
                  text: item.meta,
                  style: styles.itemMeta,
                },
              ]
            : []),
        ]}
      />
      {item.value ? (
        <KolamCopyStack
          containerStyle={styles.itemValueCopy}
          items={[
            {
              id: 'value',
              text: item.value,
              style: styles.itemValue,
            },
          ]}
        />
      ) : null}
      {item.badge ? <KolamStatusBadge intent="muted" label={item.badge} /> : null}
    </View>
  );
}

function getDetailItemKey(
  item: KolamLabelFieldDetailSectionItem,
  index: number,
) {
  return `${item.title}-${item.value ?? ''}-${index}`;
}
const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  heroPanel: {
    minHeight: 150,
    flexDirection: 'row',
    gap: 18,
    padding: 16,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  heroAsset: {
    width: 170,
    minHeight: 92,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  heroContent: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricTile: {
    minWidth: 150,
    flexGrow: 1,
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValueWrap: {
    minHeight: 28,
    justifyContent: 'center',
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  metaStack: {
    gap: 8,
  },
  metaRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    width: 22,
    alignItems: 'center',
  },
  metaCopy: {
    flex: 1,
    minWidth: 0,
  },
  metaLink: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  metaText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  metaLinkText: {
    color: V.colors.primary,
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  sectionPanel: {
    minWidth: 320,
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 180,
    padding: 16,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  sectionPanelWide: {
    flexBasis: '100%',
    width: '100%',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionDescription: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBody: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
  },
  itemList: {
    marginTop: 14,
    gap: 0,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  itemRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  itemThumbnail: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  itemMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  itemValueCopy: {
    minWidth: 84,
    alignItems: 'flex-end',
  },
  itemValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  accordionList: {
    marginTop: 14,
    gap: 8,
  },
  accordionItem: {
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  accordionHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  accordionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  accordionSummary: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  accordionChevron: {
    width: 18,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  accordionContent: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  emptyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});



