import React from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
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
  } = props;

  const AppContainerWithProps: React.FC<{}> = (props) => (
    <AppContainer
      createPost={createPost}
      getSearchBoxSuggestions={getSearchSuggestionsByTitlePrefix}
      fetchTitleFromOpenGraph={fetchTitleFromOpenGraph}
    >
      {props.children}
    </AppContainer>
  );

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login">
          <AppContainerWithProps>{loginView}</AppContainerWithProps>
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
        <PrivateRoute exact path="/post/:authorIdOrUsername/:postId">
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
            />
          </AppContainerWithProps>
        </PrivateRoute>
        <Route path="*">
          <Sad404 />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
