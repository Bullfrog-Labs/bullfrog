import { Meta, Story } from "@storybook/react/types-6-0";
import { MemoryRouter } from "react-router-dom";
import { PostAuthorLink, PostAuthorLinkProps } from "./PostAuthorLink";

export default {
  title: "Identity/PostAuthorLink",
  component: PostAuthorLink,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} as Meta;

const Template: Story<PostAuthorLinkProps> = (args) => (
  <PostAuthorLink {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  uid: "123",
  username: "user123",
};
