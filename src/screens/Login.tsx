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

export const Login = () => {
    const navigation = useNavigation();
    const [keyExists, setKeyExists] = useState(false);
    const [faceRec, setFaceRec] = useState(false);
    const [irisRec, setIrisRec] = useState(false);
    const [fingerPrintRec, setFingerPrintRec] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    let resultMessage = <Text></Text>;

    const checkSupportedAuthentication = async() => {
        const types = await supportedAuthenticationTypesAsync();
        if (types && types.length) {
            setFaceRec(types.includes(AuthenticationType.FACIAL_RECOGNITION));
            setFingerPrintRec(types.includes(AuthenticationType.FINGERPRINT));
            setIrisRec(types.includes(AuthenticationType.IRIS))

            //Checks if user has enrolled Fingerprint/ FaceID on device
            const enrolled = await isEnrolledAsync();
            setIsEnrolled(enrolled)
        }

        if (isEnrolled && (faceRec||fingerPrintRec||irisRec)) {
            handleBiometrics();
        }
    }

    const checkIfKeyExists = async() => {
        let result = false;
        let credentials = await Keychain.getGenericPassword();
        if (credentials)  result = true;
        setKeyExists(result);
    }

    useFocusEffect( () => {
        checkIfKeyExists().catch(console.error);
        console.log("Key in keychain Exists", keyExists)
        if (keyExists) checkSupportedAuthentication();
    });

    //TO-DO: Add Mock login functionality
    const handleLogin = () => {
        console.log('Success');
        navigation.navigate('Home');
    }

    const handleBiometrics= async() => {
        try {            
            const result = await authenticateAsync({
                promptMessage: 'Authenticate with Biometrics',
                disableDeviceFallback: true,
                cancelLabel: 'Use App Code',
                fallbackLabel: 'Use App Code',
            });
            console.log("Result", result)
            if (result.success) {
                const credentials = await Keychain.getGenericPassword()
                if (credentials) {                    
                    console.log('Loaded user', credentials.username)
                    const message =  await RSA.sign('ThisIsARandomMessage', credentials.password as string)
                    const result = await send_to_server(message, 'ThisIsARandomMessage')
                    console.log("FINAL OUTPUT", result)
                    // successfull
                    navigation.navigate('Home')
                } else {
                    // No credentials
                    Alert.alert('NOT AUTHORISED', 'NO CREDENTIALS')
                }
            } else if (result.error==='unknown') {
                resultMessage = <Text>Authentication disabled, Please Sign in using pincode</Text>;
            } else if (
                result.error === 'user_cancel' ||
                result.error === 'system_cancel' ||
                result.error === 'app_cancel'
            ) {
                //Alert.alert('Authentication', 'Authentication has been cancelled')
                resultMessage = <Text>Please sign in using pincode </Text>;

            }
        } catch (error) {
            Alert.alert('Authentication', 'An error has occured, please use pincode to sign in')
            console.log('An error has occured', (error as Error).message)
            resultMessage = <Text>Please Sign in using pincode</Text>;
        }
    }

    return (
        <KeyboardAvoidingView
            behavior = {Platform.OS ==='ios' ? 'padding' : 'height'}
            style={login.page}
        >
            <ScrollView>
                <View style={login.container}>
                <Text style = {login.header}>Lets Sign you In.</Text>
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
                        <TouchableOpacity style = {button.redButton}
                            onPress = {handleSubmit}> 
                            <Text style= {button.whiteLabel}>Login</Text> 
                        </TouchableOpacity>
                        <Text style= {login.signUpLbl}
                            onPress = {() => navigation.navigate('SignUp')}
                        >
                            Don't have an account ? Sign Up</Text>
                        <Text style= {login.signUpLbl}
                        onPress = {() => {Keychain.resetGenericPassword(); console.log('cleared');}}
                        >
                            Clear Key-Chain Values</Text> 
                    </>
                    )}
               </Formik>
               { resultMessage }
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
    biometricBtn: {
        fontSize: 20,
        color: 'black',
        fontWeight: '400',
        textAlign: "right",
        marginTop: 20,
        textDecorationLine: 'underline',
    },
    prompt: {
        marginTop:100,
        fontSize: 40,
        color: 'black',
        fontWeight: '300',
        width:'80%',
        textAlign: 'center'
    },
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