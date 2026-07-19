import React from 'react';
import {StyleSheet} from 'react-native';
import {
  getDashboardCustomerVisitConfirmationsVisualContract,
  type DashboardCustomerVisitConfirmation,
  type DashboardCustomerVisitConfirmationsDescriptor,
} from '../domain/dashboard-customer-visit-confirmations';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamTextAction} from './kolam-text-action';

const VISIT_CONFIRMATIONS_VISUAL =
  getDashboardCustomerVisitConfirmationsVisualContract();
const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export function KolamDashboardCustomerVisitConfirmations({
  descriptor,
  onConfirm,
  rows,
}: {
  descriptor: DashboardCustomerVisitConfirmationsDescriptor;
  onConfirm?: (row: DashboardCustomerVisitConfirmation) => void;
  rows: DashboardCustomerVisitConfirmation[];
}) {
  if (!rows.length) {
    return null;
  }

  return (
    <KolamCardFrame variant="dashboardVisitConfirmations" style={styles.section}>
      <KolamHeaderFrame variant="dashboardVisitConfirmations">
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: descriptor.title,
              style: styles.headerTitle,
            },
            {
              id: 'description',
              text: descriptor.description,
              style: styles.headerDescription,
            },
          ]}
        />
      </KolamHeaderFrame>
      <KolamListFrame variant="dashboardVisitConfirmationsList">
        <KolamMappedList
          items={rows}
          getKey={row => row.id}
          renderItem={row => (
            <KolamCardFrame variant="dashboardRailRow" style={styles.row}>
              <KolamCopyStack
                containerStyle={styles.rowCopy}
                items={[
                  {id: 'title', text: row.title, style: styles.rowTitle},
                  {
                    id: 'description',
                    text: row.description,
                    style: styles.rowDescription,
                  },
                ]}
              />
              <KolamTextAction
                accessibilityLabel={row.actionAccessibilityLabel}
                label={row.actionLabel}
                onPress={() => onConfirm?.(row)}
                variant="primaryUnderline"
              />
            </KolamCardFrame>
          )}
        />
      </KolamListFrame>
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: DASHBOARD_LAYOUT_VISUAL.main.gapY,
  },
  headerTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: VISIT_CONFIRMATIONS_VISUAL.header.titleFontSize,
    fontWeight:
      VISIT_CONFIRMATIONS_VISUAL.header.titleFontWeight === 'semibold'
        ? '600'
        : '700',
  },
  headerDescription: {
    marginTop: VISIT_CONFIRMATIONS_VISUAL.header.descriptionGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: VISIT_CONFIRMATIONS_VISUAL.header.descriptionFontSize,
  },
  row: {
    minHeight: 0,
    flexWrap: VISIT_CONFIRMATIONS_VISUAL.row.flexWrap ? 'wrap' : 'nowrap',
    gap: VISIT_CONFIRMATIONS_VISUAL.row.gapX,
    justifyContent: 'space-between',
    paddingHorizontal: VISIT_CONFIRMATIONS_VISUAL.row.paddingX,
    paddingVertical: VISIT_CONFIRMATIONS_VISUAL.row.paddingY,
    borderRadius: VISIT_CONFIRMATIONS_VISUAL.row.radius,
    borderColor: V.colors.border,
    borderWidth: VISIT_CONFIRMATIONS_VISUAL.row.borderWidth,
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: VISIT_CONFIRMATIONS_VISUAL.row.titleFontSize,
    fontWeight:
      VISIT_CONFIRMATIONS_VISUAL.row.titleFontWeight === 'medium'
        ? '500'
        : '700',
  },
  rowDescription: {
    marginTop: VISIT_CONFIRMATIONS_VISUAL.row.descriptionGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: VISIT_CONFIRMATIONS_VISUAL.row.descriptionFontSize,
  },
});
