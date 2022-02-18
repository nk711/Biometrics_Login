import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import React from "react";
import { View } from "react-native";
import { Home } from "../screens/Home";
import { Login } from "../screens/Login";
import { SignUp } from "../screens/SignUp";

const Stack = createNativeStackNavigator();

export const RootStack = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Home" component={ Home } /> 
                <Stack.Screen name="Login" component={ Login } options = {{ headerShown: false }}/>
                <Stack.Screen name="SignUp" component={ SignUp } options = {{ headerShown: false }}/> 
            </Stack.Navigator>
        </NavigationContainer>
    )
}