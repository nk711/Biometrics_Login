import { useCallback, useEffect, useState } from 'react';
import {
    isEnrolledAsync,
    hasHardwareAsync,
    authenticateAsync,
} from 'expo-local-authentication';
import * as Keychain from 'react-native-keychain';
import { send_to_server } from "../utils/Server";
import { Alert } from 'react-native';

const useBiometrics = () => {
    const [isBiometricSupported, setIsBiometricSupported] = useState<Boolean>(false);
    const [isUserEnrolled, setIsUserEnrolled] = useState<boolean>(false);
    const [resultMessage, setResultMessage] = useState<Text>();
    const [isAuthenticated, setIsAuthenticated]= useState<any>(
        {},
    );
    const [loading, setLoading] = useState<boolean>();
    
    //Check for Biometrics Support Permissions

    const requestBiometricsPermissions = async():
    Promise<any> => {
        const isCompatible = await hasHardwareAsync();
        const isEnrolled = await isEnrolledAsync();
        setIsBiometricSupported(isCompatible);
        setIsUserEnrolled(isEnrolled);
    }

    const handleBiometricAuth = useCallback(async() => {
        if (!isBiometricSupported) console.log('Biometrics is not supported on this device')
        if (!setIsUserEnrolled) console.log('User has no biometrics enrolled')
    }, [isBiometricSupported, isUserEnrolled])


    const authenticate = async () => {
        if (loading) return;
        setLoading(true)

        try {
            const result = await authenticateAsync({
                promptMessage: 'Login with Passcode',
                disableDeviceFallback: false,
            });
           
            if (result.success) {
              setIsAuthenticated(result)
              setResultMessage("Success")
            } 
            else if (result.error==='unknown') {
              setResultMessage("Authentication disabled - Please try again later")
            }
            else if (
              result.error === 'user_cancel' ||
              result.error === 'system_cancel' ||
              result.error === 'app_cancel'
            ) {
              setResultMessage("Authentication disabled, Please Sign in using AppCode")
            }
  
        } catch (e) {
            console.log('An error has occured', (e as Error).message)
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
          isAuthenticated,
          resultMessage,
          authenticate,
        ] as const;
    };
      
export default useBiometrics;
