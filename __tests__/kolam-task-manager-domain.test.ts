import {
  getKolamTaskStatusOptionsForUser,
  normalizeKolamTaskManagerTask,
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
});
