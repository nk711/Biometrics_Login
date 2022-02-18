import React from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Keychain from 'react-native-keychain';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RSA } from 'react-native-rsa-native'

const storeData = async(value: Object) => {
    try {
        await AsyncStorage.removeItem('@mock_server_data')
        const result = JSON.stringify(value);

        console.log("RESULT", result)
        await AsyncStorage.setItem('@mock_server_data', result)
    } catch (e) {
        console.log('errors', (e as Error).message)
    }
}

export const SignUp = () => {
    const navigation = useNavigation();
    const [valid, setValid] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const onSignUpPress = async() => {        
        const keys = await RSA.generateKeys(4096);

        await Keychain.resetGenericPassword();

        const user = {
            first_name: "nithesh",
            last_name: "koneswaran",
            email: "nithesh@hotmail.co.uk",
            public_key: keys.public as string
        }
        storeData(user);
        await Keychain.setGenericPassword('nithesh@hotmail.co.uk', keys.private)
        
        console.log("====SIGNED UP SUCCESSFULLY=====")
    }

    return (
        <KeyboardAvoidingView
            behavior = {Platform.OS ==='ios' ? 'padding' : 'height'}
            style={signup.page}
        >
            <ScrollView>
                <View style={signup.container}>
                <Text style = {signup.header}>Lets Get You Started.</Text>
                    <View style = {input.textInput}>
                        <Text style={input.label}>Your Email Address</Text>
                        <TextInput style = {input.textbox}
                            placeholder = "Enter your Email"
                            value = {  email }
                            onChangeText = { text => setEmail(text)}/>
                    </View>
                    <View style = {input.textInput}>
                        <Text style={input.label}> New Password</Text>
                        <TextInput style = {input.textbox}
                            placeholder = "Enter your Password"
                            value = {  password }
                            onChangeText = { text => setPassword(text)}/>
                        <Text style= {signup.signUpLbl}>Forgotten Password?</Text> 
                    </View>
                    <TouchableOpacity style = {button.redButton}
                        onPress = {() => onSignUpPress()}> 
                        <Text style= {button.whiteLabel}>Register with biometrics</Text> 
                    </TouchableOpacity>
                    <Text style= {signup.signUpLbl}
                        onPress = {() => navigation.navigate('Login')}
                    >
                        Already have an account?</Text> 
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
        fontSize: 25,
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

const signup = StyleSheet.create({
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
        marginBottom: 10,
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