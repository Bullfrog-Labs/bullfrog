import * as firebase from "@firebase/rules-unit-testing";
import { TokenOptions } from "@firebase/rules-unit-testing/dist/src/api";

export const PROJECT_ID = "village";

export const getAuthedFirebaseApp = (auth: TokenOptions | undefined) =>
  firebase.initializeTestApp({ projectId: PROJECT_ID, auth });

export const getAdminAuthedFirebaseApp = () =>
  getAuthedFirebaseApp({ uid: "owner" });
