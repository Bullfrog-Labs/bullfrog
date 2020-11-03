import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import {
  PocketImportItemCard,
  PocketImportItemCardProps,
  PocketImportItemRecord,
} from "./PocketImportsListView";

export default {
  title: "PocketImportItemCard",
  component: PocketImportItemCard,
} as Meta;

const Template: Story<PocketImportItemCardProps> = (args) => (
  <PocketImportItemCard {...args} />
);

export const FullySpecified = Template.bind({});
FullySpecified.args = {
  pocketImportItem: {
    pocket_item_id: "123",
    url: "https://en.wikipedia.org/wiki/International_Space_Station",
    title: "International Space Station",
    authors: ["Alice", "Bob"],
    description:
      "The International Space Station (ISS) is a modular space station (habitable artificial satellite) in low Earth orbit.",
  },
};

export const URLOnly = Template.bind({});
URLOnly.args = {
  pocketImportItem: {
    pocket_item_id: "123",
    url: "https://en.wikipedia.org/wiki/International_Space_Station",
  },
};

export const TitleOnly = Template.bind({});
TitleOnly.args = {
  pocketImportItem: {
    pocket_item_id: "123",
    url: "https://en.wikipedia.org/wiki/International_Space_Station",
    title: "International Space Station",
  },
};
