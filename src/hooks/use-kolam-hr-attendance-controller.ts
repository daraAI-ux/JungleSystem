import {useCallback, useEffect, useState} from 'react';
import {
  kolamHrTodayDateKey,
  type KolamHrDailyAttendanceSummary,
} from '../domain/kolam-hr';
import {ApiError} from '../lib/api-error';
import {resolveProfilePhotoUrl} from '../services/auth-api';
import {fetchKolamHrDailyAttendanceSummary} from '../services/kolam-hr-attendance-api';
import {getKolamUserList} from '../services/kolam-user-api';

export function useKolamHrAttendanceController(options: {enabled: boolean}) {
  const [dateKey, setDateKey] = useState(kolamHrTodayDateKey);
  const [summary, setSummary] = useState<KolamHrDailyAttendanceSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!options.enabled) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const next = await fetchKolamHrDailyAttendanceSummary(dateKey);
      const employees = await getKolamUserList({
        isEmployee: 'true',
        limit: 500,
        page: 1,
      });
      const photoByUser = new Map(
        employees.items.map(user => [
          user.id,
          resolveProfilePhotoUrl(user.profilePicture),
        ]),
      );
      setSummary(
        next
          ? {
              ...next,
              rows: next.rows.map(row => ({
                ...row,
                userPhoto:
                  row.userPhoto || photoByUser.get(row.userId) || null,
              })),
            }
          : next,
      );
      if (!next) {
        setError('Gagal memuat ringkasan absensi.');
      }
    } catch (err) {
      setSummary(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat ringkasan absensi.',
      );
    } finally {
      setLoading(false);
    }
  }, [dateKey, options.enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    dateKey,
    setDateKey,
    summary,
    loading,
    error,
    onRefresh: load,
  };
}
