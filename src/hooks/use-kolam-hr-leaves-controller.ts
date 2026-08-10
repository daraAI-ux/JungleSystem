import {useCallback, useEffect, useState} from 'react';
import type {
  KolamHrLeaveRequest,
  KolamHrLeaveType,
} from '../domain/kolam-hr';
import {ApiError} from '../lib/api-error';
import {
  createKolamHrLeaveRequest,
  fetchKolamHrLeaveRequests,
  reviewKolamHrLeaveRequest,
} from '../services/kolam-hr-attendance-api';
import {getKolamUserList} from '../services/kolam-user-api';

export type KolamHrLeaveFilter = 'pending' | 'all';

export type KolamHrEmployeeOption = {
  label: string;
  value: string;
};

export type KolamHrLeaveCreateDraft = {
  userId: string;
  type: KolamHrLeaveType;
  startDateKey: string;
  endDateKey: string;
  reason: string;
};

function emptyDraft(): KolamHrLeaveCreateDraft {
  return {
    userId: '',
    type: 'ijin',
    startDateKey: '',
    endDateKey: '',
    reason: '',
  };
}

export function useKolamHrLeavesController(options: {enabled: boolean}) {
  const [filter, setFilter] = useState<KolamHrLeaveFilter>('pending');
  const [rows, setRows] = useState<KolamHrLeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] =
    useState<KolamHrLeaveCreateDraft>(emptyDraft);
  const [employeeOptions, setEmployeeOptions] = useState<
    KolamHrEmployeeOption[]
  >([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const load = useCallback(async () => {
    if (!options.enabled) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const next = await fetchKolamHrLeaveRequests(
        filter === 'pending' ? {status: 'pending'} : undefined,
      );
      setRows(next);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat pengajuan cuti.',
      );
    } finally {
      setLoading(false);
    }
  }, [filter, options.enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!options.enabled || !createOpen) {
      return;
    }
    let cancelled = false;
    setLoadingEmployees(true);
    void getKolamUserList({isEmployee: 'true', limit: 200, page: 1})
      .then(result => {
        if (cancelled) {
          return;
        }
        setEmployeeOptions(
          result.items.map(item => ({
            value: item.id,
            label:
              [item.firstName, item.lastName].filter(Boolean).join(' ').trim() ||
              item.username ||
              item.id,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setEmployeeOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [createOpen, options.enabled]);

  const onReview = useCallback(
    async (id: string, approve: boolean) => {
      setMutating(true);
      setError('');
      setStatusMessage('');
      try {
        await reviewKolamHrLeaveRequest({id, approve});
        setStatusMessage(approve ? 'Cuti disetujui' : 'Cuti ditolak');
        await load();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal',
        );
      } finally {
        setMutating(false);
      }
    },
    [load],
  );

  const onCreate = useCallback(async () => {
    if (
      !createDraft.userId ||
      !createDraft.startDateKey.trim() ||
      !createDraft.endDateKey.trim()
    ) {
      setError('Karyawan dan tanggal wajib diisi');
      return;
    }
    setMutating(true);
    setError('');
    setStatusMessage('');
    try {
      await createKolamHrLeaveRequest({
        userId: createDraft.userId,
        type: createDraft.type,
        startDateKey: createDraft.startDateKey.trim(),
        endDateKey: createDraft.endDateKey.trim(),
        reason: createDraft.reason,
      });
      setStatusMessage('Pengajuan cuti dibuat');
      setCreateOpen(false);
      setCreateDraft(emptyDraft());
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal membuat pengajuan',
      );
    } finally {
      setMutating(false);
    }
  }, [createDraft, load]);

  return {
    filter,
    setFilter,
    rows,
    loading,
    mutating,
    error,
    statusMessage,
    createOpen,
    setCreateOpen,
    createDraft,
    setCreateDraft: (patch: Partial<KolamHrLeaveCreateDraft>) => {
      setCreateDraft(prev => ({...prev, ...patch}));
    },
    employeeOptions,
    loadingEmployees,
    onRefresh: load,
    onReview,
    onCreate,
  };
}
