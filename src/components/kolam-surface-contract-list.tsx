import React from 'react';
import {StyleSheet, type TextStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamTableVisualContract} from '../domain/kolam-table';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSurfaceRow} from './kolam-surface-row';

const KOLAM_TABLE_VISUAL = getKolamTableVisualContract();
const LIVE_TABLE_HEADER_TEXT = {
  color: V.colors.mutedFg,
  fontFamily: V.fontFamily,
  fontSize: KOLAM_TABLE_VISUAL.header.fontSize,
  lineHeight: KOLAM_TABLE_VISUAL.header.lineHeight,
  fontWeight:
    KOLAM_TABLE_VISUAL.header.fontWeight === 'medium' ? '500' : '700',
} satisfies TextStyle;

export function KolamSurfaceContractList({
  surfaces,
}: {
  surfaces: Array<{
    id: string;
    label: string;
    route: string;
    description: string;
    sourceRepo: string;
  }>;
}) {
  return (
    <KolamCardFrame variant="surfaceContractList">
      <KolamCopyStack
        containerStyle={styles.tableHeaderRow}
        items={[
          {id: 'surface', text: 'Surface', style: styles.tableHeaderPrimary},
          {
            id: 'route-source',
            text: 'Route / Source',
            style: styles.tableHeaderMeta,
          },
        ]}
      />
      <KolamMappedList
        items={surfaces}
        getKey={surface => surface.id}
        renderItem={surface => <KolamSurfaceRow surface={surface} />}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  tableHeaderRow: {
    minHeight: KOLAM_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: KOLAM_TABLE_VISUAL.header.columnPaddingX,
    paddingVertical: KOLAM_TABLE_VISUAL.header.gutterY,
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  tableHeaderPrimary: {
    flex: 1,
    ...LIVE_TABLE_HEADER_TEXT,
  },
  tableHeaderMeta: {
    width: 360,
    ...LIVE_TABLE_HEADER_TEXT,
  },
});