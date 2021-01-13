import * as log from "loglevel";
import { Dispatch, SetStateAction, useState } from "react";
import { Logging } from "kmgmt-common";
import { FirestoreDatabase } from "./services/store/FirestoreDatabase";
import { initializeFirebaseApp } from "./services/Firebase";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import {
  AuthContext,
  AuthState,
  OnAuthStateChangedHandle,
} from "./services/auth/Auth";
import {
  checkIfUserExists,
  createNewUserRecord,
  getUser,
  UserRecord,
} from "./services/store/Users";
import { Router } from "./routing/Router";
import firebase from "firebase";
import {
  getUserPosts,
  getStackPosts,
  getPost,
  createPost,
  renamePost,
  syncBody,
  getMentionUserPosts,
  getAllPostsByTitlePrefix,
} from "./services/store/Posts";
import { useEffect } from "react";
import { getSearchSuggestionsByTitlePrefix } from "./services/search/Suggestions";
import { fetchTitleFromOpenGraph } from "./services/OpenGraph";

Logging.configure(log);

const [app, auth] = initializeFirebaseApp();
const authProvider = FirebaseAuthProvider.create(app, auth);
const database = FirestoreDatabase.fromApp(app);

const makeOnAuthStateChanged = (
  authState: AuthState,
  setAuthState: Dispatch<SetStateAction<AuthState>>
): OnAuthStateChangedHandle => async (authedUser: firebase.User) => {
  const logger = log.getLogger("App");
  logger.debug("Auth state changed, updating auth state.");
  setAuthState(authedUser);

  if (!authedUser) {
    logger.debug("Empty auth state, not logged in. Done updating auth state");
    return;
  }

  if (!authedUser.uid) {
    throw new Error("Authed user uid should not be null");
  }

  const userExists = await checkIfUserExists(database, authedUser.uid);
  if (!userExists) {
    logger.debug(
      `User document does not exist for user ${authedUser.uid}, creating new one.`
    );
    await createNewUserRecord(database, authedUser);
  }

  logger.debug("User logged in. Done updating auth state.");
};

function App() {
  const logger = log.getLogger("App");
  const [authState, setAuthState] = useState(
    authProvider.getInitialAuthState()
  );
  const [user, setUser] = useState<UserRecord>();
  useEffect(() => {
    const fetchUser = async () => {
      if (authState?.uid) {
        const user = await getUser(database)(authState.uid);
        if (user != null) {
          logger.debug(`setting user ${user.displayName}`);
          setUser(user);
        }
      }
    };
    fetchUser();
  }, [authState?.uid, logger]);

  authProvider.onAuthStateChanged = makeOnAuthStateChanged(
    authState,
    setAuthState
  );

  if (authState) {
    logger.debug(
      `Logged in as user ${authState.uid} with ${authState.displayName} / ${authState.email}`
    );
  } else {
    logger.info(`Not logged in`);
  }

  return (
    <AuthContext.Provider value={authState}>
      <Router
        authProvider={authProvider}
        getUserPosts={getUserPosts(database)}
        getStackPosts={getStackPosts(database)}
        getUser={getUser(database)}
        getPost={getPost(database)}
        createPost={createPost(database)}
        renamePost={renamePost(database)}
        syncBody={syncBody(database)}
        getGlobalMentions={getAllPostsByTitlePrefix(database)}
        getMentionUserPosts={getMentionUserPosts(database)}
        getSearchSuggestionsByTitlePrefix={getSearchSuggestionsByTitlePrefix(
          database
        )}
        fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
        user={user}
      />
    </AuthContext.Provider>
  );
}

export default App;
