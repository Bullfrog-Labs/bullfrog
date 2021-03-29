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
        type: "p",
        children: [{ text: "Hello and welcome to Village 🎉🎉🎉!" }],
      },
      {
        children: [
          {
            text:
              "Village is a multi-player digital garden built with connection in mind.",
          },
        ],
        type: "p",
      },
      {
        children: [
          { text: "For information on how to get started, check out " },
          {
            postId: "iUJS6XHlr57lkYsfTpxn",
            value: "Getting Started in Village",
            authorId: "XIyXiG6v38Ru7sQarPqYtlIGolC3",
            type: "mention",
            authorUsername: "getvillageink",
            exists: true,
            children: [{ text: "" }],
          },
          { text: "." },
        ],
        type: "p",
      },
      {
        children: [
          { text: "For other help & support, have a look at " },
          {
            authorId: "XIyXiG6v38Ru7sQarPqYtlIGolC3",
            children: [{ text: "" }],
            exists: true,
            value: "Help & Support",
            postId: "L0SdDtT3OwdXMOGymI4f",
            type: "mention",
            authorUsername: "getvillageink",
          },
          { text: "." },
        ],
        type: "p",
      },
    ],
  },
];
