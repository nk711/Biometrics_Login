import React from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from "@react-navigation/native";
import * as Keychain from 'react-native-keychain';
import { send_to_server } from "../utils/Server";
import { RSA } from "react-native-rsa-native";
export const Login = () => {
    const navigation = useNavigation();
    const [valid, setValid] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const onLoginPress = async() => {
        try {

            // Checks if the device is compatible
            const isCompat = await LocalAuthentication.hasHardwareAsync();
            console.log(isCompat);
            if (!isCompat) throw new Error('Your device is not compatible.');
            
            // Checking if biometric methods exists
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) throw new Error("No Face or Fingers found")

            const result = await LocalAuthentication.authenticateAsync();

            if (result) {
                //Mocking Server
                const credentials = await Keychain.getGenericPassword()
                if (credentials) {                    
                    console.log('Loaded user', credentials.username)
                    const message =  await RSA.sign('ThisIsARandomMessage', credentials.password as string)
                    const result = await send_to_server(message, 'ThisIsARandomMessage')
                    console.log("FINAL OUTPUT", result)
                } else {
                    Alert.alert('NOT Authenticated', 'NO CREDENTIALS')

                }
            } else {
                Alert.alert('NOT AUTHORISED', 'ID does not match existing records')
            }
        } catch (error) {
            Alert.alert('An error has occured', (error as Error).message)
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
                    <View style = {input.textInput}>
                        <Text style={input.label}>Email</Text>
                        <TextInput style = {input.textbox}
                            placeholder = "Enter your Email"
                            value = {  email }
                            onChangeText = { text => setEmail(text)}/>
                    </View>
                    <View style = {input.textInput}>
                        <Text style={input.label}> Password</Text>
                        <TextInput style = {input.textbox}
                            placeholder = "Enter your Password"
                            value = {  password }
                            onChangeText = { text => setPassword(text)}/>
                        <Text style= {login.signUpLbl}>Forgotten Password?</Text> 
                    </View>
                    <TouchableOpacity style = {button.redButton}
                        onPress = {() => onLoginPress()}> 
                        <Text style= {button.whiteLabel}>Login using Biometrics</Text> 
                    </TouchableOpacity>
                    <Text style= {login.signUpLbl}
                        onPress = {() => navigation.navigate('SignUp')}
                    >
                        Don't have an account ? Sign Up</Text> 
                    </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const button = StyleSheet.create({
    redButton: {
        backgroundColor: '#D7143F',
        height: 70,
        width: 400,
        borderRadius: 10,
        justifyContent: 'center',
        marginTop: 100,
    },
    whiteLabel: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
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