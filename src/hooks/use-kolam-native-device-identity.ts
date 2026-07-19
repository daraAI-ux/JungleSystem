import {useEffect, useState} from 'react';
import type {RuntimeDeviceIdentityStatus} from '../domain/runtime-identity';
import {bootstrapNativeDeviceIdentity} from '../services/native-device-identity';

export function useKolamNativeDeviceIdentity(): RuntimeDeviceIdentityStatus {
  const [status, setStatus] =
    useState<RuntimeDeviceIdentityStatus>('missing');

  useEffect(() => {
    let active = true;

    bootstrapNativeDeviceIdentity().then(nextStatus => {
      if (active) {
        setStatus(nextStatus);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return status;
}
