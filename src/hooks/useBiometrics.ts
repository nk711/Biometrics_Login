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
              const credentials = await Keychain.getGenericPassword()
              if (credentials) {                    
                  console.log('Loaded user', credentials.username)
                  const accessToken = credentials.password as string
                  const result = await send_to_server(accessToken)
                  // successfull
                  return result
              } else {
                  // No credentials
                  Alert.alert('NOT AUTHORISED', 'NO CREDENTIALS')
              }
            } 
            else if (result.error==='unknown') {
              console.log('unknown error')
            }
            else if (
              result.error === 'user_cancel' ||
              result.error === 'system_cancel' ||
              result.error === 'app_cancel'
            ) {
               console.log('appcode')  
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
          authenticate,
        ] as const;
    };
      
export default useBiometrics;
