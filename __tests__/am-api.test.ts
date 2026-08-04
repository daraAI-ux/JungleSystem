import {appConfig} from '../src/config/app';
import {
  clearResponseCookieJar,
  setAccessToken,
  setAuthSessionHandlers,
} from '../src/lib/api-client';
import {
  bulkDeleteAmActivityLogs,
  cancelAmTask,
  cancelAmTransfer,
  clearAmServiceAccountSession,
  createAmBox,
  createAmChatContact,
  createAmDevice,
  createAmRack,
  createAmTask,
  createAmServiceAccount,
  createAmTransfer,
  createAmWebhookConfig,
  forceFailAmTask,
  forceFailAmTransfer,
  getAmTokopediaApiMonitorStatus,
  getAmChatContactById,
  getAmChatContacts,
  getAmChatMessageById,
  getAmChatMessages,
  getAmBoxById,
  getAmCurrentUser,
  getAmDashboard,
  getAmDevices,
  getAmDevicesAdbStatus,
  getAmDeviceById,
  getAmDeviceServiceLogs,
  getAmDeviceServiceQrUrl,
  getAmDeviceServices,
  getAmRacks,
  getAmBoxes,
  getAmActivityLogs,
  getAmActivityLogStats,
  getAmMutasi,
  getAmMutasiById,
  getAmMutasiSummary,
  getAmMutasiReceiptUrl,
  getAmRackById,
  getAmRoles,
  getAmServiceAccounts,
  getAmServiceAccountById,
  getAmTaskById,
  getAmTasks,
  getAmUserById,
  getAmUsers,
  getAmWebhookConfigs,
  getAmWebhookEvents,
  getAmWebhookLogs,
  getAmTransferById,
  getAmTransfers,
  deleteAmBoxes,
  deleteAmDevices,
  deleteAmRacks,
  deleteAmServiceAccount,
  deleteAmWebhookConfig,
  loginAmSession,
  logoutAmSession,
  restartAmTokopediaSession,
  retryAmTask,
  retryAmTransfer,
  runAmTokopediaApiMonitor,
  sendAmDeviceServiceInput,
  sendAmChatMessage,
  startAmDeviceService,
  startAmTokopediaQrLogin,
  stopAmDeviceService,
  testAmWebhookPing,
  updateAmBox,
  updateAmDevice,
  updateAmRack,
  updateAmServiceAccount,
  updateAmTokopediaCaptchaSettings,
  updateAmTokopediaLoginMethod,
  updateAmUser,
  updateAmWebhookConfig,
  uploadAmTokopediaSession,
  verifyAmTokopediaSession,
} from '../src/services/am-api';

const fetchMock = jest.fn();

