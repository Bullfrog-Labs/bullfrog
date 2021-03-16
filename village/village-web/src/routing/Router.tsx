import * as log from "loglevel";
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import AppContainer from "../components/AppContainer";
import {
  DefaultProfileViewController,
  ProfileViewController,
} from "../components/ProfileView";
import { StackViewController } from "../components/StackView";
import { LogEventFn, SetCurrentScreenFn } from "../services/Analytics";
import {
  CurriedByUser,
  useWhitelistedUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import {
  FollowablePostCallbacks,
  GetUserFollowsPostFn,
  SetPostFollowedFn,
} from "../services/follows/Types";
import { FetchTitleFromOpenGraphFn } from "../services/OpenGraph";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";
import {
  CreatePostFn,
  DeletePostFn,
  GetAllPostsByTitlePrefixFn,
  GetMentionUserPostsFn,
  GetPostFn,
  GetStackPostsFn,
  GetUserPostsFn,
  RenamePostFn,
  SyncBodyFn,
} from "../services/store/Posts";
import { GetUserByUsernameFn, GetUserFn } from "../services/store/Users";
import MainView from "../views/MainView";
import { PostViewController } from "../views/PostView";
import { SignupClickRegisterView } from "../views/SignupClickRegisterView";
import { SignupView } from "../views/SignupView";
import PrivateRoute from "./PrivateRoute";

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

export type CurriedFollowablePostCallbacks = {
  setPostFollowed: CurriedByUser<SetPostFollowedFn>;
  getUserFollowsPost: CurriedByUser<GetUserFollowsPostFn>;
};

const useUncurriedFollowablePostCallbacks = (
  curried: CurriedFollowablePostCallbacks
): FollowablePostCallbacks => {
  const loggedInUR = useWhitelistedUserFromAppAuthContext();

  return {
    setPostFollowed: loggedInUR
      ? curried.setPostFollowed(loggedInUR!)
      : undefined,
    getUserFollowsPost: loggedInUR
      ? curried.getUserFollowsPost(loggedInUR!)
      : undefined,
  };
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

  curriedFollowablePostCallbacks: CurriedFollowablePostCallbacks;

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
    curriedFollowablePostCallbacks,
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

    const followablePostCallbacks = useUncurriedFollowablePostCallbacks(
      curriedFollowablePostCallbacks
    );

    return (
      <Switch>
        <Route path="/login">
          <AppContainerWithProps>{loginView}</AppContainerWithProps>
        </Route>
        <Route path="/signup">
          <SignupView />
        </Route>
        <Route path="/signup-click">
          <SignupClickRegisterView />
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
              followablePostCallbacks={followablePostCallbacks}
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
