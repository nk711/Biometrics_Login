import { useCallback, useEffect, useState } from 'react';
import {
    isEnrolledAsync,
    hasHardwareAsync,
    authenticateAsync,
} from 'expo-local-authentication';

type Biometrics = {
    authType: string, 
}

type LocalAuthenticationOptions = {
    promptMessage? : string;
    canelLabel?: string;
    disableDeviceFallback?: boolean;
    fallbackLabel?: string;
}

