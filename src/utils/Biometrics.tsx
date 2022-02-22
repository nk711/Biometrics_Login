import { authenticateAsync, hasHardwareAsync, isEnrolledAsync } from "expo-local-authentication";
import { Alert } from "react-native";
import { RSA } from "react-native-rsa-native";
import { send_to_server } from "./Server";
import * as Keychain from 'react-native-keychain';

export const biometrics = async() => {
    // Checks if the device is compatible
    const isCompat = await hasHardwareAsync();
    console.log(isCompat);
    if (!isCompat) throw new Error('Your device is not compatible.');

    // Checking if biometric methods exists
    const isEnrolled = await isEnrolledAsync();
    if (!isEnrolled) throw new Error("No Face or Fingers found")

    const result = await authenticateAsync();
    if (result) {
        
        //Get Private Key from keychain (which should be a safely secured)
        const credentials = await Keychain.getGenericPassword()
        if (credentials) {                    

            console.log('Loaded user', credentials.username)
            // Sign a messag and send it to the server... 
            const message =  await RSA.sign('ThisIsARandomMessage', credentials.password as string)
            const result = await send_to_server(message, 'ThisIsARandomMessage')
            console.log("FINAL OUTPUT", result)
        } else {
            Alert.alert('Failed Biometrics', 'NO CREDENTIALS')
        }
    } else {
        Alert.alert('NOT AUTHORISED', 'ID does not match existing records')
    }
}