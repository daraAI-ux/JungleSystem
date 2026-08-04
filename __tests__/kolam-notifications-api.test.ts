import {apiRequest} from '../src/lib/api-client';
import {deleteAllKolamNotifications} from '../src/services/kolam-notifications-api';

jest.mock('../src/lib/api-client', () => ({
  apiRequest: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('kolam notifications API', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    apiRequestMock.mockResolvedValue({});
  });

  it('deletes all notifications with the FE endpoint', async () => {
    await deleteAllKolamNotifications();

    expect(apiRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        path: '/notification/all',
        body: {},
      }),
    );
  });
});