describe('AM API service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({success: true, message: 'Logout success'}));
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
    setAuthSessionHandlers({});
    clearResponseCookieJar();
  });

  it('logs out of the live AM session with AM source and bearer-only SSO transport', async () => {
    await logoutAmSession('https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('logs into the live AM session with bearer-only SSO transport', async () => {
    const payload = {username: 'admin', password: 'secret'};
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {user: {_id: 'user-current', username: 'admin'}},
    }));

    await loginAmSession(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('keeps Kolam bearer SSO ahead of legacy AM auth cookies', async () => {
    const payload = {username: 'admin', password: 'secret'};
    setAccessToken('kolam-token');
    fetchMock
      .mockResolvedValueOnce(jsonResponse(
        {success: true, data: {user: {_id: 'user-current', username: 'admin'}}},
        {'set-cookie': 'am_accessToken=token-123; Path=/; HttpOnly; SameSite=Lax'},
      ))
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        data: {_id: 'user-current', username: 'admin'},
      }));

    await loginAmSession(payload, 'https://am.example.test/api');
    await getAmCurrentUser('https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          Authorization: 'Bearer kolam-token',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
    expect(fetchMock.mock.calls[1][1].headers).toEqual(
      expect.not.objectContaining({
        Cookie: 'am_accessToken=token-123',
      }),
    );
  });

  it('refreshes the Kolam bearer token and retries AM SSO requests after a 401', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue('fresh-kolam-token');
    setAuthSessionHandlers({refreshAccessToken});
    setAccessToken('expired-kolam-token');
    fetchMock
      .mockResolvedValueOnce(jsonResponse(
        {success: false, message: 'Invalid or expired token'},
        {},
        401,
      ))
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        data: {
          summary: {
            totalBalance: 0,
            totalAccounts: 0,
            todayIncoming: {total: 0, count: 0},
            todayOutgoing: {total: 0, count: 0},
            activeDevices: 0,
          },
          transfers: {pending: 0, processing: 0, success: 0, failed: 0, totalAmount: 0},
          recentTransfers: [],
          recentMutasi: [],
          chartData: [],
          devices: [],
        },
      }));

    await getAmDashboard('https://am.example.test/api');

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        credentials: 'omit',
        headers: expect.objectContaining({
          Authorization: 'Bearer expired-kolam-token',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        credentials: 'omit',
        headers: expect.objectContaining({
          Authorization: 'Bearer fresh-kolam-token',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('notifies the Kolam session handler when AM SSO cannot refresh a 401', async () => {
    const refreshAccessToken = jest.fn().mockResolvedValue(undefined);
    const onSessionExpired = jest.fn();
    setAuthSessionHandlers({refreshAccessToken, onSessionExpired});
    setAccessToken('expired-kolam-token');
    fetchMock.mockResolvedValueOnce(jsonResponse(
      {success: false, message: 'Invalid or expired token'},
      {},
      401,
    ));

    await expect(
      getAmDashboard('https://am.example.test/api'),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid or expired token',
    });

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        credentials: 'omit',
        headers: expect.objectContaining({
          Authorization: 'Bearer expired-kolam-token',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads the AM dashboard through the live dashboard endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {
        summary: {
          totalBalance: 0,
          totalAccounts: 0,
          todayIncoming: {total: 0, count: 0},
          todayOutgoing: {total: 0, count: 0},
          activeDevices: 0,
        },
        transfers: {pending: 0, processing: 0, success: 0, failed: 0, totalAmount: 0},
        recentTransfers: [],
        recentMutasi: [],
        chartData: [],
        devices: [],
      },
    }));

    await getAmDashboard('https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/dashboard',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads automation tasks through the AM live task list endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: [{_id: 'task-1'}],
      meta: {total: 1, limit: 20, page: 2},
    }));

    await getAmTasks(
      {
        page: 2,
        limit: 20,
        type: 'send_message',
        status: 'processing',
        serviceAccountId: 'account-1',
        deviceId: 'device-1',
        search: 'buyer',
      },
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/task?page=2&limit=20&type=send_message&status=processing&serviceAccountId=account-1&deviceId=device-1&search=buyer',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('creates automation tasks through the AM live task endpoint', async () => {
    const payload = {
      type: 'send_message',
      deviceId: 'device-1',
      serviceAccountId: 'account-1',
      payload: {message: 'Halo'},
      priority: 5,
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'task-new'}}));

    await createAmTask(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/task',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('controls AM tasks through the live task action endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'task-1'}}));

    await cancelAmTask('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1/cancel',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await retryAmTask('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1/retry',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await forceFailAmTask('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1/force-fail',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads service account detail through the AM live service-account endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'service-account-1', label: 'BCA Main'},
    }));

    await getAmServiceAccountById(
      'service-account-1',
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/service-account/service-account-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('unwraps AM success envelopes without data for void endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, message: 'Service account deleted'}));

    await expect(
      deleteAmServiceAccount('service-account-1', 'https://am.example.test/api'),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/service-account/service-account-1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('maps service account list, create, and update helpers to live AM endpoints', async () => {
    const createPayload = {
      platform: 'tokopedia',
      label: 'Tokopedia Main',
      deviceId: 'device-browser',
      credentials: {phoneNumber: '0899'},
      status: 'inactive',
    };
    const updatePayload = {
      label: 'Tokopedia Updated',
      credentials: {phoneNumber: '0812'},
      status: 'inactive',
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse({success: true, data: [], meta: {total: 0, limit: 20}}))
      .mockResolvedValueOnce(jsonResponse({success: true, data: {_id: 'service-new', ...createPayload}}))
      .mockResolvedValueOnce(jsonResponse({success: true, data: {_id: 'service-new', ...updatePayload}}));

    await getAmServiceAccounts(
      {page: 2, limit: 20, platform: 'tokopedia', status: 'inactive', search: 'main'},
      'https://am.example.test/api',
    );
    await createAmServiceAccount(createPayload, 'https://am.example.test/api');
    await updateAmServiceAccount('service-new', updatePayload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://am.example.test/api/service-account?page=2&limit=20&platform=tokopedia&status=inactive&search=main',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://am.example.test/api/service-account',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(createPayload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'https://am.example.test/api/service-account/service-new',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'omit',
        body: JSON.stringify(updatePayload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('maps AM hardware list, CRUD, ADB, and bulk delete helpers to live endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: [], meta: {total: 0, limit: 20}}));

    await getAmRacks({page: 1, limit: 20}, 'https://am.example.test/api');
    await getAmBoxes({rackId: 'rack-1', limit: 100}, 'https://am.example.test/api');
    await getAmDevices({boxId: 'box-1', limit: 100}, 'https://am.example.test/api');
    await getAmDevicesAdbStatus('box-1', 'https://am.example.test/api');
    await createAmRack({location: 'Room A', description: 'Main', serverIp: '10.0.0.1'}, 'https://am.example.test/api');
    await updateAmRack('rack-1', {location: 'Room B', description: 'Updated', serverIp: '10.0.0.2', status: 'active'}, 'https://am.example.test/api');
    await deleteAmRacks(['rack-1'], 'https://am.example.test/api');
    await createAmBox({rackId: 'rack-1', description: 'Box'}, 'https://am.example.test/api');
    await updateAmBox('box-1', {description: 'Box Updated', status: 'inactive'}, 'https://am.example.test/api');
    await deleteAmBoxes(['box-1'], 'https://am.example.test/api');
    await createAmDevice({boxId: 'box-1', name: 'Phone', connectionType: 'tcp'}, 'https://am.example.test/api');
    await updateAmDevice('device-1', {name: 'Phone 2', connectionType: 'tcp'}, 'https://am.example.test/api');
    await deleteAmDevices(['device-1'], 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://am.example.test/api/rack?page=1&limit=20', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://am.example.test/api/box?rackId=rack-1&limit=100', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://am.example.test/api/device?boxId=box-1&limit=100', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(4, 'https://am.example.test/api/device/adb-status?boxId=box-1', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(5, 'https://am.example.test/api/rack', expect.objectContaining({method: 'POST'}));
    expect(fetchMock).toHaveBeenNthCalledWith(6, 'https://am.example.test/api/rack/rack-1', expect.objectContaining({method: 'PUT'}));
    expect(fetchMock).toHaveBeenNthCalledWith(7, 'https://am.example.test/api/racks', expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ids: ['rack-1']}),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(8, 'https://am.example.test/api/box', expect.objectContaining({method: 'POST'}));
    expect(fetchMock).toHaveBeenNthCalledWith(9, 'https://am.example.test/api/box/box-1', expect.objectContaining({method: 'PUT'}));
    expect(fetchMock).toHaveBeenNthCalledWith(10, 'https://am.example.test/api/boxes', expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ids: ['box-1']}),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(11, 'https://am.example.test/api/device', expect.objectContaining({method: 'POST'}));
    expect(fetchMock).toHaveBeenNthCalledWith(12, 'https://am.example.test/api/device/device-1', expect.objectContaining({method: 'PUT'}));
    expect(fetchMock).toHaveBeenNthCalledWith(13, 'https://am.example.test/api/devices', expect.objectContaining({
      method: 'DELETE',
      credentials: 'omit',
      body: JSON.stringify({ids: ['device-1']}),
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
        'x-source': appConfig.amSourceHeader,
      }),
    }));
  });

  it('maps AM webhook config, events, logs, and delete helpers to live endpoints', async () => {
    const configPayload = {
      url: 'https://hooks.example.test/am',
      events: ['transfer.success'],
      secret: '1234567890abcdef',
      status: 'active' as const,
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: [], meta: {total: 0, limit: 20}}));

    await getAmWebhookConfigs('https://am.example.test/api');
    await getAmWebhookEvents('https://am.example.test/api');
    await createAmWebhookConfig(configPayload, 'https://am.example.test/api');
    await updateAmWebhookConfig('webhook-1', {status: 'inactive'}, 'https://am.example.test/api');
    await getAmWebhookLogs(
      {page: 2, limit: 20, event: 'transfer.success', direction: 'outgoing'},
      'https://am.example.test/api',
    );
    await deleteAmWebhookConfig('webhook-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'https://am.example.test/api/webhook/config', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'https://am.example.test/api/webhook/events', expect.objectContaining({method: 'GET'}));
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'https://am.example.test/api/webhook/config', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(configPayload),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(4, 'https://am.example.test/api/webhook/config/webhook-1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({status: 'inactive'}),
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      'https://am.example.test/api/webhook/logs?page=2&limit=20&event=transfer.success&direction=outgoing',
      expect.objectContaining({method: 'GET'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(6, 'https://am.example.test/api/webhook/config/webhook-1', expect.objectContaining({
      method: 'DELETE',
      credentials: 'omit',
      headers: expect.objectContaining({
        'x-source': appConfig.amSourceHeader,
      }),
    }));
  });

  it('maps AM roles lookup to the live user role endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: [{_id: 'role-admin', name: 'Admin'}]}));

    await getAmRoles('https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/roles',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('throws AM error envelopes without data', async () => {
    fetchMock.mockResolvedValue(jsonResponse(
      {success: false, message: 'Service account not found'},
      {},
      404,
    ));

    await expect(
      deleteAmServiceAccount('missing-service', 'https://am.example.test/api'),
    ).rejects.toThrow('Service account not found');
  });

  it('loads AM chat messages through the live read-only chat endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: [{_id: 'message-1', body: 'Halo'}],
      meta: {total: 1, limit: 20, page: 1},
    }));

    await getAmChatMessages(
      {
        page: 1,
        limit: 20,
        platform: 'whatsapp',
        serviceAccountId: 'account-1',
        contactId: 'contact-1',
        direction: 'incoming',
      },
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/message?page=1&limit=20&platform=whatsapp&serviceAccountId=account-1&contactId=contact-1&direction=incoming',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads AM chat contacts through the live read-only chat endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: [{_id: 'contact-1', name: 'Buyer'}],
      meta: {total: 1, limit: 20, page: 1},
    }));

    await getAmChatContacts(
      {
        page: 1,
        limit: 20,
        platform: 'tokopedia',
        serviceAccountId: 'account-1',
        search: 'buyer',
      },
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/contact?page=1&limit=20&platform=tokopedia&serviceAccountId=account-1&search=buyer',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads AM chat message detail through the live read-only chat endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'message-1', body: 'Halo'},
    }));

    await getAmChatMessageById('message-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/message/message-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads AM chat contact detail through the live read-only chat endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'contact-1', name: 'Buyer'},
    }));

    await getAmChatContactById('contact-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/contact/contact-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('sends AM chat messages through the live chat endpoint', async () => {
    const payload = {
      serviceAccountId: 'account-1',
      contactId: 'contact-1',
      body: 'Halo',
      platform: 'whatsapp',
    };
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'message-new', ...payload},
      taskId: 'task-send-1',
    }));

    const result = await sendAmChatMessage(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/message/send',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
    expect(result).toEqual({
      message: {_id: 'message-new', ...payload},
      taskId: 'task-send-1',
    });
  });

  it('creates AM chat contacts through the live chat endpoint', async () => {
    const payload = {
      platform: 'tokopedia',
      serviceAccountId: 'account-1',
      externalId: 'buyer-1',
      name: 'Buyer',
    };
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'contact-new', ...payload},
    }));

    await createAmChatContact(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/chat/contact',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('creates transfers through the AM live transfer endpoint', async () => {
    const payload = {
      transferType: 'transfer' as const,
      transferMethod: 'BI FAST',
      transactionPurpose: 'Purchase',
      recipientAccount: '999',
      recipientName: 'Vendor Baru',
      recipientBank: 'Mandiri',
      amount: 250000,
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'transfer-new'}}));

    await createAmTransfer(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/transfer',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('controls AM transfers through the live transfer action endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'transfer-1'}}));

    await cancelAmTransfer('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1/cancel',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await retryAmTransfer('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1/retry',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await forceFailAmTransfer('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1/force-fail',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads hardware detail resources through AM live get-by-id endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'rack-live'}}));

    await getAmRackById('rack-live', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/rack/rack-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'box-live'}}));

    await getAmBoxById(
      'box-live',
      {rackId: 'rack-live'},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/box/box-live?rackId=rack-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'device-live'}}));

    await getAmDeviceById(
      'device-live',
      {boxId: 'box-live'},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-live?boxId=box-live',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('returns the live AM webhook test ping message', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      message: 'Test ping dispatched to 2 active config(s)',
    }));

    await expect(testAmWebhookPing('https://am.example.test/api')).resolves.toEqual({
      success: true,
      message: 'Test ping dispatched to 2 active config(s)',
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/webhook/test-ping',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads AM user detail through the live user endpoint', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {_id: 'user-1', username: 'admin@dunia-anura.com'},
    }));

    await getAmUserById('user-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/users/user-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('updates AM users through the live user endpoint', async () => {
    const payload = {
      fullName: 'Current AM User Updated',
      username: 'current.updated@dunia-anura.com',
      password: 'NewPass1!',
    };
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {_id: 'user-current'}}));

    await updateAmUser('user-current', payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/users/user-current',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('controls AM device services through the live device service endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true}));

    await startAmDeviceService('device-1', 'account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-1/service/start',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({serviceAccountId: 'account-1'}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await stopAmDeviceService('device-1', 'account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-1/service/stop',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({serviceAccountId: 'account-1'}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await sendAmDeviceServiceInput(
      'device-1',
      'otp',
      '123456',
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-1/service/input',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({type: 'otp', value: '123456'}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('uses live AM Tokopedia session runtime endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({success: true, data: {started: true}}));

    await verifyAmTokopediaSession('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/verify',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await startAmTokopediaQrLogin('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/qr-start',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await restartAmTokopediaSession('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/restart',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('writes AM Tokopedia session settings through the live service-account endpoints', async () => {
    const cookies = [{name: 'shop', value: 'token'}];

    await uploadAmTokopediaSession('account-1', cookies, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({cookies}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await updateAmTokopediaLoginMethod(
      'account-1',
      {qrTiktokLogin: true, loginFillOnly: false},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/login-method',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'omit',
        body: JSON.stringify({qrTiktokLogin: true, loginFillOnly: false}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await updateAmTokopediaCaptchaSettings(
      'account-1',
      {captchaAutoSolve: true, anthropicApiKey: 'sk-ant'},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/captcha',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'omit',
        body: JSON.stringify({captchaAutoSolve: true, anthropicApiKey: 'sk-ant'}),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('runs AM Tokopedia API monitor jobs against live service-account endpoints', async () => {
    const payload = {autoRestart: true, fillLogin: true};

    await runAmTokopediaApiMonitor(
      'account-1',
      payload,
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/api-monitor',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmTokopediaApiMonitorStatus('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/api-monitor',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('clears AM service account sessions through the live session endpoint', async () => {
    await clearAmServiceAccountSession('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/session',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('bulk deletes AM activity logs through the live activity-log endpoint', async () => {
    const payload = {
      confirm: true as const,
      filter: {status: 'success', type: 'api'},
    };
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: {deletedCount: 3},
    }));

    await bulkDeleteAmActivityLogs(payload, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/activity-log/bulk-delete',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('loads AM detail and read surfaces through live FE parity endpoints', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      success: true,
      data: [],
      meta: {total: 0, limit: 20, page: 1},
    }));

    await getAmTaskById('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmDeviceServices('device-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-1/services',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmDeviceServiceLogs(
      'device-1',
      {limit: 80, source: 'realtime', page: 2},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/device/device-1/service/logs?limit=80&source=realtime&page=2',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmTransfers(
      {serviceAccountId: 'account-1', status: 'pending', page: 2, limit: 20},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer?serviceAccountId=account-1&status=pending&page=2&limit=20',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmTransferById('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmMutasi(
      {accountId: 'account-1', deviceId: 'device-1', type: 'masuk', page: 2, limit: 20},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/mutasi?accountId=account-1&deviceId=device-1&type=masuk&page=2&limit=20',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmMutasiSummary('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/mutasi/summary?accountId=account-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmMutasiById('mutasi-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/mutasi/mutasi-1',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmUsers(
      {search: 'admin', role: 'role-1', page: 2, limit: 20},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/users?search=admin&role=role-1&page=2&limit=20',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmActivityLogs(
      {search: 'login', method: 'POST', status: 'success', page: 2, limit: 20},
      'https://am.example.test/api',
    );

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/activity-log?search=login&method=POST&status=success&page=2&limit=20',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await getAmActivityLogStats(14, 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/activity-log/stats?days=14',
      expect.objectContaining({
        method: 'GET',
        credentials: 'omit',
        headers: expect.objectContaining({
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('builds authenticated AM mutasi receipt URLs against the live server', () => {
    expect(getAmMutasiReceiptUrl('mutasi 1', 'https://am.example.test/api/')).toBe(
      'https://am.example.test/api/mutasi/mutasi%201/receipt',
    );
  });

  it('builds AM device service QR URLs only for live QR endpoints', () => {
    expect(getAmDeviceServiceQrUrl('device 1', 'shopee', 'qr 1', 'https://am.example.test/api/')).toBe(
      'https://am.example.test/api/device/device%201/service/shopee-qr?t=qr%201',
    );
    expect(getAmDeviceServiceQrUrl('device 1', 'whatsapp', 'qr 1', 'https://am.example.test/api/')).toBe(
      'https://am.example.test/api/device/device%201/service/whatsapp-qr?t=qr%201',
    );
    expect(getAmDeviceServiceQrUrl('device 1', 'tokopedia', 'qr 1', 'https://am.example.test/api/')).toBeNull();
  });
});

function jsonResponse(
  payload: unknown,
  headers: Record<string, string> = {},
  status = 200,
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: jest.fn((name: string) => headers[name.toLowerCase()] ?? headers[name]),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
