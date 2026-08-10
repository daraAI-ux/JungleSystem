import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  buildKolamHrUserDetailRoute,
  formatKolamHrDatetime,
  formatKolamHrFine,
  KOLAM_HR_ATTENDANCE_SETTINGS_ROUTE,
  KOLAM_HR_ATTENDANCE_STATUS_LABEL,
  kolamHrAttendanceStatusIntent,
  type KolamHrDailyAttendanceRow,
} from '../domain/kolam-hr';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamHrAttendanceController} from '../hooks/use-kolam-hr-attendance-controller';
import {KolamButton} from './kolam-button';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `HrDailyAttendancePanel`. */
export function KolamHrAttendanceBody({
  enabled,
  onRouteChange,
}: {
  enabled: boolean;
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamHrAttendanceController({enabled});

  const columns = useMemo(
    () => [
      {
        id: 'employee',
        label: 'Karyawan',
        flex: 1.4,
        render: (row: KolamHrDailyAttendanceRow) => (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              onRouteChange?.(buildKolamHrUserDetailRoute(row.userId))
            }>
            <View style={styles.employeeCell}>
              {row.userPhoto ? (
                <KolamRemoteImage
                  accessibilityLabel={`Foto ${row.userName || row.userId}`}
                  resizeMode="cover"
                  scope="hr-attendance-user"
                  sourceUri={row.userPhoto}
                  style={styles.employeePhoto}
                />
              ) : (
                <View style={styles.employeePhotoFallback}>
                  <Text numberOfLines={1} style={styles.employeeInitials}>
                    {getEmployeeInitials(row.userName || row.userId)}
                  </Text>
                </View>
              )}
              <Text numberOfLines={1} style={styles.linkText}>
                {row.userName || row.userId}
              </Text>
            </View>
          </Pressable>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 1.1,
        render: (row: KolamHrDailyAttendanceRow) => (
          <KolamStatusBadge
            intent={kolamHrAttendanceStatusIntent(row.status)}
            label={
              KOLAM_HR_ATTENDANCE_STATUS_LABEL[row.status] ?? row.status
            }
          />
        ),
      },
      {
        id: 'checkIn',
        label: 'Check-in',
        flex: 1.1,
        render: (row: KolamHrDailyAttendanceRow) => (
          <Text style={styles.meta}>{formatKolamHrDatetime(row.checkInAt)}</Text>
        ),
      },
      {
        id: 'checkOut',
        label: 'Check-out',
        flex: 1.1,
        render: (row: KolamHrDailyAttendanceRow) => (
          <Text style={styles.meta}>
            {formatKolamHrDatetime(row.checkOutAt)}
          </Text>
        ),
      },
      {
        id: 'late',
        label: 'Telat',
        flex: 0.7,
        render: (row: KolamHrDailyAttendanceRow) => (
          <Text style={styles.cellText}>
            {row.lateMinutes ? `${row.lateMinutes} m` : '-'}
          </Text>
        ),
      },
      {
        id: 'fine',
        label: 'Denda',
        flex: 0.9,
        render: (row: KolamHrDailyAttendanceRow) => (
          <Text style={styles.cellText}>
            {formatKolamHrFine(row.fineAmount)}
          </Text>
        ),
      },
    ],
    [onRouteChange],
  );

  if (!enabled) {
    return (
      <Text style={styles.meta}>
        Akses staff_attendance/salary diperlukan.
      </Text>
    );
  }

  const stats = controller.summary?.stats ?? {};

  return (
    <View style={styles.root}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <View style={styles.dateField}>
                <Text style={styles.fieldLabel}>Tanggal</Text>
                <KolamFormTextField
                  onChangeText={controller.setDateKey}
                  placeholder="YYYY-MM-DD"
                  value={controller.dateKey}
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                intent="outline"
                label="Pengaturan absensi"
                onPress={() =>
                  onRouteChange?.(KOLAM_HR_ATTENDANCE_SETTINGS_ROUTE)
                }
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>

      {controller.summary?.holiday ? (
        <Text style={styles.holidayBanner}>
          Hari libur (jam operasional toko). Karyawan tanpa record dianggap
          libur.
        </Text>
      ) : null}

      {controller.summary ? (
        <View style={styles.statsRow}>
          <KolamStatusBadge
            intent="secondary"
            label={`Total: ${stats.total ?? controller.summary.rows.length}`}
          />
          {Object.entries(stats)
            .filter(([key]) => key !== 'total')
            .map(([key, count]) => (
              <KolamStatusBadge
                intent={kolamHrAttendanceStatusIntent(key)}
                key={key}
                label={`${KOLAM_HR_ATTENDANCE_STATUS_LABEL[key] ?? key}: ${count}`}
              />
            ))}
          <Text style={styles.meta}>
            Jam masuk: {controller.summary.workStartTime} (
            {controller.summary.timezone})
          </Text>
        </View>
      ) : null}

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
        />
      ) : null}

      <KolamListTableComposition
        columns={columns}
        emptyTitle="Tidak ada data."
        getRowKey={row => row.userId}
        loading={controller.loading}
        rows={controller.summary?.rows ?? []}
        showFooter={false}
      />
    </View>
  );
}

function getEmployeeInitials(value: string) {
  const parts = value
    .split(/\s+/)
    .map(part => part.trim())
    .filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '-';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  dateField: {
    flexGrow: 1,
    gap: 4,
    maxWidth: 220,
    minWidth: 160,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  holidayBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employeeCell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  employeePhoto: {
    borderRadius: 6,
    height: 28,
    width: 28,
  },
  employeePhotoFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  employeeInitials: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
