import React, { useEffect, useState } from "react";
import AppContainer from "./components/AppContainer";
import SignIn from "./components/SignIn";
import Firebase from "./services/Firebase";
import "./App.css";

const firebase = Firebase.init();

function App() {
  const [userAuth, setUserAuth] = useState(firebase.auth().currentUser);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((firebaseUserAuth) => {
      setUserAuth(firebaseUserAuth);
    });
  });

  if (userAuth) {
    console.log(`Logged in as ${userAuth.displayName}`);
  } else {
    console.log(`Not logged in`);
  }

  if (userAuth) {
    return <AppContainer />;
  } else {
    return <SignIn />;
  }
}

export default App;
