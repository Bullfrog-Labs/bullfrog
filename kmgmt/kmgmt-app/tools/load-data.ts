import {
  Logging,
  NoteRecord,
  UserRecord,
  FirestoreDatabase,
} from "kmgmt-common";
import FirebaseAdmin from "../src/services/FirebaseAdmin";
import * as log from "loglevel";

Logging.configure(log);

const notes: NoteRecord[] = [];

async function main() {
  // Replace with your email.
  const userName = "agrodellic@gmail.com";

  const logger = log.getLogger("load-data");
  logger.debug("load-data");
  const admin = FirebaseAdmin.init();
  const underlying = admin.firestore();

  // @ts-ignore the admin and client sdk types seem the same, but they are named differently
  const database = FirestoreDatabase.of(underlying);

  const userRecord: UserRecord = {
    userName: userName,
  };
  logger.debug(`adding user ${userRecord.userName}`);
  await database.addUser(userRecord);
  logger.debug(`added user ${userRecord.userName}`);

  const results = notes.map(async (note) => {
    await database.addNote(userRecord.userName, note);
  });

  await Promise.all(results);

  logger.debug(`added all notes`);
}

main();
