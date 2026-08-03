import {appConfig} from '../src/config/app';
import {clearResponseCookieJar} from '../src/lib/api-client';
import {
  bulkDeleteAmActivityLogs,
  cancelAmTask,
  cancelAmTransfer,
  clearAmServiceAccountSession,
  createAmChatContact,
  createAmTask,
  createAmTransfer,
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
  getAmDeviceById,
  getAmDeviceServiceQrUrl,
  getAmMutasiReceiptUrl,
  getAmRackById,
  getAmServiceAccountById,
  getAmTasks,
  getAmUserById,
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
  updateAmTokopediaCaptchaSettings,
  updateAmTokopediaLoginMethod,
  updateAmUser,
  uploadAmTokopediaSession,
  verifyAmTokopediaSession,
} from '../src/services/am-api';

const fetchMock = jest.fn();

describe('AM API service', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({success: true, message: 'Logout success'}));
    globalThis.fetch = fetchMock;
    clearResponseCookieJar();
  });

  it('logs out of the live AM session with AM source and cookie credentials', async () => {
    await logoutAmSession('https://am.example.test/api');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://am.example.test/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('logs into the live AM session with cookie credentials', async () => {
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'Content-Type': 'application/json',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
  });

  it('reuses the live AM auth cookie after login', async () => {
    const payload = {username: 'admin', password: 'secret'};
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'am_accessToken=token-123',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await retryAmTask('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1/retry',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await forceFailAmTask('task-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/task/task-1/force-fail',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await retryAmTransfer('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1/retry',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await forceFailAmTransfer('transfer-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/transfer/transfer-1/force-fail',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({serviceAccountId: 'account-1'}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({serviceAccountId: 'account-1'}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({type: 'otp', value: '123456'}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await startAmTokopediaQrLogin('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/qr-start',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'x-source': appConfig.amSourceHeader,
        }),
      }),
    );

    await restartAmTokopediaSession('account-1', 'https://am.example.test/api');

    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://am.example.test/api/service-account/account-1/tokopedia-session/restart',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({cookies}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({qrTiktokLogin: true, loginFillOnly: false}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify({captchaAutoSolve: true, anthropicApiKey: 'sk-ant'}),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
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
        credentials: 'include',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          Cookie: 'kolamCsrf=',
          'Content-Type': 'application/json',
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

function jsonResponse(payload: unknown, headers: Record<string, string> = {}) {
  return {
    ok: true,
    status: 200,
    headers: {
      get: jest.fn((name: string) => headers[name.toLowerCase()] ?? headers[name]),
    },
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
