import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamNotificationDateTime,
  getKolamNotificationLink,
  type KolamNotification,
} from '../domain/kolam-notifications';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamNotification} from '../services/kolam-notifications-api';
import {useKolamNotificationCenterController} from '../hooks/use-kolam-notification-center-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamStatusBadge} from './kolam-status-badge';

export function KolamNotificationsSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const detailId = getNotificationDetailId(route);

  if (detailId) {
    return (
      <KolamNotificationDetailSurface
        id={detailId}
        onRouteChange={onRouteChange}
      />
    );
  }

  return <KolamNotificationListSurface onRouteChange={onRouteChange} />;
}

function KolamNotificationListSurface({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamNotificationCenterController({
    enabled: true,
    limit: 20,
  });

  const handleOpen = async (notification: KolamNotification) => {
    await controller.markAsRead(notification);
    onRouteChange?.(getKolamNotificationLink(notification));
  };

  return (
    <KolamPanelFrame variant="module">
      <View style={styles.toolbar}>
        <View style={styles.stats}>
          <KolamStatusBadge
            label={`${controller.unreadCount} Unread`}
            intent={controller.unreadCount > 0 ? 'warning' : 'success'}
          />
          <Text style={styles.meta}>
            {controller.stats.total.toLocaleString('id-ID')} total
          </Text>
        </View>
        <View style={styles.actions}>
          <KolamButton
            label="Mark All Read"
            intent="outline"
            disabled={controller.unreadCount <= 0}
            onPress={() => {
              void controller.markAllAsRead();
            }}
          />
          <KolamButton
            label="Delete All"
            intent="danger"
            disabled={controller.stats.total <= 0}
            onPress={() => {
              void controller.deleteAll();
            }}
          />
        </View>
      </View>
      {controller.errorMessage ? (
        <Text style={styles.error}>{controller.errorMessage}</Text>
      ) : null}
      {controller.notifications.length ? (
        <ScrollView style={styles.list}>
          {controller.notifications.map(notification => (
            <NotificationRow
              key={notification._id}
              notification={notification}
              onPress={() => {
                void handleOpen(notification);
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <KolamEmptyState compact title="No notifications" />
      )}
    </KolamPanelFrame>
  );
}

function KolamNotificationDetailSurface({
  id,
  onRouteChange,
}: {
  id: string;
  onRouteChange?: (route: string) => void;
}) {
  const [notification, setNotification] =
    React.useState<KolamNotification | null>(null);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    let active = true;
    getKolamNotification(id)
      .then(next => {
        if (active) {
          setNotification(next);
          setErrorMessage('');
        }
      })
      .catch(error => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Gagal memuat notifikasi.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <KolamPanelFrame variant="module">
      <View style={styles.toolbar}>
        <KolamButton
          label="Back"
          intent="outline"
          onPress={() => onRouteChange?.('/notifications')}
        />
        {notification ? (
          <KolamStatusBadge
            label={notification.isRead ? 'READ' : 'UNREAD'}
            intent={notification.isRead ? 'success' : 'warning'}
          />
        ) : null}
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {notification ? (
        <View style={styles.detail}>
          <View style={styles.detailHeader}>
            <KolamStatusBadge
              label={notification.type.toUpperCase()}
              intent={getBadgeTone(notification)}
            />
            <Text style={styles.meta}>
              {formatKolamNotificationDateTime(notification.createdAt)}
            </Text>
          </View>
          <Text style={styles.detailTitle}>{notification.title}</Text>
          <Text style={styles.detailMessage}>{notification.message}</Text>
          {notification.relatedEntity?.type ? (
            <Text style={styles.meta}>{notification.relatedEntity.type}</Text>
          ) : null}
        </View>
      ) : (
        <KolamEmptyState compact title="No notifications" />
      )}
    </KolamPanelFrame>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: KolamNotification;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={notification.title}
      onPress={onPress}
      style={[
        styles.row,
        !notification.isRead && styles.rowUnread,
      ]}>
      <View style={styles.rowHeader}>
        <KolamStatusBadge
          label={notification.type.toUpperCase()}
          intent={getBadgeTone(notification)}
        />
        {!notification.isRead ? <View style={styles.unreadDot} /> : null}
      </View>
      <Text style={styles.rowTitle}>{notification.title}</Text>
      <Text style={styles.rowMessage} numberOfLines={2}>
        {notification.message}
      </Text>
      <Text style={styles.meta}>
        {formatKolamNotificationDateTime(notification.createdAt)}
      </Text>
    </KolamInteractionFrame>
  );
}

function getBadgeTone(notification: KolamNotification) {
  if (notification.type === 'success') {
    return 'success';
  }
  if (notification.type === 'warning') {
    return 'warning';
  }
  if (notification.type === 'error') {
    return 'danger';
  }

  return 'info';
}

function getNotificationDetailId(route: string) {
  const routePath = route.split('?')[0];
  const match = routePath.match(/^\/notifications\/([^/]+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

const styles = StyleSheet.create({
  toolbar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: V.layout.cardCompactSpacing,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  list: {
    maxHeight: 620,
  },
  row: {
    paddingHorizontal: V.layout.cardCompactSpacing,
    paddingVertical: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  rowUnread: {
    backgroundColor: V.colors.successSoft,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowTitle: {
    marginTop: 8,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  rowMessage: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: V.colors.primary,
  },
  meta: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  error: {
    padding: V.layout.cardCompactSpacing,
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  detail: {
    padding: V.layout.cardSpacing,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTitle: {
    marginTop: 12,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  detailMessage: {
    marginTop: 8,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    lineHeight: 21,
  },
});
