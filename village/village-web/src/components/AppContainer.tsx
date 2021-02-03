import {
  Container,
  CssBaseline,
  Divider,
  Drawer,
  MuiThemeProvider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core";
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  CurriedByUser,
  useWhitelistedUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { FetchTitleFromOpenGraphFn } from "../services/OpenGraph";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";
import { CreatePostFn } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import theme from "../styles/theme";
import {
  AUTOCOMPLETE_SEARCH_BOX_ESCKEY,
  AUTOCOMPLETE_SEARCH_BOX_HOTKEY,
  useAutocompleteSearchBoxDialog,
} from "./search/AutocompleteSearchBox";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    flexShrink: 0,
  },
  drawerPaper: {},
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerIcon: {
    minWidth: "0px",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.light,
  },
  title: {
    flexGrow: 1,
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
    color: theme.palette.secondary.light,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

interface BaseAppContainerProps extends React.PropsWithChildren<{}> {
  autocompleteSearchBoxDialog?: React.ReactChild;
}

const BaseAppContainer = (props: BaseAppContainerProps) => {
  const classes = useStyles();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {!!props.autocompleteSearchBoxDialog && props.autocompleteSearchBoxDialog}
      <div className={classes.root}>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="left"
        >
          <div className={classes.toolbar} />
          <Divider />
        </Drawer>
        <main className={classes.content}>
          <Container maxWidth="sm">
            <div />
            {props.children}
          </Container>
        </main>
      </div>
    </MuiThemeProvider>
  );
};

export interface AppContainerProps extends React.PropsWithChildren<{}> {
  createPost: CurriedByUser<CreatePostFn>;
  getSearchBoxSuggestions: CurriedByUser<SearchSuggestionFetchFn>;
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn;
}

export const AppContainer = (props: AppContainerProps) => {
  const user = useWhitelistedUserFromAppAuthContext();

  return !!user ? (
    <AuthedAppContainer user={user} {...props} />
  ) : (
    <UnauthedAppContainer {...props} />
  );
};

export interface AuthedAppContainerProps extends AppContainerProps {
  user: UserRecord;
}

const AuthedAppContainer = (props: AuthedAppContainerProps) => {
  const {
    user,
    createPost,
    getSearchBoxSuggestions,
    fetchTitleFromOpenGraph,
  } = props;

  const autocompleteSearchBox = useAutocompleteSearchBoxDialog(
    user,
    createPost(user),
    getSearchBoxSuggestions(user),
    fetchTitleFromOpenGraph
  );

  useHotkeys(AUTOCOMPLETE_SEARCH_BOX_HOTKEY, (event) => {
    event.preventDefault();
    autocompleteSearchBox.setDialogOpen((v: boolean) => !v);
  });

  useHotkeys(AUTOCOMPLETE_SEARCH_BOX_ESCKEY, () => {
    autocompleteSearchBox.setDialogOpen(false);
  });

  return (
    <BaseAppContainer
      autocompleteSearchBoxDialog={autocompleteSearchBox.dialog}
    >
      {props.children}
    </BaseAppContainer>
  );
};

const UnauthedAppContainer = (props: AppContainerProps) => (
  <BaseAppContainer>{props.children}</BaseAppContainer>
);

export default AppContainer;
