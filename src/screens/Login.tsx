import React, { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { hasHardwareAsync, isEnrolledAsync, authenticateAsync, supportedAuthenticationTypesAsync, AuthenticationType} from 'expo-local-authentication';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Keychain from 'react-native-keychain';
import { send_to_server } from "../utils/Server";
import { RSA } from "react-native-rsa-native";
import * as yup from 'yup';
import { Field, Formik  } from "formik";
import { colors } from "../utils/style";
import { CustomInput } from "../components/CustomInput";


enum Authentication {
    CANCELLED = 'CANCELLED',
    DISABLED = 'DISABLED',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}


const loginValidationSchema = yup.object().shape({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email address is Required"),
    pin: yup
        .string()
        //.matches(REGEX.pin, "Pin must be 6 digits long")
        .min(6, ({min}) => `Pin must be at least ${min} digits long`)
        .required('Pin is required'),
});

interface valueType {
    email: string
    pin: string
}
export const Login = () => {
    const navigation = useNavigation();
    const [keyExists, setKeyExists] = useState(false);
    const [faceRec, setFaceRec] = useState(false);
    const [irisRec, setIrisRec] = useState(false);
    const [fingerPrintRec, setFingerPrintRec] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [result, setResult] = useState<Authentication>();

    let biometricTypes = [] as any

    const checkSupportedAuthentication = async() => {
        const types = await supportedAuthenticationTypesAsync();
        if (types && types.length) {
            setFaceRec(types.includes(AuthenticationType.FACIAL_RECOGNITION));
            setFingerPrintRec(types.includes(AuthenticationType.FINGERPRINT));
            setIrisRec(types.includes(AuthenticationType.IRIS))

            if (faceRec) biometricTypes.push('Face ID')
            if (fingerPrintRec) biometricTypes.push('Touch ID')
            if (irisRec) biometricTypes.push('Iris ID')

            //Checks if user has enrolled Fingerprint/ FaceID on device
            const enrolled = await isEnrolledAsync();
            setIsEnrolled(enrolled)
        }

        if (isEnrolled && (faceRec||fingerPrintRec||irisRec)) {
            handleBiometrics();
        }
    }

    useFocusEffect(() => {
        const checkIfKeyExists = async() => {
            let result = false;
            let credentials = await Keychain.getGenericPassword();
            if (credentials)  result = true;
            setKeyExists(result);
        }
        checkIfKeyExists().catch(console.error);

        if (keyExists) checkSupportedAuthentication();

        console.log("Is User Enrolled", isEnrolled);
        console.log("check if key exists", keyExists);

    });


    const handleLogin = () => {
        console.log('logging you in');
    }

    const handleBiometrics= async() => {
        try {            
            const result = await authenticateAsync();
            if (result.success) {
                setResult(Authentication.SUCCESS)
                const credentials = await Keychain.getGenericPassword()
                if (credentials) {                    
                    console.log('Loaded user', credentials.username)
                    const message =  await RSA.sign('ThisIsARandomMessage', credentials.password as string)
                    const result = await send_to_server(message, 'ThisIsARandomMessage')

                    console.log("FINAL OUTPUT", result)
                    Alert.alert('USER AUTHENTICATED', 'user successfully authenticated')
                } else {
                    Alert.alert('NOT AUTHORISED', 'NO CREDENTIALS')
                }
            } else if (result.error==='unknown') {
                setResult(Authentication.DISABLED)
            } else if (
                result.error === 'user_cancel' ||
                result.error === 'system_cancel' ||
                result.error === 'app_cancel'
            ) {
                setResult(Authentication.ERROR)
                console.log("SOMETHING HAPPENED HEREE")
            }
        } catch (error) {
            setResult(Authentication.ERROR)
            Alert.alert('An error has occured', (error as Error).message)
        }
    }


    let resultMessage;
    switch (result) {
        case Authentication.SUCCESS:
            resultMessage = 'Successfully Authenticated';
            break;
        case Authentication.ERROR:
            resultMessage = 'There was an error in authentication';
            break;
        case Authentication.DISABLED:
            resultMessage = 'Authentication has been disabled';
            break; 
        case Authentication.CANCELLED:
            resultMessage = 'Cancelled';
            break;            
        default:
            resultMessage = 'text';
            break;
    }

    let prompt = "Authenticate with "
    
    if (faceRec && fingerPrintRec && irisRec) {
        prompt = "Authenticate with Face ID, Touch ID, or Iris ID";
    } else if (faceRec && fingerPrintRec) {
        prompt = "Authenticate with Face ID or Touch ID"
    } else if (fingerPrintRec && irisRec) {
        prompt = "Authenticate with Touch ID or Iris ID"
    } else if (faceRec && irisRec) {
        prompt = "Authenticate with Face ID or Iris ID"
    } else if (faceRec) {
        prompt = "Authenticate with Face ID"
    } else if (fingerPrintRec) {
        prompt = "Authenticate with Touch ID"
    } else if (irisRec) {
        prompt = "Authenticate with Iris ID"
    } else {
        prompt = "No Biometrics Available"
    }

    return (
        <KeyboardAvoidingView
            behavior = {Platform.OS ==='ios' ? 'padding' : 'height'}
            style={login.page}
        >
            <ScrollView>
                <View style={login.container}>
                <Text style = {login.header}>Lets Sign you In.</Text>
                
                { 
                    ((faceRec || irisRec || fingerPrintRec) && (isEnrolled)) ? 
                (
                    <Text style = {input.textInput}> { prompt } </Text>
                ) : (
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{email: '', pin: ''}}
                    onSubmit={handleLogin}
                >
                    {({ handleSubmit, isValid, values}) => (
                    <>
                        <View style = {input.textInput}>
                            <Text style={input.label}>Your Email Address</Text>
                            <Field 
                                component = {CustomInput}
                                placeholder = "Enter your Email Address"
                                name = 'email'
                                keyboardType = 'email-address'/>
                        </View>
                        <View style = {input.textInput}>
                            <Text style={input.label}> Your Pin</Text>
                            <Field
                                component = {CustomInput}
                                name = "pin"
                                placeholder = "Enter your Pin"
                                keyboardType="numeric"
                                maxLength={6}
                                secureTextEntry 
                            />
                            <Text style= {login.signUpLbl} >Forgotten Pin?</Text> 
                        </View>
                        <TouchableOpacity style = {
                            !isValid||values.email===''
                            ? { ...button.redButton, ...button.buttonDisabled }
                            : button.redButton
                        }
                            onPress = {handleSubmit}
                            disabled={!isValid || values.email === ''}> 
                            <Text style= {button.whiteLabel}>Login</Text> 
                        </TouchableOpacity>
                        <Text style= {login.signUpLbl}
                            onPress = {() => navigation.navigate('SignUp')}
                        >
                            Don't have an account ? Sign Up</Text> 
                    </>
                    )}
                </Formik>
                )}
                { resultMessage && <Text> {resultMessage} </Text> }
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const button = StyleSheet.create({
    redButton: {
        backgroundColor: colors.red,
        height: 70,
        width: 400,
        borderRadius: 10,
        justifyContent: 'center',
        marginTop: 50,
    },
    whiteLabel: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    buttonDisabled: {
        backgroundColor: colors.lighter_red,
        color: colors.disabled_text,
    }
})

const input = StyleSheet.create({
    textInput: {
        paddingTop: 40,
    },
    label: {
        fontSize: 20,
        color: colors.black,
        fontWeight: '300',
        width: 175,
        textAlign: "left",
        paddingBottom:10,
    },
    textbox: {
        backgroundColor: '#E2E2E2',
        height: 70,
        width: 400,
        borderRadius: 10,
        fontSize: 20,
        paddingHorizontal: 20,
    }
})

const login = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        fontSize: 60,
        color: 'black',
        fontWeight: 'bold',
        width: 400,
        paddingEnd: 160,
        textAlign: "left",
        marginTop: 50,
        marginBottom: 30,
    },
    signUpLbl: {
        fontSize: 20,
        color: 'black',
        fontWeight: '400',
        textAlign: "left",
        marginTop: 20,
        textDecorationLine: 'underline',
    }
})