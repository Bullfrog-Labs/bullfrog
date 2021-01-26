import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";
import { UserRecord } from "../services/store/Users";
import * as log from "loglevel";
import { MentionNodeData } from "@blfrg.xyz/slate-plugins";

import {
  UserPost,
  GetAllPostsByTitlePrefixFn,
  CreatePostFn,
} from "../services/store/Posts";

export const useMentions = (
  getGlobalMentions: GetAllPostsByTitlePrefixFn,
  createPost: CreatePostFn,
  author: UserRecord
): [
  MentionNodeData[],
  (newSearch: string) => void,
  (option: MentionNodeData) => void
] => {
  const logger = log.getLogger("useMentions");
  const getMentionables = useCallback(
    async (prefixTitle: string): Promise<MentionNodeData[]> => {
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
    },
    [getGlobalMentions]
  );

  const [mentionables, setMentionables] = useState<MentionNodeData[]>([]);
  const [search, setSearch] = useState<string>();

  const onMentionSearchChanged = useCallback(
    (newSearch: string) => {
      const updateMentionables = async () => {
        if (search !== newSearch) {
          const newMentionables = await getMentionables(newSearch);
          // Only insert the search query if it doesnt exist exactly in the results.
          const ownPostExists =
            newMentionables.find((m) => {
              return m.value === newSearch && m.authorId === author.uid;
            }) === undefined;
          if (ownPostExists) {
            const newMention: MentionNodeData = {
              value: newSearch,
              authorId: author.uid,
              authorUsername: author.username,
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
    },
    [author.uid, author.username, getMentionables, search]
  );

  const onMentionAdded = useCallback(
    (mention: MentionNodeData) => {
      const addMentionToDatabase = async () => {
        if (
          "exists" in mention &&
          mention["exists"] === false &&
          !!createPost
        ) {
          logger.debug(`adding mention ${mention.value}`);
          await createPost(mention.value, mention.postId);
        } else {
          logger.debug(`not adding mention ${mention.value}; already exists`);
        }
      };
      addMentionToDatabase();
    },
    [createPost, logger]
  );

  return [mentionables, onMentionSearchChanged, onMentionAdded];
};
