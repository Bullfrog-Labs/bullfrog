import { RichText } from "../components/richtext/Types";

/**
 * This json doc is what is saved as the new user onboarding welcome post.
 * The best way to modify this is to create a post with the content you
 * want, print the children of the slate doc in the console, and copy it
 * out.
 *
 * Keep this doc simple - old versions of it wont be updated when it changes.
 */
export const ONBOARDING_POST_BODY: RichText = [
  {
    children: [
      {
        children: [{ text: "Hello and welcome to Village 🎉🎉🎉!" }],
        type: "p",
      },
      {
        type: "p",
        children: [
          { text: "For information on how to get started, check out " },
          {
            type: "mention",
            children: [{ text: "" }],
            value: "Getting Started in Village",
            postId: "iUJS6XHlr57lkYsfTpxn",
            authorId: "XIyXiG6v38Ru7sQarPqYtlIGolC3",
            authorUsername: "getvillageink",
            exists: true,
          },
          { text: "." },
        ],
      },
      {
        type: "p",
        children: [
          { text: "For other help & support, have a look at " },
          {
            type: "mention",
            children: [{ text: "" }],
            value: "Help & Support",
            postId: "L0SdDtT3OwdXMOGymI4f",
            authorId: "XIyXiG6v38Ru7sQarPqYtlIGolC3",
            authorUsername: "getvillageink",
            exists: true,
          },
          { text: "." },
        ],
      },
    ],
  },
];
