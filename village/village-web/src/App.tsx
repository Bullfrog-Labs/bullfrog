import { CircularProgress } from "@material-ui/core";
import { Logging } from "kmgmt-common";
import * as log from "loglevel";
import { useEffect, useState } from "react";
import { Router } from "./routing/Router";
import { logEvent, setCurrentScreen } from "./services/Analytics";
import { AppAuthContext } from "./services/auth/AppAuth";
import { isWhitelisted, useAuthState } from "./services/auth/Auth";
import FirebaseAuthProvider from "./services/auth/FirebaseAuthProvider";
import { initializeFirebaseApp } from "./services/Firebase";
import { fetchTitleFromOpenGraph } from "./services/OpenGraph";
import { getSearchSuggestionsByTitlePrefix } from "./services/search/Suggestions";
import { getCursoredActivitiesFromFeed } from "./services/store/Activities";
import { FirestoreDatabase } from "./services/store/FirestoreDatabase";
import {
  listenForUserPostFollow,
  setPostFollowed,
} from "./services/store/Follows";
import {
  createPost,
  deletePost,
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
import { buildIsUserWhitelisted } from "./services/store/Whitelist";
import { buildLookupTwitterUser } from "./services/Twitter";
import { useGlobalStyles } from "./styles/styles";
import { LoginView } from "./views/LoginView";

Logging.configure(log);

const isRunningLocally = window.location.hostname === "localhost";
const useEmulator = isRunningLocally && false;

const [app, auth, functions] = initializeFirebaseApp(useEmulator);
const authProvider = FirebaseAuthProvider.create(app, auth);
const database = FirestoreDatabase.fromApp(app, useEmulator);

const lookupTwitterUser = buildLookupTwitterUser(functions);
const checkIsUserWhitelisted = buildIsUserWhitelisted(database);

function App() {
  const logger = log.getLogger("App");
  const globalClasses = useGlobalStyles();

  const authState = useAuthState(authProvider);
  const [authCompleted, setAuthCompleted] = authState.authCompleted;
  const [authProviderState] = authState.authProviderState;
  const [whitelisted, setWhitelisted] = authState.whitelisted;

  const [user, setUser] = useState<UserRecord>();

  logger.debug(`UserAgent: ${navigator.userAgent}`);

  useEffect(() => {
    const fetchUser = async () => {
      if (!!authProviderState) {
        logger.debug(`Checking whitelist for ${authProviderState.uid}`);
        const isUserWhitelisted = await isWhitelisted(
          authProviderState,
          checkIsUserWhitelisted
        );
        setWhitelisted(isUserWhitelisted, "exists");

        if (!isWhitelisted) {
          logger.debug(`User ${authProviderState.uid} is not whitelisted`);
          setAuthCompleted(true);
          return;
        } else {
          logger.debug(`User ${authProviderState.uid} is whitelisted`);
        }

        const userExists = await checkIfUserExists(
          database,
          authProviderState.uid
        );

        if (!userExists) {
          logger.debug(
            `User record does not exist for user ${authProviderState.uid}`
          );

          await createNewUserRecord(
            database,
            lookupTwitterUser,
            authProviderState
          );
        }

        const user = await getUser(database)(authProviderState.uid);
        if (user != null) {
          logger.debug(`setting user ${user.displayName}`);
          app.analytics().setUserId(user.uid);
          setUser(user);
          setWhitelisted(true, "exists"); // only possible to have user record if whitelisted
        } else {
          throw new Error("Could not find user record");
        }
        setAuthCompleted(true);
      }
    };
    fetchUser();
  }, [authProviderState, logger, setAuthCompleted, setWhitelisted]);

  const appAuthState = {
    authCompleted: authCompleted,
    authProviderState: authProviderState,
    authedUser: user,
    whitelisted: whitelisted.loaded() ? whitelisted.get() : undefined,
  };

  logger.debug(`appAuthState: ${JSON.stringify(appAuthState)}`);

  const isSitePublic = process.env.REACT_APP_IS_PUBLIC === "true";

  const loginView = (
    <LoginView
      authProvider={authProvider}
      googleAuthEnabled={process.env.REACT_APP_GOOGLE_AUTH_ENABLED === "true"}
    />
  );

  const followablePostCallbacks = {
    setPostFollowed: setPostFollowed(functions),
    listenForUserPostFollow: listenForUserPostFollow(database),
  };

  return (
    <>
      {authCompleted ? (
        <AppAuthContext.Provider value={appAuthState}>
          <Router
            loginView={loginView}
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
              database
            )}
            fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
            deletePost={deletePost(functions)}
            logEvent={logEvent(app.analytics())}
            setCurrentScreen={setCurrentScreen(app.analytics())}
            curriedFollowablePostCallbacks={followablePostCallbacks}
            getCursoredActivitiesFromFeed={getCursoredActivitiesFromFeed(
              database
            )}
            isSitePublic={isSitePublic}
          />
        </AppAuthContext.Provider>
      ) : (
        <CircularProgress className={globalClasses.loadingIndicator} />
      )}
    </>
  );
}

export default App;
