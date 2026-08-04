import {
  buildKolamTermsTemplateCreateBody,
  buildKolamTermsTemplateDetailRoute,
  buildKolamTermsTemplateUpdateBody,
  canArchiveKolamTermsTemplate,
  canPublishKolamTermsTemplate,
  createEmptyKolamTermsTemplateFormState,
  formatKolamTermsTemplateComplaintWindow,
  formatKolamTermsTemplateStatusLabel,
  getKolamTermsTemplateRouteId,
  getKolamTermsTemplateSurfaceMode,
  isKolamTermsTemplateDetailRoute,
  isKolamTermsTemplateEditRoute,
  isKolamTermsTemplateFormEditable,
  isKolamTermsTemplateListRoute,
  isKolamTermsTemplateNewRoute,
  isKolamTermsTemplateRoute,
  normalizeKolamTermsTemplate,
  normalizeKolamTermsTemplateList,
  validateKolamTermsTemplateForm,
} from '../src/domain/kolam-terms-template';

describe('kolam terms-template domain', () => {
  it('detects list/detail/new/edit routes', () => {
    expect(isKolamTermsTemplateRoute('/terms-templates')).toBe(true);
    expect(isKolamTermsTemplateListRoute('/terms-templates')).toBe(true);
    expect(isKolamTermsTemplateNewRoute('/terms-templates/new')).toBe(true);
    expect(isKolamTermsTemplateDetailRoute('/terms-templates/abc')).toBe(true);
    expect(isKolamTermsTemplateEditRoute('/terms-templates/abc/edit')).toBe(
      true,
    );
    expect(isKolamTermsTemplateDetailRoute('/terms-templates/new')).toBe(false);
    expect(getKolamTermsTemplateRouteId('/terms-templates/abc')).toBe('abc');
    expect(getKolamTermsTemplateRouteId('/terms-templates/abc/edit')).toBe(
      'abc',
    );
    expect(getKolamTermsTemplateSurfaceMode('/terms-templates')).toBe('list');
    expect(getKolamTermsTemplateSurfaceMode('/terms-templates/new')).toBe(
      'new',
    );
    expect(buildKolamTermsTemplateDetailRoute('x1')).toBe(
      '/terms-templates/x1',
    );
  });

  it('normalizes list envelope and status helpers', () => {
    const list = normalizeKolamTermsTemplateList({
      success: true,
      data: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            title: 'Garansi Standar',
            slug: 'garansi-standar',
            category: 'default',
            status: 'published',
            version: 2,
            complaintWindowDays: 7,
          },
          {
            _id: '507f1f77bcf86cd799439012',
            title: 'Draf',
            slug: 'draf',
            status: 'draft',
            version: 1,
            complaintWindowDays: null,
          },
        ],
        pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
      },
    });

    expect(list.items).toHaveLength(2);
    expect(list.total).toBe(2);
    expect(list.items[0]).toEqual(
      expect.objectContaining({
        id: '507f1f77bcf86cd799439011',
        title: 'Garansi Standar',
        status: 'published',
        complaintWindowDays: 7,
      }),
    );
    expect(formatKolamTermsTemplateStatusLabel('published')).toBe(
      'Diterbitkan',
    );
    expect(formatKolamTermsTemplateComplaintWindow(null)).toBe('—');
    expect(formatKolamTermsTemplateComplaintWindow(0)).toBe('0');
    expect(canPublishKolamTermsTemplate(list.items[1])).toBe(true);
    expect(canArchiveKolamTermsTemplate(list.items[0])).toBe(true);
  });

  it('normalizes detail payload', () => {
    const detail = normalizeKolamTermsTemplate({
      success: true,
      data: {
        _id: '507f1f77bcf86cd799439013',
        title: 'Detail',
        slug: 'detail',
        status: 'archived',
        version: 3,
      },
    });
    expect(detail.id).toBe('507f1f77bcf86cd799439013');
    expect(detail.status).toBe('archived');
    expect(canPublishKolamTermsTemplate(detail)).toBe(true);
    expect(canArchiveKolamTermsTemplate(detail)).toBe(false);
    expect(isKolamTermsTemplateFormEditable(detail, 'detail')).toBe(false);
    expect(isKolamTermsTemplateFormEditable(null, 'new')).toBe(true);
  });

  it('validates and builds create/update bodies', () => {
    const invalid = validateKolamTermsTemplateForm(
      createEmptyKolamTermsTemplateFormState(),
    );
    expect(invalid.isValid).toBe(false);

    const form = {
      ...createEmptyKolamTermsTemplateFormState(),
      title: 'Garansi Premium',
      slug: 'garansi-premium',
      category: 'warranty',
      complaintWindowDays: '14',
      status: 'published' as const,
      content: '<p>Isi</p>',
      changeNote: 'revisi',
    };
    expect(validateKolamTermsTemplateForm(form).isValid).toBe(true);
    expect(buildKolamTermsTemplateCreateBody(form)).toEqual(
      expect.objectContaining({
        title: 'Garansi Premium',
        slug: 'garansi-premium',
        status: 'published',
        complaintWindowDays: 14,
      }),
    );
    expect(buildKolamTermsTemplateUpdateBody(form)).toEqual(
      expect.objectContaining({
        title: 'Garansi Premium',
        changeNote: 'revisi',
      }),
    );
    expect(buildKolamTermsTemplateUpdateBody(form).status).toBeUndefined();
  });
});
