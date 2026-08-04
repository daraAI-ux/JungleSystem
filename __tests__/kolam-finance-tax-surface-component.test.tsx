import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamFinanceTaxSurface} from '../src/components/kolam-finance-tax-surface';
import {useKolamAuthContext} from '../src/context/kolam-app-contexts';
import {getKolamWebSetting} from '../src/services/kolam-api';

jest.mock('../src/context/kolam-app-contexts', () => ({
  useKolamAuthContext: jest.fn(),
}));

jest.mock('../src/services/kolam-api', () => ({
  getKolamWebSetting: jest.fn(),
}));

jest.mock('../src/services/kolam-financial-settings-api', () => ({
  getKolamTaxCompanyProfile: jest.fn(),
}));

const authMock = useKolamAuthContext as jest.MockedFunction<
  typeof useKolamAuthContext
>;
const webSettingMock = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;

describe('KolamFinanceTaxSurface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authMock.mockReturnValue({
      authUser: {roleKey: 'admin'},
    } as ReturnType<typeof useKolamAuthContext>);
    webSettingMock.mockResolvedValue({
      daraTaxEnabled: true,
    } as Awaited<ReturnType<typeof getKolamWebSetting>>);
  });

  it('renders Inteligensi Pajak shell with tabs, period, and reload', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Ringkasan');
    expect(text).toContain('Operasional');
    expect(text).toContain('Regulasi');
    expect(text).toContain('Laporan');
    expect(text).toContain('Setoran');
    expect(text).toContain('Muat ulang');
    expect(text).toContain('Bulan ini');
    expect(webSettingMock).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('denies access without tax permission', async () => {
    authMock.mockReturnValue({
      authUser: {roleKey: 'cashier', permissions: []},
    } as ReturnType<typeof useKolamAuthContext>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('Akses ditolak');
    expect(text).toContain('tax');
    expect(text).not.toContain('Operasional');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });

  it('shows disabled banner when daraTaxEnabled is false', async () => {
    webSettingMock.mockResolvedValue({
      daraTaxEnabled: false,
    } as Awaited<ReturnType<typeof getKolamWebSetting>>);

    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <KolamFinanceTaxSurface route="/finance/tax" />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain('DARA Tax nonaktif');
    expect(text).toContain('Settings → AI-Tools');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
