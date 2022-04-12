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
import useBiometrics from "../hooks/useBiometrics";


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

export const Login: React.FC = () => {
    const navigation = useNavigation();
    const [keyExists, setKeyExists] = useState(false);

    const [
        isBiometricSupported,
        isUserEnrolled,
        isAuthenticated,
        resultMessage,
        authenticate,
    ] = useBiometrics();
      

    let resultText = <Text></Text>;


    const checkIfKeyExists = async() => {
        let result = false;
        let credentials = await Keychain.getGenericPassword();
        if (credentials)  result = true;
        setKeyExists(result);
    }

    useFocusEffect(() => {
        if (keyExists && isBiometricSupported && isUserEnrolled) {
            checkIfKeyExists().catch(console.error);
            if (keyExists && isBiometricSupported && isUserEnrolled) {
                authenticate();
            } else {
                resultText = <Text> Sign Up </Text>;
            }
        }
    });

    useEffect(() => {
        const login = async () => {
            const credentials = await Keychain.getGenericPassword()
            if (credentials) {                    
                console.log('Loaded user', credentials.username)
                const accessToken = credentials.password as string
                const result = await send_to_server(accessToken)
                if (result) navigation.navigate('Home');
            } else {
                Alert.alert('NOT AUTHORISED', 'NO CREDENTIALS')
            }
        }
        if (isAuthenticated) login();        
    }, [isAuthenticated]);

    useEffect(() => {
        resultText = <Text> { resultMessage } </Text>
    }, [resultMessage])

    const handleLogin = () => {
        console.log('Success');
        navigation.navigate('Home');
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
                        > Clear Key-Chain Values</Text> 
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
        textAlign: "left",
        paddingBottom:10,
    },
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