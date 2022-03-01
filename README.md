# Biometrics_Login
React-Native biometric authentication attempt, linking the following three packages; expo-local-authentication, react-native-keychain and react-native-RSA-native. 
This is a mock-up/example on how an application can use the user's biometric to login without compromising any sensitive data. This is a work in progress.

Solution 1: 
- User signs up using Email + Pin
- A RSA algorithm is used to generate a public & private key.
- The private key is stored securely on the device, and the public key is sent over to the server. (This can be switched around)
- User uses biometrics to get access to the private key stored on the device
- A cryptographic signature is generated and sent to the server for verification
- If the server verifies the signature
- An Access Token is sent back

* Not sure if storing private key using the setPassword method is safe
* Might not fit all usecases
* Consider the Authentication API your using, e.g Firebase or Cognito

The private key is stored within the Keychain without any encryption. Unable to encrypt and store the private key due to private key length.

Solution 2
- get an auth token after signing up
- Store the auth token directly to keychain
- Expo Local Authentication won't be needed here since biometrics can be prompted through Keychain
- Once the session expires, retrieve the token through biometrics and refresh token.
