import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getKolamComplaintIdFromRoute,
  getKolamComplaintRouteMode,
  isKolamComplaintRoute,
  type KolamComplaint,
  type KolamComplaintDecision,
  type KolamComplaintKpiSeverity,
  type KolamComplaintSource,
  type KolamComplaintStatus,
  type KolamComplaintTrackingStatus,
} from '../domain/kolam-complaint';
import type { KolamUserListItem } from '../domain/kolam-user';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  assignKolamComplaintStaff,
  closeKolamComplaint,
  getKolamComplaint,
  getKolamComplaints,
  updateKolamComplaintDecision,
  updateKolamComplaintReturnStatus,
  updateKolamComplaintStatus,
} from '../services/kolam-complaint-api';
import { getKolamUserList } from '../services/kolam-user-api';

export type KolamComplaintSurfaceMode = 'list' | 'detail' | 'new';
export type KolamComplaintDataSource = 'idle' | 'live' | 'error';

export interface KolamComplaintStaffOption {
  id: string;
  label: string;
}

export interface KolamComplaintController {
  complaints: KolamComplaint[];
  customProjectOnly: boolean;
  dataSource: KolamComplaintDataSource;
  decisionFilter: NonNullable<KolamComplaintDecision> | 'all';
  error: string | null;
  loading: boolean;
  mode: KolamComplaintSurfaceMode;
  mutating: boolean;
  page: number;
  pageSize: number;
  search: string;
  selectedComplaint: KolamComplaint | null;
  sourceFilter: KolamComplaintSource | 'all';
  staffOptions: KolamComplaintStaffOption[];
  statusFilter: KolamComplaintStatus | 'all';
  statusMessage: string | null;
  total: number;
  totalPages: number;
  onAssignStaff: (staffId: string, note?: string) => Promise<boolean>;
  onBackToList: () => void;
  onCloseComplaint: (payload: {
    note: string;
    kpiSeverity?: KolamComplaintKpiSeverity | null;
  }) => Promise<boolean>;
  onCreateNew: () => void;
  onRefresh: () => Promise<void>;
  onSearchChange: (value: string) => void;
  onSelectComplaint: (complaint: KolamComplaint) => Promise<void>;
  onSetCustomProjectOnly: (value: boolean) => void;
  onSetDecisionFilter: (
    value: NonNullable<KolamComplaintDecision> | 'all',
  ) => void;
  onSetPage: (page: number) => void;
  onSetPageSize: (pageSize: number) => void;
  onSetSourceFilter: (value: KolamComplaintSource | 'all') => void;
  onSetStatusFilter: (value: KolamComplaintStatus | 'all') => void;
  onUpdateDecision: (payload: {
    decision: NonNullable<KolamComplaintDecision>;
    note: string;
    refundAmount?: number;
  }) => Promise<boolean>;
  onUpdateReturnStatus: (payload: {
    status: KolamComplaintTrackingStatus;
    note?: string;
    verifiedNote?: string;
    trackingNumber?: string;
    courierName?: string;
    receivedBy?: string;
  }) => Promise<boolean>;
  onUpdateStatus: (
    status: KolamComplaintStatus,
    note: string,
  ) => Promise<boolean>;
}

function mapStaffOptions(users: KolamUserListItem[]): KolamComplaintStaffOption[] {
  return users.map(user => ({
    id: user.id,
    label: user.displayName || `${user.firstName} ${user.lastName}`.trim() || user.id,
  }));
}

