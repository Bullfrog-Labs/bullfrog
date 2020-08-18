import "react-native-gesture-handler";
import * as React from "react";
import Firebase from "../services/Firebase";
import firebase from "firebase";
import { FirestoreDatabase, NoteRecord } from "kmgmt-common";
import { StyleSheet, View, StatusBar, FlatList, Text } from "react-native";
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

const app = Firebase.init();
const database = FirestoreDatabase.fromApp(app);

export default function AddNoteScreen() {
  const logger = log.getLogger("AddNoteScreen");
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  React.useEffect(() => {
    async function getNotes() {
      const email = firebase.auth().currentUser?.email;
      logger.debug(`using email for fetch; email = ${email}`);
      if (email) {
        const fetchedNotes = await database.getNotes(email);
        logger.debug(`notes = ${fetchedNotes}`);
        setNotes(fetchedNotes);
      }
    }
    getNotes();
  }, [logger]);

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
