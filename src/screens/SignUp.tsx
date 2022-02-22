import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Keychain from 'react-native-keychain';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RSA } from 'react-native-rsa-native'
import { storeData } from "../utils/Server";
import { Field, Formik  } from "formik";

import * as yup from 'yup';
import { REGEX } from "../utils/regex";
import { CustomInput } from "../components/CustomInput";
import { colors } from "../utils/style";


const signUpValidationSchema = yup.object().shape({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email address is Required"),
    pin: yup
        .string()
        //.matches(REGEX.pin, "Pin must be 6 digits long")
        .min(6, ({min}) => `Pin must be at least ${min} digits long`)
        .required('Pin is required'),
    confirmPin: yup
        .string()
        .oneOf([yup.ref('pin')], 'Pin do not match')
        .required('Please confirm your Pin is required'),
});

interface valueType {
    email: string
    pin: string
    confirmPin: string
}
export const SignUp = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    
    const handleSignUp = async(values: valueType) => {  

        setLoading(true);
        try {
            // Generate Private and Public Key
            const keys = await RSA.generateKeys(4096);  
            // Encrypt password
            const encryptedPin = await RSA.encrypt(values.pin, keys.public)
            // Send Payload to AWS Cognito
            const user = {
                first_name: "first_name_placeholder",
                last_name: "last_name_placeholder",
                email: values.email,
                pin: encryptedPin,
                public_key: keys.public as string
            }
            storeData(user); // Replace with Cognito stuff API <---
            // Store private key securely onto the device
            await Keychain.setGenericPassword('nithesh@hotmail.co.uk', keys.private)
            console.log("User has signed up successfully", values)
            setLoading(false)
            navigation.navigate('Login');
        } catch (errors) {
            Alert.alert("Something went wrong", "Failed the register user")
            console.log((errors as Error).message)
        }
        
    }


    return (
        <KeyboardAvoidingView
            behavior = {Platform.OS ==='ios' ? 'padding' : 'height'}
            style={signup.page}
        >
            <ScrollView>
                <View style={signup.container}>
                <Text style = {signup.header}>Lets Get You Started.</Text>
                {loading && <ActivityIndicator size="large" />}
                <Formik
                    validationSchema={signUpValidationSchema}
                    initialValues={{email: '', pin: '', confirmPin: ''}}
                    onSubmit={handleSignUp}
                >
                    {({ handleSubmit, isValid, values}) => (
                    <>
                        <View style = {input.textInput}>
                            <Text style={input.label}>Your Email Address</Text>
                            <Field
                                component = {CustomInput}
                                name="email"
                                placeholder = "Enter your Email Address"
                                keyboardType="email-address"/>
                        </View>
                        <View style = {input.textInput}>
                            <Text style={input.label}> Your Pin Code</Text>
                            <Field
                                component = {CustomInput}
                                name = "pin"
                                placeholder = "Enter your Pin"
                                keyboardType="numeric"
                                maxLength={6}
                                secureTextEntry 
                            />
                        </View>

                        <View style = {input.textInput}>
                            <Field 
                                component = {CustomInput}
                                name = "confirmPin"
                                placeholder = "Confirm your Pin"
                                secureTextEntry
                                maxLength={6} 
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity style = {
                            !isValid||values.email===''
                            ? { ...button.redButton, ...button.buttonDisabled }
                            : button.redButton
                        }
                            onPress = {handleSubmit}
                            disabled={!isValid || values.email === ''}> 
                            <Text style= {button.whiteLabel}>Register</Text> 
                        </TouchableOpacity>
                    </>
                    )}
                </Formik>
                <Text style= {signup.signUpLbl}
                    onPress = {() => navigation.navigate('Login')}
                >
                    Already have an account? </Text> 
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
        marginTop: 40,
    },
    whiteLabel: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    buttonDisabled: {
        backgroundColor: colors.lighter_red,
        color: colors.disabled_text
    }
})

const input = StyleSheet.create({
    textInput: {
        paddingTop: 40,
    },
    label: {
        fontSize: 20,
        color: 'black',
        fontWeight: '300',
        width: 175,
        textAlign: "left",
        paddingBottom:10,
    },
    textbox: {
        backgroundColor: colors.text_input,
        height: 70,
        width: 400,
        borderRadius: 10,
        fontSize: 20,
        paddingHorizontal: 20,
    }
})

const signup = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        fontSize: 60,
        color: colors.black,
        fontWeight: 'bold',
        width: 400,
        paddingEnd: 160,
        textAlign: "left",
        marginTop: 50,
        marginBottom: 10,
    },
    signUpLbl: {
        fontSize: 20,
        color: colors.black,
        fontWeight: '400',
        textAlign: "left",
        marginTop: 20,
        marginBottom: 30,
        textDecorationLine: 'underline',
        
    }
})