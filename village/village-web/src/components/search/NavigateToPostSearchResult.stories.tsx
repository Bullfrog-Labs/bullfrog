import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import {
  NavigateToPostSearchResult,
  NavigateToPostSearchResultProps,
} from "./NavigateToPostSearchResult";

export default {
  title: "Search/NavigateToPostSearchResult",
  component: NavigateToPostSearchResult,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<NavigateToPostSearchResultProps> = (args) => (
  <NavigateToPostSearchResult {...args} />
);

const user = {
  uid: "123",
  displayName: "foo",
  username: "foo",
};

export const NavigateToOwnPost = Template.bind({});
NavigateToOwnPost.args = {
  user: user,
  suggestion: {
    title: "Bar",
    authorId: "123",
    authorUsername: "foo",
    action: "navigateToPost",
  },
};

export const NavigateToOtherPost = Template.bind({});
NavigateToOtherPost.args = {
  user: user,
  suggestion: {
    title: "Bar",
    authorId: "456“",
    authorUsername: "baz",
    action: "navigateToPost",
  },
};
