import { useState } from "react";
import { EMPTY_RICH_TEXT } from "../components/richtext/Utils";
import { v4 as uuid } from "uuid";
import { UserId } from "../services/store/Users";
import * as log from "loglevel";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";

import {
  UserPost,
  GetGlobalMentionsFn,
  CreatePostFn,
} from "../services/store/Posts";

export const useMentions = (
  getGlobalMentions: GetGlobalMentionsFn,
  createPost: CreatePostFn,
  authorId: UserId
): [
  MentionNodeData[],
  (newSearch: string) => void,
  (option: MentionNodeData) => void
] => {
  const logger = log.getLogger("useMentions");
  const getMentionables = async (
    prefixTitle: string
  ): Promise<MentionNodeData[]> => {
    const posts = await getGlobalMentions(prefixTitle);
    return posts.map((post: UserPost) => {
      return {
        value: post.post.title,
        postId: post.post.id,
        authorId: post.post.authorId,
        authorUsername: post.user.username,
        exists: true,
      };
    });
  };

  const [mentionables, setMentionables] = useState<MentionNodeData[]>([]);
  const [search, setSearch] = useState<string>();

  const onMentionSearchChanged = (newSearch: string) => {
    const updateMentionables = async () => {
      if (search !== newSearch) {
        const newMentionables = await getMentionables(newSearch);
        console.dir(newMentionables);
        // Only insert the search query if it doesnt exist exactly in the results.
        if (newMentionables.find((m) => m.value === newSearch) === undefined) {
          const newMention: MentionNodeData = {
            value: newSearch,
            authorId: authorId,
            postId: uuid(),
            exists: false,
          };
          if (newSearch) {
            newMentionables.splice(0, 0, newMention);
          }
        }

        setMentionables(newMentionables);
        setSearch(newSearch);
      }
    };
    updateMentionables();
  };

  const onMentionAdded = (mention: MentionNodeData) => {
    const addMentionToDatabase = async () => {
      if ("exists" in mention && mention["exists"] === false && !!createPost) {
        logger.debug(`adding mention ${mention.value}`);
        await createPost(mention.value, EMPTY_RICH_TEXT, mention.postId);
      } else {
        logger.debug(`not adding mention ${mention.value}; already exists`);
      }
    };
    addMentionToDatabase();
  };

  return [mentionables, onMentionSearchChanged, onMentionAdded];
};
