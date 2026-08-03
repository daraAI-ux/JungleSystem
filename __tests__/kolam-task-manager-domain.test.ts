import {
  canPostKolamTaskDiscussion,
  canAccessKolamTaskManager,
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

  it('allows discussion for admin, creator, PIC, and checklist assignee only', () => {
    const task = normalizeKolamTaskManagerTask({
      _id: 'task-1',
      assignedTo: 'pic-1',
      checklist: [{ assignedTo: 'check-1', title: 'Cek pompa', done: false }],
      createdBy: 'creator-1',
      dueDate: '2026-08-03T16:59:00.000Z',
      priority: 'medium',
      status: 'needs_review',
      title: 'Cek jadwal kolam',
    });

    expect(canPostKolamTaskDiscussion(task, 'admin-1', true)).toBe(true);
    expect(canPostKolamTaskDiscussion(task, 'creator-1', false)).toBe(true);
    expect(canPostKolamTaskDiscussion(task, 'pic-1', false)).toBe(true);
    expect(canPostKolamTaskDiscussion(task, 'check-1', false)).toBe(true);
    expect(canPostKolamTaskDiscussion(task, 'viewer-1', false)).toBe(false);
  });

  it('mirrors plugin access through task-manager or sale view permission', () => {
    expect(
      canAccessKolamTaskManager([
        { resource: 'task-manager', actions: ['view'] },
      ]),
    ).toBe(true);
    expect(
      canAccessKolamTaskManager([{ resource: 'sale', actions: ['view'] }]),
    ).toBe(true);
    expect(
      canAccessKolamTaskManager([
        { resource: 'task-manager', actions: ['update'] },
      ]),
    ).toBe(false);
    expect(canAccessKolamTaskManager([], 'super_admin')).toBe(true);
  });
});
