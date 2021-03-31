import ld from "lodash";
import { serialize } from "remark-slate";
import { NodeTypes } from "remark-slate/dist/deserialize";
import { BlockType, LeafType } from "remark-slate/dist/serialize";
import sanitize from "sanitize-filename";
import { Element, Text } from "slate";
import { RichText, RichTextNode } from "./Types";

const NODE_TYPES: NodeTypes = {
  paragraph: "p",
  block_quote: "blockquote",
  code_block: "code_block",
  link: "a",
  ul_list: "ul",
  ol_list: "ol",
  listItem: "li",
  heading: {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
    5: "h5",
    6: "h6",
  },
  emphasis_mark: "italic",
  strong_mark: "bold",
  delete_mark: "strikethrough",
  thematic_break: "thematic_break",
};

const TO_MARKDOWN_OPTIONS = { nodeTypes: NODE_TYPES };

export const MD_FILENAME_SUFFIX = ".md";

export const mentionValueToFilename = (value: string): string => {
  const sanitized = sanitize(value);

  // Mac OS only allows up to 255 chars in the filename
  return sanitized.substring(0, 255 - MD_FILENAME_SUFFIX.length);
};

const isEmptyTextNode = (node: RichTextNode): boolean =>
  Text.isText(node) && node.text.length === 0;

const mentionsToBracketedRefs = (richText: RichText) => {
  type QueueElement = [Element | undefined, number, RichTextNode];
  type Queue = QueueElement[];

  const pushOntoQueue = (
    queue: Queue,
    parent: Element | undefined,
    children: RichTextNode[]
  ) => {
    let idx = 0;
    children.forEach((child) => {
      queue.push([parent, idx, child]);
      idx++;
    });
  };

  const findAllMentions = () => {
    const allMentions: Queue = [];
    const traversalQueue: Queue = [];
    pushOntoQueue(traversalQueue, undefined, richText);

    while (true) {
      const next = traversalQueue.pop();
      if (!next) {
        break;
      }

      const [, , node] = next;

      if (Text.isText(node)) {
        continue;
      }

      const element = node as Element;

      if (!!element.type && element.type === "mention") {
        allMentions.push(next);
      }

      if (!element.children) {
        continue;
      }

      const nonLeaf = element as Element;
      pushOntoQueue(traversalQueue, nonLeaf, nonLeaf.children);
    }

    return allMentions;
  };

  const allMentions = findAllMentions();

  allMentions.forEach((element: QueueElement) => {
    const [parent, idx, mention] = element;
    // not handled as link because the existing links would be invalid
    // off-platform.
    parent!.children[idx] = {
      text: `[[${mentionValueToFilename(mention.value as string)}]]`,
    } as Text;

    // remove the "" added for cursor on either side of mention
    if (isEmptyTextNode(parent!.children[idx + 1])) {
      parent!.children.splice(idx + 1, 1);
    }

    if (isEmptyTextNode(parent!.children[idx - 1])) {
      parent!.children.splice(idx - 1, 1);
    }
  });
};

export const richTextToMarkdown = (richText: RichText) => {
  // Copy input since this function destructively modifies it.
  const rtClone = ld.cloneDeep(richText);

  // Modify mentions here so that they are handled properly by remark-slate
  // serialize.
  mentionsToBracketedRefs(rtClone);

  const result = (rtClone[0].children as RichText)
    .map((chunk) =>
      serialize(chunk as BlockType | LeafType, TO_MARKDOWN_OPTIONS)
    )
    .join("");

  return result;
};
