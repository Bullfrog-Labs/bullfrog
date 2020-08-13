import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmavUfUY76dSgDoLeHwHyShnNXzfUOC70",
  authDomain: "kmgmt-app.firebaseapp.com",
  databaseURL: "https://kmgmt-app.firebaseio.com",
  projectId: "kmgmt-app",
  storageBucket: "kmgmt-app.appspot.com",
  messagingSenderId: "259671952872",
  appId: "1:259671952872:web:dfeded8b2b271dfcc1a85d",
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged((user) => {
  if (user != null) {
    console.log(`authorized with ${user.email}`);
  }
});
