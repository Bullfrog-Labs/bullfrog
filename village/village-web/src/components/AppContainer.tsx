import React from "react";
import {
  MuiThemeProvider,
  Container,
  CssBaseline,
  Divider,
  Drawer,
} from "@material-ui/core";
import { FetchTitleFromOpenGraphFn } from "../services/OpenGraph";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../styles/theme";

import { useHotkeys } from "react-hotkeys-hook";
import { UserRecord } from "../services/store/Users";
import { CreatePostFn } from "../services/store/Posts";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";
import {
  useAutocompleteSearchBoxDialog,
  AUTOCOMPLETE_SEARCH_BOX_HOTKEY,
  AUTOCOMPLETE_SEARCH_BOX_ESCKEY,
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
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

type BaseAppContainerProps = {
  autocompleteSearchBoxDialog?: React.ReactChild;
};

const BaseAppContainer: React.FC<BaseAppContainerProps> = (props) => {
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
  user?: UserRecord;
  createPost?: CreatePostFn;
  getSearchBoxSuggestions: SearchSuggestionFetchFn;
  fetchTitleFromOpenGraph: FetchTitleFromOpenGraphFn;
}

export const AppContainer: React.FC<AppContainerProps> = (props) =>
  !!props.user ? (
    <AuthedAppContainer {...props} />
  ) : (
    <UnauthedAppContainer {...props} />
  );

const AuthedAppContainer = (props: AppContainerProps) => {
  if (!props.user) {
    throw new Error(
      "AuthedAppContainer should be called with valid authenticated user."
    );
  }

  if (!props.createPost) {
    throw new Error(
      "AuthedAppContainer should be called with a valid createPost"
    );
  }

  const autocompleteSearchBox = useAutocompleteSearchBoxDialog(
    props.user,
    props.createPost!,
    props.getSearchBoxSuggestions,
    props.fetchTitleFromOpenGraph
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
