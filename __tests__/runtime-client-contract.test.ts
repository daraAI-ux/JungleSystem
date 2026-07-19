import {appConfig} from '../src/config/app';
import {
  getRuntimeClientHeaderContracts,
  getRuntimeClientHeaders,
} from '../src/domain/runtime-client-contract';

describe('runtime client contract', () => {
  it('documents the native Windows headers required by the server gate', () => {
    expect(getRuntimeClientHeaderContracts()).toEqual([
      {
        id: 'Origin',
        label: 'Native Origin',
        value: appConfig.nativeOrigin,
        requiredForServerGate: true,
      },
      {
        id: 'User-Agent',
        label: 'Native User Agent',
        value: appConfig.nativeUserAgent,
        requiredForServerGate: true,
      },
      {
        id: 'x-da-client',
        label: 'Client Id',
        value: appConfig.nativeClientId,
        requiredForServerGate: true,
      },
      {
        id: 'x-da-client-version',
        label: 'Client Version',
        value: appConfig.nativeClientVersion,
        requiredForServerGate: true,
      },
      {
        id: 'x-source',
        label: 'Source',
        value: appConfig.sourceHeader,
        requiredForServerGate: true,
      },
    ]);
  });

  it('builds request headers without changing module source contracts', () => {
    expect(
      getRuntimeClientHeaders({sourceHeader: appConfig.kolamSourceHeader}),
    ).toEqual({
      Origin: appConfig.nativeOrigin,
      'User-Agent': appConfig.nativeUserAgent,
      'x-da-client': appConfig.nativeClientId,
      'x-da-client-version': appConfig.nativeClientVersion,
      'x-source': appConfig.kolamSourceHeader,
    });
  });
});
