import {getRouteWorkbenchModel} from '../src/domain/route-workbench';

describe('route workbench contract', () => {
  it('classifies broad route intents for native runway screens', () => {
    expect(
      getRouteWorkbenchModel({
        area: 'pos',
        dataSnapshot: '2 item / 1 sales / 1 payment',
        description: 'Sale draft route.',
        label: 'Checkout',
        route: 'sale-draft',
        sourceRepo: 'E:\\Projects\\da-pos',
        syncState: 'seed',
      }),
    ).toMatchObject({
      intent: 'form',
      summary: expect.arrayContaining([
        expect.objectContaining({
          id: 'intent',
          title: 'Form Flow',
          badges: ['POS', 'write-ready'],
        }),
      ]),
      targets: expect.arrayContaining([
        expect.objectContaining({
          id: 'mutate',
          method: 'POST',
          permission: 'write-ready',
        }),
      ]),
    });

    expect(
      getRouteWorkbenchModel({
        area: 'kolam',
        dataSnapshot: '0 dashboard summary',
        description: 'Finance route.',
        label: 'Finance',
        route: '/finance/tax',
        sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
        syncState: 'seed',
      }).intent,
    ).toBe('finance');

    expect(
      getRouteWorkbenchModel({
        area: 'am',
        dataSnapshot: 'AM dashboard menunggu data live dari server.',
        description: 'Task route.',
        label: 'Tasks',
        route: 'am-be/routes/task',
        sourceRepo: 'E:\\Projects\\da-automation-management',
        syncState: 'disabled',
      }).intent,
    ).toBe('automation');
  });
});
