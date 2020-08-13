import "react-native-gesture-handler";
import * as React from "react";
import "../services/Firebase";
import firebase from "firebase";
import { StyleSheet, View, StatusBar, FlatList, Text } from "react-native";
import { NotesScreenNavigationProp } from "../services/Navigation";

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

const firestore = firebase.firestore();

export default function NotesScreen(props: {
  navigation: NotesScreenNavigationProp;
}) {
  const [notes, setNotes] = React.useState<{ title: string; body: string }[]>(
    []
  );
  React.useEffect(() => {
    async function getNotes() {
      const email = firebase.auth().currentUser?.email;
      console.log(`using email for fetch; email = ${email}`);
      if (email) {
        const coll = await firestore
          .collection("users")
          .doc(email)
          .collection("notes")
          .get();
        const fetchedNotes = coll.docs.map((doc) => {
          return {
            title: doc.data().title,
            body: doc.data().body,
          };
        });
        console.log(`notes = ${fetchedNotes}`);
        setNotes(fetchedNotes);
      }
    }
    getNotes();
  }, [firestore, firebase]);

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={({ item }) => <Text style={styles.item}>{item.body}</Text>}
      />
      <StatusBar />
    </View>
  );
}
