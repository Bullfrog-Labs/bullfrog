import React from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
import AppContainer from "../components/AppContainer";
import { ProfileViewController } from "../components/ProfileView";
import { StackViewController } from "../components/StackView";
import { AuthProvider } from "../services/auth/Auth";
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
} from "../services/store/Posts";
import {
  GetUserByUsernameFn,
  GetUserFn,
  UserRecord,
} from "../services/store/Users";
import { LoginView } from "../views/LoginView";
import MainView from "../views/MainView";
import { PostViewController } from "../views/PostView";
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

export type RouterProps = {
  authProvider: AuthProvider;
  getUserPosts: GetUserPostsFn;
  getStackPosts: GetStackPostsFn;
  getUser: GetUserFn;
  getUserByUsername: GetUserByUsernameFn;
  getPost: GetPostFn;
  createPost: (user: UserRecord) => CreatePostFn;
  renamePost: (user: UserRecord) => RenamePostFn;
  syncBody: (user: UserRecord) => SyncBodyFn;
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  getSearchSuggestionsByTitlePrefix: SearchSuggestionFetchFn;
  getMentionUserPosts: GetMentionUserPostsFn;
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn;
  user?: UserRecord;
};

export const Router = (props: RouterProps) => {
  const {
    authProvider,
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
    user,
  } = props;
  const AppContainerWithProps: React.FC<{}> = (props) => (
    <AppContainer
      user={user}
      createPost={user ? createPost(user) : undefined}
      getSearchBoxSuggestions={getSearchSuggestionsByTitlePrefix}
      fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
    >
      {props.children}
    </AppContainer>
  );
  if (!user) {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login">
            <AppContainerWithProps>
              <LoginView authProvider={authProvider} />
            </AppContainerWithProps>
          </Route>
          <Route path="*">
            <Sad404 />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  } else {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login">
            <AppContainerWithProps>
              <LoginView authProvider={authProvider} />
            </AppContainerWithProps>
          </Route>
          <PrivateRoute exact path="/">
            <AppContainerWithProps>
              <MainView />
            </AppContainerWithProps>
          </PrivateRoute>
          <PrivateRoute exact path="/profile/:username?">
            <AppContainerWithProps>
              <ProfileViewController
                getUserPosts={getUserPosts}
                getUserByUsername={getUserByUsername}
                viewer={user}
              />
            </AppContainerWithProps>
          </PrivateRoute>
          <PrivateRoute exact path="/stack/:stackId">
            <AppContainerWithProps>
              <StackViewController getStackPosts={getStackPosts} />
            </AppContainerWithProps>
          </PrivateRoute>
          <PrivateRoute exact path="/post/:authorIdOrUsername/:postId">
            <AppContainerWithProps>
              <PostViewController
                viewer={user}
                getUserByUsername={getUserByUsername}
                getUser={getUser}
                getPost={getPost}
                renamePost={renamePost(user)}
                syncBody={syncBody(user)}
                getGlobalMentions={getGlobalMentions}
                createPost={createPost(user)}
                getMentionUserPosts={getMentionUserPosts}
              />
            </AppContainerWithProps>
          </PrivateRoute>
          <Route path="*">
            <Sad404 />
          </Route>
        </Switch>
      </BrowserRouter>
    );
  }
};
