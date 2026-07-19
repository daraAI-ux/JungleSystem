import React from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamStatusBadge, type KolamStatusBadgeProps} from './kolam-status-badge';

export interface KolamLabelFieldMetric {
  label: string;
  value: string | number;
}

export interface KolamLabelFieldMeta {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

export interface KolamLabelFieldDetailSection {
  description: string;
  emptyText: string;
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
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.sectionGrid}>
        {sections.map(section => (
          <View key={section.title} style={styles.sectionPanel}>
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
              <KolamCopyStack
                items={[
                  {
                    id: 'empty',
                    text: section.emptyText,
                    style: styles.emptyText,
                  },
                ]}
              />
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
    width: 160,
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
  metaText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
