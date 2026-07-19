import React from 'react';
import type {
  DashboardPendingOrderItem,
  DashboardPendingOrderSection,
  DashboardPendingOrdersPanel,
} from '../domain/dashboard-pending-orders';
import {KolamBadge} from './kolam-badge';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractiveCardFrame} from './kolam-interactive-card-frame';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersGrid({
  onOpenRoute,
  panel,
}: {
  onOpenRoute?: (route: string) => void;
  panel: DashboardPendingOrdersPanel;
}) {
  return (
    <KolamListFrame variant="pendingOrdersGrid">
      {panel.sections.length ? (
        <>
          <KolamMappedList
            items={panel.sections}
            getKey={section => section.id}
            renderItem={section => (
              <React.Fragment>
                <PendingOrdersSectionHeader section={section} />
                <KolamMappedList
                  items={section.items}
                  getKey={item => item.id}
                  renderItem={item => (
                    <PendingOrdersRow
                      item={item}
                      onOpenRoute={onOpenRoute}
                    />
                  )}
                />
              </React.Fragment>
            )}
          />
          {panel.cappedLabel ? (
            <KolamCopyStack
              items={[
                {
                  id: 'capped',
                  text: panel.cappedLabel,
                  style: styles.pendingOrdersCapped,
                },
              ]}
            />
          ) : null}
        </>
      ) : (
        <KolamCopyStack
          items={[
            {
              id: 'empty',
              text: panel.emptyLabel,
              style: styles.pendingOrdersEmpty,
            },
          ]}
        />
      )}
    </KolamListFrame>
  );
}

function PendingOrdersSectionHeader({
  section,
}: {
  section: DashboardPendingOrderSection;
}) {
  return (
    <KolamCardFrame variant="dashboardPendingOrdersSectionHeader">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: `${section.title} (${section.count})`,
            style: styles.pendingOrdersSectionTitle,
          },
        ]}
      />
    </KolamCardFrame>
  );
}

function PendingOrdersRow({
  item,
  onOpenRoute,
}: {
  item: DashboardPendingOrderItem;
  onOpenRoute?: (route: string) => void;
}) {
  const content = (
    <>
      <KolamCopyStack
        containerStyle={styles.pendingOrdersRowIdentity}
        items={[
          {
            id: 'invoice',
            text: item.invoiceCode,
            style: styles.pendingOrdersInvoice,
          },
          {
            id: 'source',
            text: `${item.sourceName} - ${item.createdAtLabel}`,
            style: styles.pendingOrdersRowMeta,
          },
          ...(item.lifecycleLabel
            ? [
                {
                  id: 'lifecycle',
                  text: item.lifecycleLabel,
                  style: styles.pendingOrdersLifecycle,
                },
              ]
            : []),
        ]}
      />
      <KolamCopyStack
        items={[
          {
            id: 'total',
            text: item.totalLabel,
            style: styles.pendingOrdersRowTotal,
          },
        ]}
      />
      <KolamListFrame variant="pendingOrdersBadges">
        {item.kind === 'custom' ? (
          <KolamBadge label="Kustom" intent="primary" />
        ) : null}
        <KolamMappedList
          items={item.reasonLabels}
          getKey={label => label}
          renderItem={label => <KolamBadge label={label} intent="warning" />}
        />
      </KolamListFrame>
      <KolamListFrame variant="pendingOrdersStatusBadges">
        <KolamBadge label={item.statusLabel} intent="secondary" />
        <KolamBadge label={item.deliveryLabel} intent="outline" />
      </KolamListFrame>
    </>
  );

  if (!onOpenRoute) {
    return (
      <KolamCardFrame variant="dashboardPendingOrdersRow">
        {content}
      </KolamCardFrame>
    );
  }

  return (
    <KolamInteractiveCardFrame
      accessibilityLabel={`${item.invoiceCode} - ${item.route}`}
      onPress={() => onOpenRoute(item.route)}
      variant="dashboardPendingOrdersRow">
      {content}
    </KolamInteractiveCardFrame>
  );
}
