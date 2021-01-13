import { RichText } from "./Types";
import { createEditor, Editor, Node, Path, Transforms } from "slate";
import { ELEMENT_MENTION } from "@blfrg.xyz/slate-plugins";
import { UserPost, PostId } from "../../services/store/Posts";
import * as log from "loglevel";

export const EMPTY_RICH_TEXT: RichText = [
  {
    children: [
      {
        type: "p",
        children: [{ text: "" }],
      },
    ],
  },
];

export const stringToSlateNode = (s: string): RichText => [
  {
    children: [
      {
        type: "p",
        children: [{ text: s }],
      },
    ],
  },
];

export const slateNodeToString = (text: RichText): string =>
  Node.string(text[0]);

// TODO: This should probably be converted to a TSX function, so that the
// preview is a React component. Code from Rendering.tsx can probably be used to
// generate the preview.
export const richTextStringPreview = (
  richText: RichText | string // '| string' is temporary - working around data form transition
): string | undefined => {
  if (typeof richText === "string") {
    return richText;
  }

  if (!richText || richText.length === 0) {
    return undefined;
  }

  return Array.from(Node.texts(richText[0]), ([text, path]) => text.text)
    .slice(0, 3)
    .join("\n");
};

export const mentionPreview = (body: RichText, path: Path): Node[] => {
  const editor = createEditor();
  editor.children = body;
  const block = Editor.above(editor, { at: path });
  const node = block && block[0];

  if (!node) {
    return [];
  }

  const preview = createEditor();
  preview.children = [{ children: [node] }];

  Transforms.insertNodes(
    preview,
    {
      type: "p",
      children: [{ text: "⋯" }],
    },
    { at: [0, 1] }
  );

  Transforms.insertNodes(
    preview,
    {
      type: "p",
      children: [{ text: "⋯" }],
    },
    { at: [0, 0] }
  );

  return preview.children;
};

export type MentionInContext = {
  post: UserPost;
  text: RichText;
  path: Path;
};

const findMentionsInText = (text: RichText, postId: PostId) => {
  return Array.from(Node.elements(text[0])).filter(
    (n) => n[0]["type"] === ELEMENT_MENTION && n[0]["postId"] === postId
  );
};

export const findMentionsInPosts = (
  posts: UserPost[],
  postId: PostId
): MentionInContext[] => {
  const logger = log.getLogger("findMentionsInPosts");
  const mentions: MentionInContext[] = [];
  posts.forEach((post) => {
    const previews = new Set<string>();
    const mentionNodes = findMentionsInText(post.post.body, postId);
    logger.trace(`got ${mentionNodes.length} mentionNodes`);
    mentionNodes.forEach((mentionNode) => {
      // The path returned by the search function is a little off because we
      // search from the first child.
      const path = [0, ...mentionNode[1]];
      const preview = mentionPreview(post.post.body, path);
      // This isn't perfect (assumes same object always serialized to the same
      // thing), but probably ok for now.
      const previewId = JSON.stringify(preview);
      if (!previews.has(previewId)) {
        const mentionInContext = {
          post: post,
          text: preview,
          path: path,
        };
        mentions.push(mentionInContext);
        previews.add(previewId);
      }
    });
  });
  return mentions;
};
