import * as React from "react";
import "../services/Firebase";
import firebase from "firebase";
import { Button, StyleSheet, View, StatusBar } from "react-native";
import * as Google from "expo-google-app-auth";

import { LoginScreenNavigationProp } from "../services/Navigation";

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
  const config = {
    iosClientId:
      "259671952872-lpsqbf7kkufjp2nq6psogcpda5gqk5j4.apps.googleusercontent.com",
    androidClientId:
      "259671952872-8fjmi27dhntrl6ohqqcun26j4ni1ha6f.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  };
  try {
    const result = await Google.logInAsync(config);
    console.log(`result=${JSON.stringify(result.type)}`);
    return result;
  } catch (e) {
    console.log(`error=${JSON.stringify(e)}`);
    return { type: "cancel" };
  }
}

export default function LoginScreen(props: {
  navigation: LoginScreenNavigationProp;
}) {
  const [result, setResult] = React.useState<Google.LogInResult>();

  React.useEffect(() => {
    if (result?.type === "success") {
      const idToken = result.idToken;
      console.log(`got ${idToken}`);
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
      firebase.auth().signInWithCredential(credential);
    }
  }, [result]);

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
