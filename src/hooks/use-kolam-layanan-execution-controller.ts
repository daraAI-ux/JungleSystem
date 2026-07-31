import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  canKolamLayananRecordCustomerVerification,
  canKolamLayananSupervisorReview,
  findKolamLayananExecutionInTask,
  getKolamLayananExecutionRouteIds,
  type KolamLayananExecutionDetail,
  type KolamLayananRejectionDecision,
  type KolamLayananTaskDetail,
  type KolamLayananVoucherDetail,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  getKolamLayananTaskDetail,
  getKolamLayananVoucher,
  setKolamLayananCustomerVerification,
  setKolamLayananExecutionReview,
} from '../services/kolam-layanan-api';

export interface KolamLayananExecutionController {
  canCustomerConfirm: boolean;
  canSupervisorReview: boolean;
  customerConfirmed: boolean;
  customerNote: string;
  error: string | null;
  execution: KolamLayananExecutionDetail | null;
  loading: boolean;
  notice: string | null;
  rejectDecision: KolamLayananRejectionDecision | '';
  rejectReason: string;
  rejectOpen: boolean;
  saving: boolean;
  task: KolamLayananTaskDetail | null;
  voucher: KolamLayananVoucherDetail | null;
  onAcceptReview: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onRejectReview: () => Promise<boolean>;
  onSaveCustomerConfirm: () => Promise<boolean>;
  onSetCustomerConfirmed: (value: boolean) => void;
  onSetCustomerNote: (value: string) => void;
  onSetRejectDecision: (value: KolamLayananRejectionDecision | '') => void;
  onSetRejectOpen: (value: boolean) => void;
  onSetRejectReason: (value: string) => void;
}

export function useKolamLayananExecutionController(
  route: string,
): KolamLayananExecutionController {
  const routeIds = useMemo(
    () => getKolamLayananExecutionRouteIds(route),
    [route],
  );
  const voucherId = routeIds?.voucherId ?? null;
  const executionId = routeIds?.executionId ?? null;
  const [voucher, setVoucher] = useState<KolamLayananVoucherDetail | null>(
    null,
  );
  const [task, setTask] = useState<KolamLayananTaskDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [customerConfirmed, setCustomerConfirmed] = useState(true);
  const [customerNote, setCustomerNote] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDecision, setRejectDecision] = useState<
    KolamLayananRejectionDecision | ''
  >('');

  const execution = useMemo(
    () => findKolamLayananExecutionInTask(task, executionId ?? '') ?? null,
    [executionId, task],
  );

  const canSupervisorReview = execution
    ? canKolamLayananSupervisorReview(execution)
    : false;
  const canCustomerConfirm = execution
    ? canKolamLayananRecordCustomerVerification(execution)
    : false;

  const refresh = useCallback(async () => {
    if (!voucherId || !executionId) {
      setError('Rute eksekusi tidak valid.');
      setVoucher(null);
      setTask(null);
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const liveVoucher = await getKolamLayananVoucher(voucherId);
      setVoucher(liveVoucher);

      const taskType =
        liveVoucher.taskType === 'maintenance' ? 'maintenance' : 'dosing';
      const taskId =
        taskType === 'dosing'
          ? liveVoucher.initiatedDosingId
          : liveVoucher.initiatedMaintenanceId;

      if (!liveVoucher.initiated || !taskId) {
        setTask(null);
        setError(
          'Voucher belum diaktivasi atau data tugas tidak ditemukan.',
        );
        return;
      }

      const liveTask = await getKolamLayananTaskDetail(taskType, taskId);
      setTask(liveTask);

      const found = findKolamLayananExecutionInTask(liveTask, executionId);
      if (!found) {
        setError('Eksekusi kunjungan tidak ditemukan pada tugas ini.');
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setVoucher(null);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [executionId, voucherId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onAcceptReview = useCallback(async () => {
    if (!task || !execution) {
      return false;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await setKolamLayananExecutionReview({
        taskType: task.taskType,
        taskId: task.id,
        executionId: execution.id,
        reviewStatus: 'accepted',
      });
      setNotice('Kunjungan diverifikasi supervisor.');
      await refresh();
      return true;
    } catch (mutateError) {
      setError(getErrorMessage(mutateError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [execution, refresh, task]);

  const onRejectReview = useCallback(async () => {
    if (!task || !execution) {
      return false;
    }
    if (!rejectReason.trim() || !rejectDecision) {
      setError('Isi alasan dan keputusan penolakan.');
      return false;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await setKolamLayananExecutionReview({
        taskType: task.taskType,
        taskId: task.id,
        executionId: execution.id,
        reviewStatus: 'rejected',
        rejectionReason: rejectReason.trim(),
        rejectionDecision: rejectDecision,
      });
      setRejectOpen(false);
      setRejectReason('');
      setRejectDecision('');
      setNotice('Kunjungan ditolak — dapat perbaikan ulang sesuai keputusan.');
      await refresh();
      return true;
    } catch (mutateError) {
      setError(getErrorMessage(mutateError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [execution, refresh, rejectDecision, rejectReason, task]);

  const onSaveCustomerConfirm = useCallback(async () => {
    if (!task || !execution) {
      return false;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await setKolamLayananCustomerVerification({
        taskType: task.taskType,
        taskId: task.id,
        executionId: execution.id,
        confirmed: customerConfirmed,
        note: customerNote.trim(),
      });
      setCustomerNote('');
      setNotice('Konfirmasi pelanggan tercatat.');
      await refresh();
      return true;
    } catch (mutateError) {
      setError(getErrorMessage(mutateError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [customerConfirmed, customerNote, execution, refresh, task]);

  return useMemo(
    () => ({
      canCustomerConfirm,
      canSupervisorReview,
      customerConfirmed,
      customerNote,
      error,
      execution,
      loading,
      notice,
      rejectDecision,
      rejectReason,
      rejectOpen,
      saving,
      task,
      voucher,
      onAcceptReview,
      onRefresh: refresh,
      onRejectReview,
      onSaveCustomerConfirm,
      onSetCustomerConfirmed: setCustomerConfirmed,
      onSetCustomerNote: setCustomerNote,
      onSetRejectDecision: setRejectDecision,
      onSetRejectOpen: setRejectOpen,
      onSetRejectReason: setRejectReason,
    }),
    [
      canCustomerConfirm,
      canSupervisorReview,
      customerConfirmed,
      customerNote,
      error,
      execution,
      loading,
      notice,
      onAcceptReview,
      onRejectReview,
      onSaveCustomerConfirm,
      refresh,
      rejectDecision,
      rejectOpen,
      rejectReason,
      saving,
      task,
      voucher,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada detail eksekusi.';
}
