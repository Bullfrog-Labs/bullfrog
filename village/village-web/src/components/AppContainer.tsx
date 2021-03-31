import {
  Container,
  CssBaseline,
  makeStyles,
  MuiThemeProvider,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { usePopupTypeform } from "../hooks/typeform/usePopupTypeform";
import {
  CurriedByUser,
  useWhitelistedUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { FetchTitleFromOpenGraphFn } from "../services/OpenGraph";
import { SearchSuggestionFetchFn } from "../services/search/Suggestions";
import { CreatePostFn, ExportAllPostsFn } from "../services/store/Posts";
import { UserRecord } from "../services/store/Users";
import { SIGNUP_TYPEFORM_URL } from "../services/Typeform";
import theme from "../styles/theme";
import { AuthedAppBar } from "./AuthedAppBar";
import { AuthedAppDrawer } from "./navigation/AuthedAppDrawer";
import {
  AUTOCOMPLETE_SEARCH_BOX_ESCKEY,
  AUTOCOMPLETE_SEARCH_BOX_HOTKEY,
  useAutocompleteSearchBoxDialog,
} from "./search/AutocompleteSearchBox";
import { SearchOrCreateFab } from "./search/SearchOrCreateFab";
import { SignupCTAButton } from "./signup/SignupCTAButton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
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
  signupCTAButton: {
    position: "fixed",
    top: "calc(50% - 250px)",
    right: "0px",

    transform: "rotate(-90deg)",
    transformOrigin: "bottom right",
  },
  container: {
    marginBottom: theme.spacing(6),
  },
}));

interface BaseAppContainerProps extends React.PropsWithChildren<{}> {
  autocompleteSearchBoxDialog?: React.ReactChild;
  appBar?: React.ReactChild;
  appDrawer?: React.ReactChild;
}

const BaseAppContainer = (props: BaseAppContainerProps) => {
  const classes = useStyles();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {!!props.autocompleteSearchBoxDialog && props.autocompleteSearchBoxDialog}
      <div className={classes.root}>
        {!!props.appDrawer && props.appDrawer}
        <main className={classes.content}>
          {!!props.appBar && (
            <>
              {props.appBar}
              <Toolbar />
            </>
          )}
          <Container maxWidth="sm" className={classes.container}>
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
  exportAllPosts: ExportAllPostsFn;
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

  const theme = useTheme();

  const [appDrawer, appBar] = useMediaQuery(theme.breakpoints.up("sm"))
    ? [<AuthedAppDrawer exportAllPosts={props.exportAllPosts} />, undefined]
    : [undefined, <AuthedAppBar />];

  return (
    <BaseAppContainer
      autocompleteSearchBoxDialog={autocompleteSearchBox.dialog}
      appDrawer={appDrawer}
      appBar={appBar}
    >
      {!autocompleteSearchBox.dialogOpen && (
        <SearchOrCreateFab
          onClick={() => autocompleteSearchBox.setDialogOpen(true)}
        />
      )}
      {props.children}
    </BaseAppContainer>
  );
};

const UnauthedAppContainer = (props: AppContainerProps) => {
  const classes = useStyles();

  const [popupOpening, setPopupOpening] = useState(false);

  const { openPopup } = usePopupTypeform({
    link: SIGNUP_TYPEFORM_URL,
    onReady: () => {
      setPopupOpening(false);
    },
    onSubmit: () => {},
    onClose: () => {},
  });

  return (
    <>
      <BaseAppContainer>
        <div className={classes.signupCTAButton}>
          <SignupCTAButton
            typeformPopupOpening={popupOpening}
            openTypeformPopup={() => {
              setPopupOpening(true);
              openPopup();
            }}
          />
        </div>
        {props.children}
      </BaseAppContainer>
    </>
  );
};

export default AppContainer;
