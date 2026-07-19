import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {dashboardHeaderStyles as styles} from './kolam-dashboard-header-styles';

export function KolamDashboardSessionPill({
  sessionCashier,
  sessionOpen,
}: {
  sessionCashier?: string;
  sessionOpen: boolean;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.sessionPill}
      items={[
        {
          id: 'label',
          text: sessionOpen ? 'Cashflow open' : 'Cashflow closed',
          style: styles.sessionLabel,
        },
        {
          id: 'value',
          text: sessionCashier ?? 'Belum ada session',
          style: styles.sessionValue,
        },
      ]}
    />
  );
}
