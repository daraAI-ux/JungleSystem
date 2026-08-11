import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCardFrame } from './kolam-card-frame';

export type KolamDetailSummaryField = {
  id: string;
  label: string;
  value: React.ReactNode;
};

export type KolamDetailSummarySection = {
  content: React.ReactNode;
  id: string;
  title?: string;
};

export type KolamDetailSummaryCardProps = {
  /** Optional longer block under the field grid (notes, HTML, lists). */
  body?: React.ReactNode;
  /** Label above `body` when body is present. */
  bodyTitle?: string;
  description?: string;
  fieldColumns?: 2 | 3 | 4;
  fields: KolamDetailSummaryField[];
  /** Optional visual slot inside the card, before the field grid. */
  leading?: React.ReactNode;
  leadingStyle?: StyleProp<ViewStyle>;
  /** Extra soft panels under the field grid (after `body` when both set). */
  sections?: KolamDetailSummarySection[];
  style?: StyleProp<ViewStyle>;
  title: string;
};

function SummaryBodyPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View style={styles.bodyBlock}>
      {title ? <Text style={styles.bodyTitle}>{title}</Text> : null}
      <View style={styles.bodyContent}>{children}</View>
    </View>
  );
}

/**
 * Reusable detail summary card — labeled field grid + optional body.
 * Suitable for contract/party summaries across modules.
 */
export function KolamDetailSummaryCard({
  body,
  bodyTitle,
  description,
  fieldColumns = 2,
  fields,
  leading,
  leadingStyle,
  sections,
  style,
  title,
}: KolamDetailSummaryCardProps) {
  const fieldGrid =
    fields.length > 0 ? (
      <View style={styles.fieldGrid}>
        {fields.map(field => (
          <View
            key={field.id}
            style={[
              styles.fieldCell,
              fieldColumns === 3 && styles.fieldCellThreeColumns,
              fieldColumns === 4 && styles.fieldCellFourColumns,
            ]}
          >
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.fieldValue}>
              {typeof field.value === 'string' ||
              typeof field.value === 'number' ? (
                <Text style={styles.fieldValueText}>
                  {field.value === '' || field.value == null
                    ? '—'
                    : String(field.value)}
                </Text>
              ) : (
                field.value ?? <Text style={styles.fieldValueText}>—</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    ) : null;

  return (
    <KolamCardFrame
      accessibilityLabel={title}
      style={style ? [styles.card, style] : styles.card}
      variant="compact"
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description}>{description}</Text>
        ) : null}
      </View>

      {leading ? (
        <View style={styles.leadingRow}>
          <View style={[styles.leadingSlot, leadingStyle]}>{leading}</View>
          <View style={styles.leadingContent}>{fieldGrid}</View>
        </View>
      ) : (
        fieldGrid
      )}

      {body ? (
        <SummaryBodyPanel title={bodyTitle}>{body}</SummaryBodyPanel>
      ) : null}

      {sections?.map(section => (
        <SummaryBodyPanel key={section.id} title={section.title}>
          {section.content}
        </SummaryBodyPanel>
      ))}
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  description: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: -4,
  },
  leadingRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  leadingSlot: {
    alignItems: 'center',
    flexBasis: '24%',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 152,
    minWidth: 180,
  },
  leadingContent: {
    flexBasis: '72%',
    flexGrow: 3,
    minWidth: 360,
  },
  fieldCell: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 4,
    minWidth: 140,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  fieldCellThreeColumns: {
    flexBasis: '31%',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 96,
  },
  fieldCellFourColumns: {
    flexBasis: '23%',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 84,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  fieldValue: {
    minHeight: 20,
  },
  fieldValueText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  bodyBlock: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bodyTitle: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  bodyContent: {
    gap: 4,
  },
});
