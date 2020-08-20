import "react-native-gesture-handler";
import * as React from "react";
import Firebase from "../services/Firebase";
import firebase from "firebase";
import {
  FirestoreDatabase,
  NoteRecord,
  RichTextBuilder,
  RichTextRenderer,
} from "kmgmt-common";
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
  const [note, setNote] = React.useState<string>("");
  const email = firebase.auth().currentUser?.email;

  React.useEffect(() => {
    async function getNotes() {
      logger.debug(`using email for fetch; email = ${email}`);
      if (email) {
        const fetchedNotes = await database.getNotes(email);
        logger.debug(`notes = ${fetchedNotes}`);
        setNotes(fetchedNotes);
      }
    }
    getNotes();
  }, [logger, email]);

  function handleButtonPress() {
    logger.debug(`button press ${note}`);
    const addedNote = note;
    const builder = new RichTextBuilder();
    const body = builder.addParagraph(addedNote).build();
    logger.debug(`adding note ${JSON.stringify(body)}`);
    const noteRecord: NoteRecord = {
      body: body,
    };
    async function addNote() {
      if (!email) {
        logger.error("email is not set, skipping add");
        return;
      }
      await database.addNote(email, noteRecord);
      notes.push(noteRecord);
      setNote("");
      logger.debug("added note");
    }
    addNote();
  }

  return (
    <View style={styles.container}>
      <View style={styles.notes}>
        <FlatList
          data={notes}
          renderItem={({ item }) => (
            <Surface style={styles.surface}>
              <Text style={styles.item}>
                {RichTextRenderer.renderTopLevelParagraphs(item.body)}
              </Text>
            </Surface>
          )}
        />
      </View>
      <View>
        <TextInput style={styles.input} value={note} onChangeText={setNote} />
        <Button onPress={handleButtonPress}>Publish</Button>
      </View>
      <StatusBar />
    </View>
  );
}
