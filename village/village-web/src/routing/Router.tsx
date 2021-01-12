import React from "react";
import { Switch, Route, BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../services/auth/Auth";
import AppContainer from "../components/AppContainer";
import { LoginView } from "../views/LoginView";
import PrivateRoute from "./PrivateRoute";
import MainView from "../views/MainView";
import { ProfileViewController } from "../components/ProfileView";
import { StackViewController } from "../components/StackView";
import {
  CreatePostFn,
  GetAllPostsByTitlePrefixFn,
  GetPostFn,
  GetStackPostsFn,
  GetUserPostsFn,
  GetMentionUserPostsFn,
  RenamePostFn,
  SyncBodyFn,
} from "../services/store/Posts";
import { UserRecord, GetUserFn } from "../services/store/Users";
import { PostViewController } from "../views/PostView";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";

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

export const Router = (props: {
  authProvider: AuthProvider;
  getUserPosts: GetUserPostsFn;
  getStackPosts: GetStackPostsFn;
  getUser: GetUserFn;
  getPost: GetPostFn;
  createPost: (user: UserRecord) => CreatePostFn;
  renamePost: (user: UserRecord) => RenamePostFn;
  syncBody: (user: UserRecord) => SyncBodyFn;
  getGlobalMentions: GetAllPostsByTitlePrefixFn;
  getSearchSuggestionsByTitlePrefix: SearchSuggestionFetchFn;
  getMentionUserPosts: GetMentionUserPostsFn;
  user?: UserRecord;
}) => {
  const {
    authProvider,
    getUserPosts,
    getStackPosts,
    getUser,
    getPost,
    createPost,
    renamePost,
    syncBody,
    getGlobalMentions,
    getSearchSuggestionsByTitlePrefix,
    getMentionUserPosts,
    user,
  } = props;
  const AppContainerWithProps: React.FC<{}> = (props) => (
    <AppContainer
      user={user}
      createPost={user ? createPost(user) : undefined}
      getSearchBoxSuggestions={getSearchSuggestionsByTitlePrefix}
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
          <PrivateRoute exact path="/profile/:userId?">
            <AppContainerWithProps>
              <ProfileViewController
                getUserPosts={getUserPosts}
                getUser={getUser}
                user={user}
              />
            </AppContainerWithProps>
          </PrivateRoute>
          <PrivateRoute exact path="/stack/:stackId">
            <AppContainerWithProps>
              <StackViewController getStackPosts={getStackPosts} />
            </AppContainerWithProps>
          </PrivateRoute>
          <PrivateRoute exact path="/post/:authorId/:postId">
            <AppContainerWithProps>
              <PostViewController
                viewer={user}
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
