import { appConfig } from '../src/config/app';
import { setAccessToken } from '../src/lib/api-client';
import { deleteKolamBrand } from '../src/services/kolam-brand-api';
import {
  deleteKolamCategory,
  getKolamCategories,
  uploadKolamCategoryIcon,
} from '../src/services/kolam-category-api';
import {
  createKolamRole,
  createKolamHeroSlide,
  deleteKolamActivityLogs,
  deleteKolamCustomerNotice,
  deleteKolamHeroSlide,
  deleteKolamRole,
  getKolamActivityLogs,
  getKolamActivityLogStats,
  getKolamCtaSectionAdmin,
  getKolamCustomerNoticesAdmin,
  getKolamHeroSlidesAdmin,
  getKolamMarketplaceContentAdmin,
  getKolamPendingCustomerVerifications,
  getKolamRoles,
  getKolamWebSetting,
  getKolamWebSettingVersion,
  getKolamWebSettingVersions,
  deleteKolamNotificationSound,
  getKolamChatConversations,
  getKolamChatUnreadTotal,
  reorderKolamHeroSlides,
  updateKolamBioactiveEcosystem,
  updateKolamCtaSection,
  updateKolamFeaturedCollections,
  updateKolamHeroSlide,
  updateKolamRole,
  updateKolamWebSetting,
  updateKolamWebSettingVersion,
  uploadKolamDaraAvatar,
  uploadKolamMarketplaceContentImage,
  uploadKolamNotificationSound,
  uploadKolamWebSettingLogo,
  upsertKolamCustomerNotice,
} from '../src/services/kolam-api';

const fetchMock = jest.fn();

