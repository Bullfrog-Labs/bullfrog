import * as React from "react";
import firebase from "firebase";
import { Button, StyleSheet, View, StatusBar } from "react-native";
import * as Google from "expo-google-app-auth";
import { LoginScreenNavigationProp } from "../services/Navigation";
import * as log from "loglevel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

async function login(): Promise<Google.LogInResult> {
  const logger = log.getLogger("LoginScreen");
  const config = {
    iosClientId:
      "259671952872-lpsqbf7kkufjp2nq6psogcpda5gqk5j4.apps.googleusercontent.com",
    androidClientId:
      "259671952872-8fjmi27dhntrl6ohqqcun26j4ni1ha6f.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  };
  try {
    const result = await Google.logInAsync(config);
    logger.debug(`result=${JSON.stringify(result.type)}`);
    logger.debug(`result=${JSON.stringify(result)}`);
    return result;
  } catch (e) {
    logger.debug(`error=${JSON.stringify(e)}`);
    return { type: "cancel" };
  }
}
/*
async function cacheAuthAsync(authState) {
  return await AsyncStorage.setItem(StorageKey, JSON.stringify(authState));
}

export async function getCachedAuthAsync() {
  let value = await AsyncStorage.getItem(StorageKey);
  let authState = JSON.parse(value);
  console.log("getCachedAuthAsync", authState);
  if (authState) {
    if (checkIfTokenExpired(authState)) {
      return refreshAuthAsync(authState);
    } else {
      return authState;
    }
  }
  return null;
}

function checkIfTokenExpired({ accessTokenExpirationDate }) {
  return new Date(accessTokenExpirationDate) < new Date();
}

async function refreshAuthAsync({ refreshToken }) {
  let authState = await AppAuth.refreshAsync(config, refreshToken);
  console.log("refreshAuth", authState);
  await cacheAuthAsync(authState);
  return authState;
}
*/
export default function LoginScreen(props: {
  navigation: LoginScreenNavigationProp;
}) {
  const logger = log.getLogger("LoginScreen");
  const [result, setResult] = React.useState<Google.LogInResult>();

  React.useEffect(() => {
    if (result?.type === "success") {
      const idToken = result.idToken;
      logger.debug(`got ${idToken}`);
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      firebase.auth().signInWithCredential(credential);
    }
  }, [result, logger]);

  return (
    <View style={styles.container}>
      <Button
        title="Login"
        onPress={async () => {
          const loginResult = await login();
          setResult(loginResult);
          props.navigation.navigate("Notes");
        }}
      />
      <StatusBar />
    </View>
  );
}
