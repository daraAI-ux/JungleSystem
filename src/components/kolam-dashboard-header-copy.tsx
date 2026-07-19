import React from 'react';
import { KolamCopyStack } from './kolam-copy-stack';
import { dashboardHeaderStyles as styles } from './kolam-dashboard-header-styles';

export function KolamDashboardHeaderCopy({
  eyebrow,
  subtitle,
  title,
}: {
  eyebrow?: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.headerCopy}
      items={[
        ...(eyebrow
          ? [{ id: 'eyebrow', text: eyebrow, style: styles.eyebrow }]
          : []),
        { id: 'title', text: title, style: styles.title },
        ...(subtitle
          ? [{ id: 'subtitle', text: subtitle, style: styles.headerSubtitle }]
          : []),
      ]}
    />
  );
}
