import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native";
import { RSA } from "react-native-rsa-native"

interface Response {
    first_name: string;
    last_name: string;
    email: string;
    public_key: string;
}

const getData = async() => {
    try {
        const jsonValue = await AsyncStorage.getItem('@mock_server_data');
        console.log("RETRIEVED", typeof jsonValue);
        return jsonValue!= null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.log((e as Error).message);
    }
}
export const send_to_server = async(encrypted_message: string, message: string) => {
    const mocked_response = await (getData() as any);
    console.log(mocked_response[0])
    if (mocked_response) {
        console.log("mocked_response", mocked_response.public_key)
        return await RSA.verify(encrypted_message, message, mocked_response.public_key as string)
    } else {
        return false;
    }
}