describe('Kolam Settings API contracts', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
  });

  it('unwraps Web Settings through direct BE with the Kolam source header', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          companyName: 'Dunia Anura',
          version: '1.2.3',
          maintenance: {
            marketplace: false,
            pos: true,
          },
        },
      }),
    );

    await expect(getKolamWebSetting()).resolves.toMatchObject({
      companyName: 'Dunia Anura',
      version: '1.2.3',
      maintenance: {
        marketplace: false,
        pos: true,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests the app-specific Web Settings version endpoint through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        version: '2.0.0',
        app: 'pos',
        updatedAt: '2026-07-16T00:00:00.000Z',
      }),
    );

    await expect(getKolamWebSettingVersion('pos')).resolves.toMatchObject({
      version: '2.0.0',
      app: 'pos',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/version?app=pos`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('requests all Web Settings versions through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        versions: {
          kolam: '2.1.0',
          enclonura: '1.5.0',
          pos: '3.0.0',
          marketplace: '4.0.0',
        },
        updatedAt: '2026-07-16T00:00:00.000Z',
      }),
    );

    await expect(getKolamWebSettingVersions()).resolves.toMatchObject({
      versions: expect.objectContaining({
        kolam: '2.1.0',
        marketplace: '4.0.0',
      }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/version/all`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('sends Web Settings updates to the live backend contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          companyName: 'Kolam Dunia Anura',
          livechatOnline: true,
        },
      }),
    );

    await updateKolamWebSetting({
      companyName: 'Kolam Dunia Anura',
      livechatOnline: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-source': appConfig.kolamSourceHeader,
        }),
        body: JSON.stringify({
          companyName: 'Kolam Dunia Anura',
          livechatOnline: true,
        }),
      }),
    );
  });

  it('sends minimal production Web Settings update body to the live backend contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          companyName: 'Dunia Anura Production',
          livechatOnline: true,
        },
      }),
    );

    await updateKolamWebSetting({
      companyName: 'Dunia Anura Production',
      companyTagline: 'Aquatic life',
      maintenanceMode: {pos: true, marketplace: false},
      livechatOnline: true,
      originAddress: {
        addressLine1: 'Gudang Barat',
        city: 'Jakarta Barat',
        province: 'DKI Jakarta',
        postalCode: '11550',
        latitude: -6.1,
        longitude: 106.7,
      },
      socialMedia: {instagram: 'https://instagram.com/duniaanura'},
      staffDesktopOnly: {
        enabled: true,
        redirectUrl: 'https://desktop.dunia-anura.com',
      },
      kolamMacAccess: {
        enabled: true,
        allowWebBrowser: false,
        bypassSuperAdmin: true,
        allowedMacAddresses: ['AA:BB:CC:DD:EE:FF'],
      },
      staffOtpLogin: {
        enabled: true,
        otpExpireMinutes: 10,
        resendCooldownSeconds: 60,
        maxAttempts: 5,
        lockMinutes: 15,
      },
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        user: 'mailer@duniaanura.com',
        fromEmail: 'no-reply@duniaanura.com',
        fromName: 'Kolam',
        secure: true,
      },
      firebase: {
        enabled: true,
        projectId: 'dunia-anura',
        clientEmail: 'firebase-adminsdk@dunia-anura.iam.gserviceaccount.com',
      },
      teamChatGroupCallEnabled: true,
      daraBusinessEnabled: true,
      daraToolsEnabled: true,
      daraKnowledgeEnabled: true,
      daraHandoffNotifyEnabled: true,
      daraInsightsEnabled: true,
      daraAutoReportEnabled: true,
      daraImageAnalysisEnabled: true,
      daraTaxEnabled: true,
      daraSeoEnabled: true,
      daraTaxRegulationWatcherEnabled: false,
      daraTaxComplianceJobEnabled: true,
      daraTaxLlmNarrativeEnabled: false,
      daraWebstoreFulfillmentEnabled: true,
      daraStaffOpsNotifyEnabled: true,
      daraStaffWaNotifyEnabled: true,
      daraOlshopCustomerNotifyEnabled: true,
      daraOwnerDigestEnabled: true,
      daraOwnerDigestWaEnabled: true,
      daraOwnerDigestFcmEnabled: true,
      daraOwnerFcmUrgentEnabled: true,
      kolamPlugins: {
        enclosure: {enabled: true, installedVersion: '1.4.58'},
        taskManager: {enabled: false, installedVersion: '1.0.13'},
        layanan: {enabled: true, installedVersion: '1.10.17'},
        freyer: {enabled: true, installedVersion: '1.3.4'},
        kpi: {enabled: true, installedVersion: '0.9.10'},
        chat: {enabled: false, storeEnabled: false, installedVersion: '0.2.74'},
        dara: {enabled: true, installedVersion: '0.1.44'},
        proyek: {enabled: true, installedVersion: '0.4.0'},
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          companyName: 'Dunia Anura Production',
          companyTagline: 'Aquatic life',
          maintenanceMode: {pos: true, marketplace: false},
          livechatOnline: true,
          originAddress: {
            addressLine1: 'Gudang Barat',
            city: 'Jakarta Barat',
            province: 'DKI Jakarta',
            postalCode: '11550',
            latitude: -6.1,
            longitude: 106.7,
          },
          socialMedia: {instagram: 'https://instagram.com/duniaanura'},
          staffDesktopOnly: {
            enabled: true,
            redirectUrl: 'https://desktop.dunia-anura.com',
          },
          kolamMacAccess: {
            enabled: true,
            allowWebBrowser: false,
            bypassSuperAdmin: true,
            allowedMacAddresses: ['AA:BB:CC:DD:EE:FF'],
          },
          staffOtpLogin: {
            enabled: true,
            otpExpireMinutes: 10,
            resendCooldownSeconds: 60,
            maxAttempts: 5,
            lockMinutes: 15,
          },
          smtp: {
            host: 'smtp.gmail.com',
            port: 465,
            user: 'mailer@duniaanura.com',
            fromEmail: 'no-reply@duniaanura.com',
            fromName: 'Kolam',
            secure: true,
          },
          firebase: {
            enabled: true,
            projectId: 'dunia-anura',
            clientEmail:
              'firebase-adminsdk@dunia-anura.iam.gserviceaccount.com',
          },
          teamChatGroupCallEnabled: true,
          daraBusinessEnabled: true,
          daraToolsEnabled: true,
          daraKnowledgeEnabled: true,
          daraHandoffNotifyEnabled: true,
          daraInsightsEnabled: true,
          daraAutoReportEnabled: true,
          daraImageAnalysisEnabled: true,
          daraTaxEnabled: true,
          daraSeoEnabled: true,
          daraTaxRegulationWatcherEnabled: false,
          daraTaxComplianceJobEnabled: true,
          daraTaxLlmNarrativeEnabled: false,
          daraWebstoreFulfillmentEnabled: true,
          daraStaffOpsNotifyEnabled: true,
          daraStaffWaNotifyEnabled: true,
          daraOlshopCustomerNotifyEnabled: true,
          daraOwnerDigestEnabled: true,
          daraOwnerDigestWaEnabled: true,
          daraOwnerDigestFcmEnabled: true,
          daraOwnerFcmUrgentEnabled: true,
          kolamPlugins: {
            enclosure: {enabled: true, installedVersion: '1.4.58'},
            taskManager: {enabled: false, installedVersion: '1.0.13'},
            layanan: {enabled: true, installedVersion: '1.10.17'},
            freyer: {enabled: true, installedVersion: '1.3.4'},
            kpi: {enabled: true, installedVersion: '0.9.10'},
            chat: {
              enabled: false,
              storeEnabled: false,
              installedVersion: '0.2.74',
            },
            dara: {enabled: true, installedVersion: '0.1.44'},
            proyek: {enabled: true, installedVersion: '0.4.0'},
          },
        }),
      }),
    );
  });

  it('sends Web Settings version updates to the live backend contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        message: 'Version updated',
        version: '2.4.0',
        app: 'marketplace',
      }),
    );

    await updateKolamWebSettingVersion({
      app: 'marketplace',
      version: '2.4.0',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/version`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          app: 'marketplace',
          version: '2.4.0',
        }),
      }),
    );
  });

  it('uploads and resets Web Settings notification sounds through the live backend contract', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          message: 'Notification sound uploaded',
          groupCallRingtone: 'media/audios/ring.wav',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({message: 'Notification sound reset to default'}),
      );

    await expect(
      uploadKolamNotificationSound('group-call', 'C:\\sounds\\ring.wav'),
    ).resolves.toMatchObject({
      groupCallRingtone: 'media/audios/ring.wav',
    });
    await expect(deleteKolamNotificationSound('sales')).resolves.toMatchObject({
      message: 'Notification sound reset to default',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/websetting/notification-sound/group-call`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.not.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(FormData),
      }),
    );
    expect(appendSpy).toHaveBeenCalledWith(
      'sound',
      expect.objectContaining({
        name: 'ring.wav',
        type: 'audio/wav',
      }),
    );
    appendSpy.mockRestore();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/websetting/notification-sound/sales`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });

  it('maps Marketplace Landing hero slide CRUD and reorder contracts', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              _id: 'slide-1',
              title: 'Dunia Anura',
              image: 'media/hero.jpg',
              order: 0,
              isActive: true,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'slide-2',
            title: 'New Hero',
            image: 'media/new.jpg',
            order: 1,
            isActive: true,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'slide-2',
            title: 'Updated Hero',
            image: 'media/new.jpg',
            order: 1,
            isActive: false,
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({data: [{_id: 'slide-2'}]}))
      .mockResolvedValueOnce(jsonResponse({message: 'Hero slide deleted'}));

    await expect(getKolamHeroSlidesAdmin()).resolves.toEqual([
      expect.objectContaining({_id: 'slide-1'}),
    ]);
    await expect(
      createKolamHeroSlide({
        title: 'New Hero',
        imageLocalUri: 'C:\\hero\\new.jpg',
        isActive: true,
      }),
    ).resolves.toMatchObject({_id: 'slide-2'});
    await expect(
      updateKolamHeroSlide('slide-2', {
        title: 'Updated Hero',
        isActive: false,
      }),
    ).resolves.toMatchObject({title: 'Updated Hero'});
    await expect(reorderKolamHeroSlides(['slide-2'])).resolves.toEqual([
      expect.objectContaining({_id: 'slide-2'}),
    ]);
    await expect(deleteKolamHeroSlide('slide-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/websetting/hero-slides/admin`,
      expect.objectContaining({method: 'GET'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/websetting/hero-slides`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/websetting/hero-slides/slide-2`,
      expect.objectContaining({
        method: 'PUT',
        body: expect.any(FormData),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      `${appConfig.kolamApiBaseUrl}/websetting/hero-slides/reorder`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({slideIds: ['slide-2']}),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      `${appConfig.kolamApiBaseUrl}/websetting/hero-slides/slide-1`,
      expect.objectContaining({method: 'DELETE'}),
    );
    expect(appendSpy).toHaveBeenCalledWith(
      'image',
      expect.objectContaining({name: 'new.jpg', type: 'image/jpeg'}),
    );
    appendSpy.mockRestore();
  });

  it('maps Marketplace Landing section, notice, content upload, logo, and DARA avatar contracts', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: 'Jelajahi Dunia Species',
            description: 'Temukan koleksi',
            backgroundImage: '',
            buttonText: 'View All Species',
            buttonLink: '/species',
            isActive: true,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            title: 'CTA Baru',
            description: 'Deskripsi',
            buttonText: 'Buka',
            buttonLink: '/species',
            isActive: false,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              key: 'migration',
              title: 'Migrasi',
              message: 'Marketplace update',
              isActive: true,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            key: 'migration',
            title: 'Migrasi',
            message: 'Marketplace update',
            isActive: true,
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({message: 'Notice deleted'}))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            marketplaceContent: {
              featuredCollections: [{title: 'Amphibians', image: ''}],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            marketplaceContent: {
              featuredCollections: [{title: 'Amphibians', image: 'media/a.jpg'}],
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            marketplaceContent: {
              bioactiveEcosystem: {steps: [{key: 'setup', image: ''}]},
            },
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({data: {image: 'media/featured.jpg'}}))
      .mockResolvedValueOnce(
        jsonResponse({data: {logo: 'media/logo.png', companyName: 'Kolam'}}),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          daraAvatarUrl: '/media/dara/avatar.png',
        }),
      );

    await expect(getKolamCtaSectionAdmin()).resolves.toMatchObject({
      title: 'Jelajahi Dunia Species',
    });
    await expect(
      updateKolamCtaSection({
        title: 'CTA Baru',
        isActive: false,
        backgroundImageLocalUri: 'C:\\images\\cta.png',
      }),
    ).resolves.toMatchObject({title: 'CTA Baru'});
    await expect(getKolamCustomerNoticesAdmin()).resolves.toEqual([
      expect.objectContaining({key: 'migration'}),
    ]);
    await expect(
      upsertKolamCustomerNotice({
        key: 'migration',
        title: 'Migrasi',
        message: 'Marketplace update',
        isActive: true,
      }),
    ).resolves.toMatchObject({key: 'migration'});
    await expect(deleteKolamCustomerNotice('migration')).resolves.toBeUndefined();
    await expect(getKolamMarketplaceContentAdmin()).resolves.toMatchObject({
      featuredCollections: [expect.objectContaining({title: 'Amphibians'})],
    });
    await expect(
      updateKolamFeaturedCollections([
        {
          title: 'Amphibians',
          image: 'media/a.jpg',
          order: 0,
          isActive: true,
        },
      ]),
    ).resolves.toMatchObject({
      featuredCollections: [expect.objectContaining({image: 'media/a.jpg'})],
    });
    await expect(
      updateKolamBioactiveEcosystem({
        steps: [{key: 'setup', image: '', order: 0, isActive: true}],
      }),
    ).resolves.toMatchObject({
      bioactiveEcosystem: {steps: [expect.objectContaining({key: 'setup'})]},
    });
    await expect(
      uploadKolamMarketplaceContentImage(
        'featured-collections',
        'C:\\images\\featured.jpg',
      ),
    ).resolves.toBe('media/featured.jpg');
    await expect(uploadKolamWebSettingLogo('C:\\images\\logo.png')).resolves.toMatchObject({
      logo: 'media/logo.png',
    });
    await expect(uploadKolamDaraAvatar('C:\\images\\avatar.png')).resolves.toMatchObject({
      daraAvatarUrl: '/media/dara/avatar.png',
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/websetting/cta-section`,
      expect.objectContaining({
        method: 'PUT',
        body: expect.any(FormData),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      `${appConfig.kolamApiBaseUrl}/websetting/customer-notices/migration`,
      expect.objectContaining({method: 'DELETE'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      7,
      `${appConfig.kolamApiBaseUrl}/websetting`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          marketplaceContent: {
            featuredCollections: [
              {
                title: 'Amphibians',
                image: 'media/a.jpg',
                order: 0,
                isActive: true,
              },
            ],
          },
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      9,
      `${appConfig.kolamApiBaseUrl}/websetting/marketplace-content/featured-collections/image`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      10,
      `${appConfig.kolamApiBaseUrl}/websetting/upload-photos`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      11,
      `${appConfig.kolamApiBaseUrl}/websetting/dara-avatar`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );
    expect(appendSpy).toHaveBeenCalledWith(
      'backgroundImage',
      expect.objectContaining({name: 'cta.png', type: 'image/png'}),
    );
    expect(appendSpy).toHaveBeenCalledWith(
      'photo',
      expect.objectContaining({name: 'logo.png', type: 'image/png'}),
    );
    appendSpy.mockRestore();
  });

  it('surfaces notification sound permission errors from the live backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue(JSON.stringify({message: 'Forbidden'})),
    });

    await expect(
      uploadKolamNotificationSound('assigned', 'C:\\sounds\\bell.mp3'),
    ).rejects.toThrow('Forbidden');

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/websetting/notification-sound/assigned`,
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('surfaces Web Settings update permission errors from the live backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue(JSON.stringify({message: 'Forbidden'})),
    });

    await expect(
      updateKolamWebSetting({companyName: 'No access'}),
    ).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    });
  });

  it('maps Role Management from /roles data responses through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        message: 'Roles fetched successfully',
        data: [
          { _id: 'role-1', name: 'Super Administrator', key: 'super-admin' },
          { _id: 'role-2', name: 'POS Cashier', key: 'pos' },
        ],
      }),
    );

    await expect(getKolamRoles()).resolves.toEqual([
      expect.objectContaining({ key: 'super-admin' }),
      expect.objectContaining({ key: 'pos' }),
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/roles`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('sends Role Management create and update bodies to the live backend', async () => {
    const body = {
      name: 'Warehouse Staff',
      key: 'warehouse-staff',
      description: 'Gudang produksi',
      permissions: [{resource: 'role', actions: ['view']}],
    };
    const updatedBody = {
      ...body,
      permissions: [{resource: 'role', actions: ['view', 'update']}],
    };

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          message: 'Role created successfully',
          data: {_id: 'role-3', ...body},
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          message: 'Role updated successfully',
          data: {_id: 'role-3', ...updatedBody},
        }),
      );

    await expect(createKolamRole(body)).resolves.toEqual(
      expect.objectContaining({key: 'warehouse-staff'}),
    );
    await expect(updateKolamRole('role-3', updatedBody)).resolves.toEqual(
      expect.objectContaining({_id: 'role-3'}),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/roles`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/roles/role-3`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updatedBody),
      }),
    );
  });

  it('sends Role Management delete requests to the live backend', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({message: 'Role deleted successfully'}),
    );

    await expect(deleteKolamRole('role-3')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/roles/role-3`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });

  it('surfaces Role Management permission errors from the live backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue(JSON.stringify({message: 'Forbidden'})),
    });

    await expect(
      updateKolamRole('role-3', {
        name: 'No Access',
        key: 'no-access',
        permissions: [{resource: 'role', actions: ['view']}],
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: 'Forbidden',
    });
  });

  it('requests customer visit confirmations through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            pendingServiceId: 'pending-service-1',
            taskKind: 'maintenance',
            taskId: 'task-1',
            executionId: 'execution-1',
            visitTitle: 'Kunjungan layanan',
          },
        ],
      }),
    );

    await expect(getKolamPendingCustomerVerifications()).resolves.toEqual([
      expect.objectContaining({
        pendingServiceId: 'pending-service-1',
        executionId: 'execution-1',
      }),
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/subscriptions/my/pending-customer-verifications`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('requests Activity Log with backend filters and omits empty params through direct BE', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [],
        meta: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }),
    );

    await getKolamActivityLogs({
      page: 2,
      limit: 10,
      status: '',
      search: 'checkout',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/activity-log?page=2&limit=10&search=checkout`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('requests Activity Log stats and optional delete through direct BE', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {
            since: '2026-07-19T00:00:00.000Z',
            days: 14,
            byType: [{_id: 'api', count: 3}],
            byStatus: [{_id: 'success', count: 2}],
            topUsers: [],
            topPaths: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: {deletedCount: 4},
        }),
      );

    await expect(getKolamActivityLogStats(14)).resolves.toEqual(
      expect.objectContaining({
        data: expect.objectContaining({days: 14}),
      }),
    );
    await expect(deleteKolamActivityLogs()).resolves.toEqual(
      expect.objectContaining({
        data: {deletedCount: 4},
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/activity-log/stats?days=14`,
      expect.objectContaining({method: 'GET'}),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/activity-log`,
      expect.objectContaining({method: 'DELETE'}),
    );
  });

  it('deletes a brand through the direct Kolam backend contract', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    await expect(deleteKolamBrand('brand-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/brand/brand-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('deletes a category through the direct Kolam backend contract', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }));

    await expect(deleteKolamCategory('cat-1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/category/cat-1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('falls back from category tree to flat category endpoint when needed', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }))
      .mockResolvedValueOnce(jsonResponse({ data: [], pagination: {} }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              _id: 'cat-1',
              name: 'Peralatan',
              icon: 'media/category/peralatan.png',
            },
          ],
          pagination: { total: 1 },
        }),
      );

    await expect(getKolamCategories()).resolves.toEqual([
      expect.objectContaining({ id: 'cat-1', name: 'Peralatan' }),
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/category/tree?maxDepth=3`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/category?limit=1000&tree=true`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `${appConfig.kolamApiBaseUrl}/category?limit=1000`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('builds a local category tree from a flat backend list', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            { _id: 'cat-1', name: 'Peralatan' },
            {
              _id: 'cat-2',
              name: 'Filter',
              parent: { _id: 'cat-1', name: 'Peralatan' },
            },
          ],
          pagination: { total: 2 },
        }),
      );

    await expect(getKolamCategories()).resolves.toEqual([
      expect.objectContaining({
        id: 'cat-1',
        children: [expect.objectContaining({ id: 'cat-2', level: 1 })],
      }),
    ]);
  });

  it('uploads a category icon through the backend photos contract and refreshes detail', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ message: 'ok', photos: ['icon.png'] }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            _id: 'cat-1',
            name: 'Peralatan',
            icon: 'media/category/icon.png',
          },
        }),
      );

    await expect(
      uploadKolamCategoryIcon('cat-1', 'C:\\icons\\peralatan.png'),
    ).resolves.toEqual(
      expect.objectContaining({
        iconUrl: 'https://amfibi.dunia-anura.com/media/category/icon.png',
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${appConfig.kolamApiBaseUrl}/category/cat-1/photos`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `${appConfig.kolamApiBaseUrl}/category/cat-1`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('requests chat unread conversations through the plugin backend contract', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: [
          {
            _id: 'conv-1',
            platform: 'tokopedia',
            lastMessagePreview: 'Masih tersedia?',
            unreadCount: 3,
          },
        ],
      }),
    );

    await expect(getKolamChatUnreadTotal()).resolves.toBe(3);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/chat/conversations?status=open&unreadOnly=true&limit=100`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-source': appConfig.kolamSourceHeader,
        }),
      }),
    );
  });

  it('omits empty chat conversation filters before hitting the backend', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({success: true, data: []}));

    await expect(
      getKolamChatConversations({
        status: 'open',
        page: 1,
        limit: 50,
      }),
    ).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.kolamApiBaseUrl}/chat/conversations?status=open&page=1&limit=50`,
      expect.objectContaining({method: 'GET'}),
    );
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
