import React, { useEffect } from "react";
import firebase from "firebase";
import {
  BrowserRouter,
  Route,
  Switch,
  useLocation,
  useHistory,
} from "react-router-dom";
import * as log from "loglevel";
import AppContainer from "../components/AppContainer";
import {
  DefaultProfileViewController,
  ProfileViewController,
} from "../components/ProfileView";
import { StackViewController } from "../components/StackView";
import { CurriedByUser } from "../services/auth/AppAuth";
import { FetchTitleFromOpenGraphFn } from "../services/OpenGraph";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";
import {
  CreatePostFn,
  GetAllPostsByTitlePrefixFn,
  GetMentionUserPostsFn,
  GetPostFn,
  GetStackPostsFn,
  GetUserPostsFn,
  RenamePostFn,
  SyncBodyFn,
  DeletePostFn,
} from "../services/store/Posts";
import { GetUserByUsernameFn, GetUserFn } from "../services/store/Users";
import MainView from "../views/MainView";
import { PostViewController } from "../views/PostView";
import PrivateRoute from "./PrivateRoute";
import { SignupView } from "../views/SignupView";
import { LogEventFn, SetCurrentScreenFn } from "../services/Analytics";

const Sad404 = () => {
  let location = useLocation();

  return (
    <div>
      <h3>
        No match for <code>{location.pathname}</code>
      </h3>
    </div>
  );
};

export type RouterProps = {
  loginView: React.ReactChild;
  getUserPosts: GetUserPostsFn;
  getStackPosts: GetStackPostsFn;

  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  getPost: GetPostFn;
  createPost: CurriedByUser<CreatePostFn>;
  renamePost: CurriedByUser<RenamePostFn>;
  syncBody: CurriedByUser<SyncBodyFn>;
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  getSearchSuggestionsByTitlePrefix: CurriedByUser<SearchSuggestionFetchFn>;
  getMentionUserPosts: GetMentionUserPostsFn;
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn;
  deletePost: DeletePostFn;

  logEvent: LogEventFn;
  setCurrentScreen: SetCurrentScreenFn;

  isSitePublic: boolean;
};

export const Router = (props: RouterProps) => {
  const {
    loginView,
    getUserPosts,
    getStackPosts,
    getUser,
    getUserByUsername,
    getPost,
    createPost,
    renamePost,
    syncBody,
    getGlobalMentions,
    getSearchSuggestionsByTitlePrefix,
    getMentionUserPosts,
    fetchTitleFromOpenGraph,
    deletePost,
    logEvent,
    setCurrentScreen,
    isSitePublic,
  } = props;

  const logger = log.getLogger("Router");

  const AppContainerWithProps: React.FC<{}> = (props) => (
    <AppContainer
      createPost={createPost}
      getSearchBoxSuggestions={getSearchSuggestionsByTitlePrefix}
      fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
    >
      {props.children}
    </AppContainer>
  );

  const MaybePrivateRoute = isSitePublic ? Route : PrivateRoute;

  const Routes = () => {
    const history = useHistory();
    useEffect(() => {
      const unlisten = history.listen((location) => {
        const page = location.pathname + location.search;
        logger.debug("analytics: logging location " + page);
        setCurrentScreen(page);
        logEvent("page_view", { page });
      });
      return unlisten;
    });

    return (
      <Switch>
        <Route path="/login">
          <AppContainerWithProps>{loginView}</AppContainerWithProps>
        </Route>
        <Route path="/signup">
          <SignupView />
        </Route>
        <PrivateRoute exact path="/">
          <AppContainerWithProps>
            <MainView />
          </AppContainerWithProps>
        </PrivateRoute>
        <PrivateRoute exact path="/profile/:username">
          <AppContainerWithProps>
            <ProfileViewController
              getUserPosts={getUserPosts}
              getUserByUsername={getUserByUsername}
            />
          </AppContainerWithProps>
        </PrivateRoute>
        <PrivateRoute exact path="/profile">
          <AppContainerWithProps>
            <DefaultProfileViewController />
          </AppContainerWithProps>
        </PrivateRoute>
        <PrivateRoute exact path="/stack/:stackId">
          <AppContainerWithProps>
            <StackViewController getStackPosts={getStackPosts} />
          </AppContainerWithProps>
        </PrivateRoute>
        <MaybePrivateRoute exact path="/post/:authorIdOrUsername/:postId">
          <AppContainerWithProps>
            <PostViewController
              getUserByUsername={getUserByUsername}
              getUser={getUser}
              getPost={getPost}
              getMentionUserPosts={getMentionUserPosts}
              editablePostCallbacks={{
                renamePost: renamePost,
                syncBody: syncBody,
                getGlobalMentions: getGlobalMentions,
                createPost: createPost,
                deletePost: deletePost,
              }}
              logEvent={logEvent}
            />
          </AppContainerWithProps>
        </MaybePrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    );
  };

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
};
