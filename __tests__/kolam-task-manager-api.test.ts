import { appConfig } from '../src/config/app';
import { apiRequest } from '../src/lib/api-client';
import {
  createKolamTaskManagerCategory,
  getKolamTaskManagerTaskTypes,
  getKolamTaskManagerTasks,
  runKolamTaskRecurringTick,
  sendKolamTaskManagerDiscussion,
} from '../src/services/kolam-task-manager-api';

jest.mock('../src/lib/api-client', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('kolam task manager API', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({ data: [] });
  });

  it('uses the live Kolam backend contract for task list requests', async () => {
    apiRequestMock.mockResolvedValueOnce({
      data: [],
      pagination: { limit: 25, page: 2, total: 0, totalPages: 1 },
    });

    await getKolamTaskManagerTasks({
      limit: 25,
      mine: true,
      page: 2,
      search: ' pompa ',
      status: 'todo',
    });

    expect(apiRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: appConfig.kolamApiBaseUrl,
        method: 'GET',
        path: '/task-manager',
        query: expect.objectContaining({
          limit: 25,
          mine: true,
          page: 2,
          search: 'pompa',
          status: 'todo',
        }),
        sourceHeader: appConfig.kolamSourceHeader,
      }),
    );
  });

  it('uses plugin task-manager routes for discussion and recurring tick', async () => {
    apiRequestMock.mockResolvedValueOnce({
      data: { id: 'task-1', title: 'Cek pompa' },
    });

    await sendKolamTaskManagerDiscussion('task 1/2', ' siap ');

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        baseUrl: appConfig.kolamApiBaseUrl,
        body: { message: 'siap' },
        method: 'POST',
        path: '/task-manager/task%201%2F2/discussion',
        sourceHeader: appConfig.kolamSourceHeader,
      }),
    );

    await runKolamTaskRecurringTick();

    expect(apiRequestMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        baseUrl: appConfig.kolamApiBaseUrl,
        method: 'POST',
        path: '/task-manager/recurring/run-tick',
        sourceHeader: appConfig.kolamSourceHeader,
      }),
    );
  });

  it('keeps task type routes on the enclosure task type backend bridge', async () => {
    await getKolamTaskManagerTaskTypes();

    expect(apiRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: appConfig.kolamApiBaseUrl,
        method: 'GET',
        path: '/enclosure-task-types',
        query: { includeInactive: true },
        sourceHeader: appConfig.kolamSourceHeader,
      }),
    );
  });

  it('maps category active state to the backend field name', async () => {
    apiRequestMock.mockResolvedValueOnce({
      data: [{ id: 'cat-1', name: 'Kolam', isActive: false }],
    });

    await createKolamTaskManagerCategory({
      active: false,
      color: '#047857',
      name: ' Kolam ',
      sortOrder: 7,
    });

    expect(apiRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: appConfig.kolamApiBaseUrl,
        body: {
          color: '#047857',
          isActive: false,
          name: 'Kolam',
          sortOrder: 7,
        },
        method: 'POST',
        path: '/task-manager/categories',
        sourceHeader: appConfig.kolamSourceHeader,
      }),
    );
  });
});
