import {
  getKolamTaskStatusOptionsForUser,
  normalizeKolamTaskManagerTask,
  normalizeKolamTaskRecurringOccurrences,
  normalizeKolamTaskRecurringServiceVisits,
} from '../src/domain/kolam-task-manager';

describe('kolam-task-manager domain', () => {
  it('hides done status for non-project tasks with open checklist items', () => {
    const task = normalizeKolamTaskManagerTask({
      _id: 'task-1',
      assignedTo: 'user-1',
      checklist: [{ title: 'Cek pompa', done: false }],
      createdBy: 'admin-1',
      dueDate: '2026-08-03T16:59:00.000Z',
      priority: 'medium',
      status: 'needs_review',
      title: 'Cek jadwal kolam',
    });

    expect(
      getKolamTaskStatusOptionsForUser({
        currentUserId: 'admin-1',
        isTaskAdmin: true,
        task,
      }).map(option => option.id),
    ).not.toContain('done');
  });

  it('normalizes recurring sample review and customer fields', () => {
    const occurrences = normalizeKolamTaskRecurringOccurrences([
      {
        _id: 'occ-1',
        sampleReviewRequired: true,
        status: 'pending',
        title: 'Cek suhu',
      },
    ]);
    const visits = normalizeKolamTaskRecurringServiceVisits([
      {
        _id: 'svc-1',
        customerId: 'cust-1',
        customerName: 'Anura Customer',
        status: 'pending',
        visitTitle: 'Kontrol layanan',
      },
    ]);

    expect(occurrences[0].sampleReviewRequired).toBe(true);
    expect(visits[0].customerId).toBe('cust-1');
    expect(visits[0].customerName).toBe('Anura Customer');
  });
});
