import "react-native-gesture-handler";
import * as React from "react";
import { NoteRecord, Database, Documents, DocumentNode } from "kmgmt-common";
import { StyleSheet, View, StatusBar, FlatList } from "react-native";
import { TextInput, Surface, Button } from "react-native-paper";
import * as log from "loglevel";
import { NotePreview } from "./NotePreview";

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

export default function AddNoteScreen(props: {
  database: Database;
  userAuth?: { email: string | null };
}) {
  const { database, userAuth } = props;
  const logger = log.getLogger("AddNoteScreen");
  const [notes, setNotes] = React.useState<NoteRecord[]>([]);
  const [note, setNote] = React.useState<string>("");
  const email = userAuth?.email;

  logger.debug(`notes state = ${JSON.stringify(notes)}`);

  React.useEffect(() => {
    async function getNotes() {
      logger.debug(`using email for fetch; email = ${email}`);
      if (email) {
        const fetchedNotes = await database.getNotes(email);
        logger.debug(`notes = ${JSON.stringify(fetchedNotes)}`);
        setNotes(fetchedNotes);
      }
    }
    getNotes();
  }, [logger, email, database]);

  function handleButtonPress() {
    logger.debug(`button press ${note}`);
    const addedNote = note;
    const doc = Documents.paragraph(addedNote);
    logger.debug(`adding note ${JSON.stringify(doc)}`);
    const noteRecord: NoteRecord = {
      body: doc.children,
    };
    async function addNote() {
      if (!email) {
        logger.error("email is not set, skipping add");
        return;
      }
      await database.addNote(email, noteRecord);
      notes.push(noteRecord);
      setNotes(Array.from(notes));
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
              {/* This cast to DocumentNode is weird. Should prob. add an explicit integrity check. */}
              <NotePreview
                document={
                  { children: item.body, type: "document" } as DocumentNode
                }
              />
            </Surface>
          )}
        />
      </View>
      <View>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          accessibilityLabel={"Note Input"}
        />
        <Button onPress={handleButtonPress}>Publish</Button>
      </View>
      <StatusBar />
    </View>
  );
}
