import { CircularProgress } from "@material-ui/core";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { useEffect, useState } from "react";
import { Router } from "./routing/Router";
import { AuthContext, useAuthState } from "./services/auth/Auth";
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

function App() {
  const globalClasses = useGlobalStyles();
  const logger = log.getLogger("App");

  const authState = useAuthState(authProvider);
  const [authCompleted, setAuthCompleted] = authState.authCompleted;
  const [authProviderState] = authState.authProviderState;

  const [user, setUser] = useState<UserRecord>();
  useEffect(() => {
    const fetchUser = async () => {
      if (!!authProviderState) {
        const userExists = await checkIfUserExists(
          database,
          authProviderState.uid
        );
        if (!userExists) {
          logger.debug(
            `User document does not exist for user ${authProviderState.uid}, creating new one.`
          );
          await createNewUserRecord(database, authProviderState);
        }

        const user = await getUser(database)(authProviderState.uid);
        if (user != null) {
          logger.debug(`setting user ${user.displayName}`);
          setUser(user);
        }
        setAuthCompleted(true);
      }
    };
    fetchUser();
  }, [authProviderState, logger, setAuthCompleted]);

  if (!!authProviderState) {
    logger.debug(
      `Logged in as user ${authProviderState.uid} with ${authProviderState.displayName} / ${authProviderState.username}`
    );
  } else {
    logger.info(`Not logged in`);
  }

  return (
    <>
      {authCompleted ? (
        <AuthContext.Provider value={authProviderState}>
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
