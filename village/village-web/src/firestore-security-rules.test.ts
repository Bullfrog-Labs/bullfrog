import * as firebase from "@firebase/rules-unit-testing";
import { TokenOptions } from "@firebase/rules-unit-testing/dist/src/api";
import fs from "fs";
import http from "http";
import { FirestoreDatabase } from "./services/store/FirestoreDatabase";
import { createPost } from "./services/store/Posts";
import { createNewUserRecord } from "./services/store/Users";

// Heavily based on https://github.com/firebase/quickstart-testing/blob/master/unit-test-security-rules/test/firestore.spec.js.

const PROJECT_ID = "village";
const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:ruleCoverage.html`;
const FIRESTORE_RULES_LOCATION = "../firestore.rules";

const getAuthedFirebaseApp = (auth: TokenOptions | undefined) =>
  firebase.initializeTestApp({ projectId: PROJECT_ID, auth });

const getAdminAuthedFirebaseApp = () => getAuthedFirebaseApp({ uid: "owner" });

beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

beforeAll(async () => {
  // Load the rules file before the tests begin
  const rules = fs.readFileSync(FIRESTORE_RULES_LOCATION, "utf8");
  await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

afterAll(async () => {
  // Delete all the FirebaseApp instances created during testing
  // Note: this does not affect or clear any data
  await Promise.all(firebase.apps().map((app) => app.delete()));

  // Write the coverage report to a file
  const coverageFile = "firestore-coverage.html";
  const fstream = fs.createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    http.get(COVERAGE_URL, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

test("Logged-out users cannot write a new user object", async () => {
  const db = FirestoreDatabase.fromApp(getAuthedFirebaseApp(undefined));
  const authProviderState = {
    uid: "123",
    displayName: "foo",
    username: "bar",
  };

  firebase.assertFails(createNewUserRecord(db, authProviderState));
});

test("Logged-out users cannot write to a post", () => {});

test("Logged-in users can write to their own user object", async () => {
  const db = FirestoreDatabase.fromApp(getAuthedFirebaseApp({ uid: "123" }));
  const authProviderState = {
    uid: "123",
    displayName: "foo",
    username: "bar",
  };

  firebase.assertSucceeds(createNewUserRecord(db, authProviderState));
});

test("Logged-in users cannot write to others' posts", () => {});

test("Logged-in users can write to their own posts", async () => {
  const adminDB = FirestoreDatabase.fromApp(getAdminAuthedFirebaseApp());
  createPost(adminDB);

  const db = FirestoreDatabase.fromApp(getAuthedFirebaseApp({ uid: "123" }));
});
