import { makeStyles } from "@material-ui/core";
import { Meta, Story } from "@storybook/react/types-6-0";
import { AppAuthContext } from "../../services/auth/AppAuth";
import { userToAppAuthState } from "../../testing/AppAuthTestUtils";
import { AuthedAppDrawer, AuthedAppDrawerProps } from "./AuthedAppDrawer";

const viewer = {
  uid: "123",
  displayName: "foo",
  username: "foo",
};

const viewerAppAuthContextDecorator = (Story: Story) => {
  return (
    <AppAuthContext.Provider value={userToAppAuthState(viewer)}>
      <Story />
    </AppAuthContext.Provider>
  );
};

export default {
  title: "Navigation/AuthedAppDrawer",
  component: AuthedAppDrawer,
  decorators: [viewerAppAuthContextDecorator],
} as Meta;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Template: Story<AuthedAppDrawerProps> = (args) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AuthedAppDrawer {...args} />
    </div>
  );
};

export const Main = Template.bind({});
Main.args = {};