export function useKolamComplaintController(
  route: string,
): KolamComplaintController {
  const initialMode = getKolamComplaintRouteMode(route);
  const [complaints, setComplaints] = useState<KolamComplaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<KolamComplaint | null>(null);
  const [mode, setMode] = useState<KolamComplaintSurfaceMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] =
    useState<KolamComplaintDataSource>('idle');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    KolamComplaintStatus | 'all'
  >('all');
  const [decisionFilter, setDecisionFilter] = useState<
    NonNullable<KolamComplaintDecision> | 'all'
  >('all');
  const [sourceFilter, setSourceFilter] = useState<
    KolamComplaintSource | 'all'
  >('all');
  const [customProjectOnly, setCustomProjectOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [staffOptions, setStaffOptions] = useState<KolamComplaintStaffOption[]>(
    [],
  );

  const refreshList = useCallback(async () => {
    if (!isKolamComplaintRoute(route)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const live = await getKolamComplaints({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        decision: decisionFilter === 'all' ? undefined : decisionFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter,
        customProject: customProjectOnly || undefined,
      });
      setComplaints(live.items);
      setTotal(live.total);
      setTotalPages(live.totalPages);
      setDataSource('live');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setDataSource('error');
    } finally {
      setLoading(false);
    }
  }, [
    customProjectOnly,
    decisionFilter,
    page,
    pageSize,
    route,
    search,
    sourceFilter,
    statusFilter,
  ]);

  const refreshDetail = useCallback(async (complaintId: string) => {
    const live = await getKolamComplaint(complaintId);
    setSelectedComplaint(live);
    setDataSource('live');
    setComplaints(prev =>
      prev.map(item => (item.id === live.id ? { ...item, ...live } : item)),
    );
    return live;
  }, []);

  const loadStaffOptions = useCallback(async () => {
    try {
      const result = await getKolamUserList({ page: 1, limit: 200 });
      setStaffOptions(mapStaffOptions(result.items));
    } catch {
      // Non-blocking: assign dropdown can stay empty.
    }
  }, []);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode === 'new') {
      setSelectedComplaint(null);
    }
  }, [initialMode]);

  useEffect(() => {
    if (mode === 'list' || mode === 'new') {
      void refreshList();
    }
  }, [mode, refreshList]);

  useEffect(() => {
    if (mode === 'detail') {
      void loadStaffOptions();
    }
  }, [loadStaffOptions, mode]);

  const onSelectComplaint = useCallback(async (complaint: KolamComplaint) => {
    setMode('detail');
    setSelectedComplaint(complaint);
    setError(null);
    setStatusMessage(null);

    try {
      await refreshDetail(complaint.id);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
    }
  }, [refreshDetail]);

  useEffect(() => {
    const complaintId = getKolamComplaintIdFromRoute(route);
    if (!complaintId || mode === 'new') {
      return;
    }

    if (selectedComplaint?.id === complaintId) {
      return;
    }

    let active = true;
    void (async () => {
      const fromList = complaints.find(item => item.id === complaintId);
      if (fromList) {
        if (active) {
          await onSelectComplaint(fromList);
        }
        return;
      }

      try {
        const live = await getKolamComplaint(complaintId);
        if (!active) {
          return;
        }
        setSelectedComplaint(live);
        setMode('detail');
        setDataSource('live');
      } catch (detailError) {
        if (active) {
          setError(getErrorMessage(detailError));
          setDataSource('error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [complaints, mode, onSelectComplaint, route, selectedComplaint?.id]);

  const runMutation = useCallback(
    async (
      action: () => Promise<KolamComplaint>,
      successMessage: string,
    ): Promise<boolean> => {
      if (!selectedComplaint?.id) {
        return false;
      }
      setMutating(true);
      setError(null);
      setStatusMessage(null);
      try {
        const live = await action();
        setSelectedComplaint(live);
        setComplaints(prev =>
          prev.map(item => (item.id === live.id ? { ...item, ...live } : item)),
        );
        setStatusMessage(successMessage);
        setDataSource('live');
        return true;
      } catch (mutationError) {
        setError(getErrorMessage(mutationError));
        return false;
      } finally {
        setMutating(false);
      }
    },
    [selectedComplaint?.id],
  );

  const onAssignStaff = useCallback(
    (staffId: string, note?: string) => {
      const id = selectedComplaint?.id;
      if (!id || !staffId.trim()) {
        return Promise.resolve(false);
      }
      return runMutation(
        () =>
          assignKolamComplaintStaff(id, {
            staffId: staffId.trim(),
            ...(note?.trim() ? { note: note.trim() } : {}),
          }),
        'Staf berhasil ditugaskan.',
      );
    },
    [runMutation, selectedComplaint?.id],
  );

  const onUpdateStatus = useCallback(
    (status: KolamComplaintStatus, note: string) => {
      const id = selectedComplaint?.id;
      if (!id || !note.trim()) {
        return Promise.resolve(false);
      }
      return runMutation(
        () =>
          updateKolamComplaintStatus(id, {
            status,
            note: note.trim(),
          }),
        'Status komplain diperbarui.',
      );
    },
    [runMutation, selectedComplaint?.id],
  );

  const onUpdateDecision = useCallback(
    (payload: {
      decision: NonNullable<KolamComplaintDecision>;
      note: string;
      refundAmount?: number;
    }) => {
      const id = selectedComplaint?.id;
      if (!id || !payload.note.trim()) {
        return Promise.resolve(false);
      }
      return runMutation(
        () =>
          updateKolamComplaintDecision(id, {
            decision: payload.decision,
            note: payload.note.trim(),
            ...(payload.refundAmount !== undefined
              ? { refundAmount: payload.refundAmount }
              : {}),
          }),
        'Keputusan komplain disimpan.',
      );
    },
    [runMutation, selectedComplaint?.id],
  );

  const onCloseComplaint = useCallback(
    (payload: {
      note: string;
      kpiSeverity?: KolamComplaintKpiSeverity | null;
    }) => {
      const id = selectedComplaint?.id;
      if (!id || !payload.note.trim()) {
        return Promise.resolve(false);
      }
      return runMutation(
        () =>
          closeKolamComplaint(id, {
            note: payload.note.trim(),
            kpiSeverity: payload.kpiSeverity ?? null,
            kpiAttributedTo: selectedComplaint?.assignedStaffId ?? null,
          }),
        'Tiket komplain ditutup.',
      );
    },
    [runMutation, selectedComplaint?.assignedStaffId, selectedComplaint?.id],
  );

  const onUpdateReturnStatus = useCallback(
    (payload: {
      status: KolamComplaintTrackingStatus;
      note?: string;
      verifiedNote?: string;
      trackingNumber?: string;
      courierName?: string;
      receivedBy?: string;
    }) => {
      const id = selectedComplaint?.id;
      if (!id) {
        return Promise.resolve(false);
      }
      return runMutation(
        () => updateKolamComplaintReturnStatus(id, payload),
        'Status retur diperbarui.',
      );
    },
    [runMutation, selectedComplaint?.id],
  );

  const onBackToList = useCallback(() => {
    setMode('list');
    setSelectedComplaint(null);
    setError(null);
    setStatusMessage(null);
  }, []);

  const onCreateNew = useCallback(() => {
    setMode('new');
    setSelectedComplaint(null);
    setError(null);
    setStatusMessage(null);
  }, []);

  const onRefresh = useCallback(async () => {
    if (mode === 'detail' && selectedComplaint?.id) {
      setLoading(true);
      setError(null);
      try {
        await refreshDetail(selectedComplaint.id);
      } catch (detailError) {
        setError(getErrorMessage(detailError));
      } finally {
        setLoading(false);
      }
      return;
    }
    await refreshList();
  }, [mode, refreshDetail, refreshList, selectedComplaint?.id]);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const onSetPage = useCallback((nextPage: number) => {
    setPage(Math.max(1, nextPage));
  }, []);

  const onSetPageSize = useCallback((nextSize: number) => {
    setPageSize(Math.max(1, nextSize));
    setPage(1);
  }, []);

  const onSetStatusFilter = useCallback(
    (value: KolamComplaintStatus | 'all') => {
      setStatusFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetDecisionFilter = useCallback(
    (value: NonNullable<KolamComplaintDecision> | 'all') => {
      setDecisionFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetSourceFilter = useCallback(
    (value: KolamComplaintSource | 'all') => {
      setSourceFilter(value);
      setPage(1);
    },
    [],
  );

  const onSetCustomProjectOnly = useCallback((value: boolean) => {
    setCustomProjectOnly(value);
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      complaints,
      customProjectOnly,
      dataSource,
      decisionFilter,
      error,
      loading,
      mode,
      mutating,
      page,
      pageSize,
      search,
      selectedComplaint,
      sourceFilter,
      staffOptions,
      statusFilter,
      statusMessage,
      total,
      totalPages,
      onAssignStaff,
      onBackToList,
      onCloseComplaint,
      onCreateNew,
      onRefresh,
      onSearchChange,
      onSelectComplaint,
      onSetCustomProjectOnly,
      onSetDecisionFilter,
      onSetPage,
      onSetPageSize,
      onSetSourceFilter,
      onSetStatusFilter,
      onUpdateDecision,
      onUpdateReturnStatus,
      onUpdateStatus,
    }),
    [
      complaints,
      customProjectOnly,
      dataSource,
      decisionFilter,
      error,
      loading,
      mode,
      mutating,
      onAssignStaff,
      onBackToList,
      onCloseComplaint,
      onCreateNew,
      onRefresh,
      onSearchChange,
      onSelectComplaint,
      onSetCustomProjectOnly,
      onSetDecisionFilter,
      onSetPage,
      onSetPageSize,
      onSetSourceFilter,
      onSetStatusFilter,
      onUpdateDecision,
      onUpdateReturnStatus,
      onUpdateStatus,
      page,
      pageSize,
      search,
      selectedComplaint,
      sourceFilter,
      staffOptions,
      statusFilter,
      statusMessage,
      total,
      totalPages,
    ],
  );
}

function getErrorMessage(error: unknown) {
  return getApiErrorMessage(error);
}
