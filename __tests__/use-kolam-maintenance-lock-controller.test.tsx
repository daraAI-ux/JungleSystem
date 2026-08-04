import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {useKolamMaintenanceLockController} from '../src/hooks/use-kolam-maintenance-lock-controller';
import {ApiError} from '../src/lib/api-error';
import {getKolamWebSetting} from '../src/services/kolam-api';

jest.mock('../src/services/kolam-api', () => ({
  getKolamWebSetting: jest.fn(),
}));

const mockedGetKolamWebSetting = getKolamWebSetting as jest.MockedFunction<
  typeof getKolamWebSetting
>;

function MaintenanceProbe({enabled = true}: {enabled?: boolean}) {
  const {locked} = useKolamMaintenanceLockController(enabled);

  return <Text>{locked ? 'locked' : 'open'}</Text>;
}

function getProbeText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findByType(Text).props.children;
}

afterEach(() => {
  mockedGetKolamWebSetting.mockReset();
});

test('locks when POS maintenance flag is active', async () => {
  mockedGetKolamWebSetting.mockResolvedValue({
    maintenance: {pos: true},
  });

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<MaintenanceProbe />);
  });

  expect(getProbeText(renderer!)).toBe('locked');
  ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});

test('locks when nginx returns maintenance gateway status', async () => {
  mockedGetKolamWebSetting.mockRejectedValue(new ApiError(503));

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<MaintenanceProbe />);
  });

  expect(getProbeText(renderer!)).toBe('locked');
  ReactTestRenderer.act(() => {
    renderer!.unmount();
  });
});
