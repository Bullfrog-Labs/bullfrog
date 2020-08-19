import "react-native-gesture-handler";
import * as React from "react";
import Firebase from "../services/Firebase";
import firebase from "firebase";
import { FirestoreDatabase, NoteRecord } from "kmgmt-common";
import { StyleSheet, View, StatusBar, FlatList } from "react-native";
import { Text, TextInput, Surface, Button } from "react-native-paper";
import * as log from "loglevel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  notes: {
    flex: 1,
  },
  surface: {
    padding: 4,
    margin: 4,
    elevation: 1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  input: {
    fontSize: 18,
    margin: 4,
  },
  button: {
    fontSize: 18,
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

  function handleButtonPress(event) {
    logger.debug(`button press ${event.target}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.notes}>
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <Surface style={styles.surface}>
              <Text style={styles.item}>{item.body}</Text>
            </Surface>
          )}
        />
      </View>
      <View>
        <TextInput style={styles.input} />
        <Button onPress={handleButtonPress}>Publish</Button>
      </View>
      <StatusBar />
    </View>
  );
}
