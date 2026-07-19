import React from 'react';
import type { TopNavBreadcrumbItem } from '../domain/top-nav';
import { KolamBreadcrumbItem } from './kolam-breadcrumb-item';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamListFrame } from './kolam-list-frame';
import { KolamMappedList } from './kolam-mapped-list';
import { topNavigationStyles as styles } from './kolam-top-navigation-styles';

export function KolamBreadcrumbTrail({
  breadcrumbItems,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
}: {
  breadcrumbItems: TopNavBreadcrumbItem[];
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
}) {
  return (
    <KolamListFrame variant="breadcrumbTrail">
      <KolamMappedList
        items={breadcrumbItems}
        getKey={item => item.id}
        renderItem={(item, index) => (
          <>
            {index > 0 ? (
              <KolamCopyStack
                items={[
                  {
                    id: 'separator',
                    text: '>',
                    style: styles.breadcrumbSeparator,
                  },
                ]}
              />
            ) : null}
            <KolamBreadcrumbItem
              current={item.current}
              disabled={item.disabled}
              label={item.label}
              onPress={() => {
                if (item.current || item.disabled) {
                  return;
                }

                if (item.id === 'dashboard') {
                  onBreadcrumbDashboardPress();
                  return;
                }

                onBreadcrumbPress?.(item);
              }}
            />
          </>
        )}
      />
    </KolamListFrame>
  );
}
