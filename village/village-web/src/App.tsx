import { CircularProgress } from "@material-ui/core";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Router } from "./routing/Router";
import {
  AuthContext,
  AuthProviderState,
  OnAuthStateChangedHandle,
} from "./services/auth/Auth";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { initializeFirebaseApp } from "./services/Firebase";
import { fetchTitleFromOpenGraph } from "./services/OpenGraph";
import { getSearchSuggestionsByTitlePrefix } from "./services/search/Suggestions";
import { FirestoreDatabase } from "./services/store/FirestoreDatabase";
import {
  createPost,
  getAllPostsByTitlePrefix,
  getMentionUserPosts,
  getPost,
  getStackPosts,
  getUserPosts,
  renamePost,
  syncBody,
} from "./services/store/Posts";
import {
  checkIfUserExists,
  createNewUserRecord,
  getUser,
  getUserByUsername,
  UserRecord,
} from "./services/store/Users";
import { useGlobalStyles } from "./styles/styles";

Logging.configure(log);

const [app, auth] = initializeFirebaseApp();
const authProvider = FirebaseAuthProvider.create(app, auth);
const database = FirestoreDatabase.fromApp(app);

const makeOnAuthStateChanged = (
  setAuthState: Dispatch<SetStateAction<AuthProviderState | null>>,
  setAuthCompleted: Dispatch<SetStateAction<boolean>>
): OnAuthStateChangedHandle => async (
  authProviderState: AuthProviderState | null
) => {
  const logger = log.getLogger("App");
  logger.debug("Auth state changed, updating auth state.");
  setAuthState(authProviderState);

  if (!authProviderState) {
    logger.debug("Empty auth state, not logged in. Done updating auth state");
    setAuthCompleted(true);
    return;
  }

  if (!authProviderState.uid) {
    throw new Error("Authed user uid should not be null");
  }

  const userExists = await checkIfUserExists(database, authProviderState.uid);
  if (!userExists) {
    logger.debug(
      `User document does not exist for user ${authProviderState.uid}, creating new one.`
    );
    await createNewUserRecord(database, authProviderState);
  }

  logger.debug("User logged in. Done updating auth state.");
};

function App() {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("App");
  const [authCompleted, setAuthCompleted] = useState(false);
  const [authState, setAuthState] = useState(
    authProvider.getInitialAuthState()
  );
  const [user, setUser] = useState<UserRecord>();
  useEffect(() => {
    const fetchUser = async () => {
      if (!!authState) {
        const user = await getUser(database)(authState.uid);
        if (user != null) {
          logger.debug(`setting user ${user.displayName}`);
          setUser(user);
        }
        setAuthCompleted(true);
      }
    };
    fetchUser();
  }, [authState, logger]);

  authProvider.onAuthStateChanged = makeOnAuthStateChanged(
    setAuthState,
    setAuthCompleted
  );

  if (authState) {
    logger.debug(
      `Logged in as user ${authState.uid} with ${authState.displayName} / ${authState.username}`
    );
  } else {
    logger.info(`Not logged in`);
  }

  return (
    <>
      {authCompleted ? (
        <AuthContext.Provider value={authState}>
          <Router
            authProvider={authProvider}
            getUserPosts={getUserPosts(database)}
            getStackPosts={getStackPosts(database)}
            getUser={getUser(database)}
            getUserByUsername={getUserByUsername(database)}
            getPost={getPost(database)}
            createPost={createPost(database)}
            renamePost={renamePost(database)}
            syncBody={syncBody(database)}
            getGlobalMentions={getAllPostsByTitlePrefix(database)}
            getMentionUserPosts={getMentionUserPosts(database)}
            getSearchSuggestionsByTitlePrefix={getSearchSuggestionsByTitlePrefix(
              database,
              user!
            )}
            fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
            user={user}
          />
        </AuthContext.Provider>
      ) : (
        <CircularProgress className={globalClasses.loadingIndicator} />
      )}
    </>
  );
}

export default App;
