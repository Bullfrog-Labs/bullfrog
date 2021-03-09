import { ELEMENT_MENTION } from "@blfrg.xyz/slate-plugins";
import * as _ from "lodash";
import * as log from "loglevel";
import { createEditor, Editor, Node, Path } from "slate";
import { PostId, UserPost } from "../../services/store/Posts";
import { RichText, RichTextNode } from "./Types";

export type MentionInContext = {
  post: UserPost;
  text: RichText;
  path: Path;
  truncatedStart: boolean;
  truncatedEnd: boolean;
};

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

export const wrapInLink = (richText: RichText, url: string): RichTextNode => ({
  type: "a",
  url: url,
  children: richText,
});

export const wrapInParagraph = (richText: RichText): RichTextNode => ({
  type: "p",
  children: richText,
});

export const wrapInTopLevelRichText = (
  richTextNodes: RichTextNode[]
): RichText => [
  {
    children: richTextNodes,
  },
];

export const stringToRichTextNode = (s: string): RichTextNode => ({ text: s });

export const stringToTopLevelRichText = (s: string): RichText =>
  wrapInTopLevelRichText([wrapInParagraph([stringToRichTextNode(s)])]);

export const slateNodeToString = (text: RichText): string =>
  Node.string(text[0]);

export const EDITABLE_TYPOGRAPHY_TEXT_NODE_PATH = [0, 0, 0];

// TODO: This should probably be converted to a TSX function, so that the
// preview is a React component. Code from Rendering.tsx can probably be used to
// generate the preview.
export const richTextStringPreview = (
  richText: RichText
): string | undefined => {
  if (!richText || richText.length === 0) {
    return undefined;
  }

  return Array.from(Node.texts(richText[0]), ([text]) => text.text)
    .slice(0, 3)
    .join("\n");
};

export const wrapNodeAsDoc = (node: Node) => {
  return wrapNodesAsDoc([node]);
};

export const wrapNodesAsDoc = (nodes: Node[]) => {
  return [{ children: nodes }];
};

/**
 * The idea here is: for each level in the path, see if there is a next node.
 * If not, we must be at the final node for the given level.
 */
const isLastBlock = (editor: Editor, path: Path) => {
  for (let i = path.length; i > 0; i--) {
    const curr = path.slice(0, i);
    const next = Path.next(curr);
    if (Node.has(editor, next)) {
      return false;
    }
  }
  return true;
};

export const postPreviewFromStart = (
  body: RichText
): [RichText, boolean, boolean] => {
  return postPreview(body, [0, 0, 0]);
};

export const mentionPreview = (
  body: RichText,
  path: Path
): [RichText, boolean, boolean] => {
  return postPreview(body, path);
};

/**
 * V2 postPreview function, still very hacky. This only attempts to pull a
 * little more context if its *easy*. Basically it will look for the next
 * sibling node and include it if it exists. Else it will just return the
 * one node.
 *
 * @returns [preview, truncated-start, truncated-end]
 */
export const postPreview = (
  body: RichText,
  path: Path,
  maxChars: number = 200
): [RichText, boolean, boolean] => {
  const editor = createEditor();
  editor.children = body;
  const block = Editor.above(editor, { at: path });
  if (!block) {
    return [[], false, false];
  }
  const blockPath = block[1];
  const node = block[0];

  const previewNodes: Node[] = [node];
  const nodeStr = Node.string(node);

  if (nodeStr.length < maxChars) {
    const nextPath = Path.next(blockPath);
    if (Node.has(editor, nextPath)) {
      const [nextNode] = Editor.node(editor, nextPath);
      if (nextNode) {
        const nextNodeStr = Node.string(nextNode);
        if (nodeStr.length + nextNodeStr.length <= maxChars) {
          previewNodes.push(nextNode);
        }
      }
    }
  }

  const previewDoc = wrapNodesAsDoc(previewNodes);

  // Hopefully means we've always taken the entire first block.
  const truncatedStart = !!blockPath.find((p) => p !== 0);
  const truncatedEnd = !isLastBlock(editor, blockPath);

  return [previewDoc, truncatedStart, truncatedEnd];
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
    logger.debug(`got ${mentionNodes.length} mentionNodes`);
    mentionNodes.forEach((mentionNode) => {
      // The path returned by the search function is a little off because we
      // search from the first child.
      const path = [0, ...mentionNode[1]];
      const [preview, truncatedStart, truncatedEnd] = mentionPreview(
        post.post.body,
        path
      );
      // This isn't perfect (assumes same object always serialized to the same
      // thing), but probably ok for now.
      const previewId = JSON.stringify(preview);
      if (!previews.has(previewId)) {
        const mentionInContext = {
          post: post,
          text: preview,
          path: path,
          truncatedStart: truncatedStart,
          truncatedEnd: truncatedEnd,
        };
        mentions.push(mentionInContext);
        previews.add(previewId);
      }
    });
  });
  return mentions;
};

// This is not totally correct. It wouldn't "see" mentions etc.
export const isEmptyDoc = (doc: RichText): boolean => {
  return _.isEqual(doc, EMPTY_RICH_TEXT);
};
