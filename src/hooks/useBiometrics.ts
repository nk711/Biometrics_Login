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

const useBiometrics = () => {
    const [isBiometricSupported, setIsBiometricSupported] = useState<Boolean>(false);
    const [isUserEnrolled, setIsUserEnrolled] = useState<boolean>(false);
    const [isBiometricAuthenticated, setIsBiometricAuthenticated]= useState<>(
        {},
    );
    const [loading, setLoading] = useState<boolean>();
    
    //Check for Biometrics Support Permissions

    const requestBiometricsPermissions = async():
    Promise<any> => {
        const isCompatible = await hasHardwareAsync();
        setIsBiometricSupported(isCompatible);
        const enrolled = await isEnrolledAsync();
        setIsUserEnrolled(enrolled);
    }

    const handleBiometricAuth = useCallback(async() => {
        if (!isBiometricSupported){
            console.log('Biometrics is not supported on this device')
        };
        if (!setIsUserEnrolled) {
            console.log('User has no biometrics enrolled')
        };
    }, [isBiometricSupported, isUserEnrolled])


    const authenticate = async () => {
        if (loading) return;
        setLoading(true)

        try {
            const results = await authenticateAsync({
                promptMessage: 'Login with Passcode',
                disableDeviceFallback: false,
            });
            if (results.success) {
              setIsBiometricAuthenticated(results);
            }
          } catch (e) {
            console.log(e);
          }
      
          setLoading(false);
        };
      
        useEffect(() => {
          requestBiometricsPermissions();
        }, []);
      
        useEffect(() => {
          handleBiometricAuth();
        }, []);
      
        return [
          isBiometricSupported,
          isUserEnrolled,
          isBiometricAuthenticated,
          authenticate,
        ] as const;
    };
      
export default useBiometrics;
