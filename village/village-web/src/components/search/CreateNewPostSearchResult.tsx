import { PostTitle } from "../../services/store/Posts";

export const getCreateNewPostPrompt = (title: PostTitle) =>
  `Create new post: ${title}`;

export type CreateNewPostSearchResultProps = {
  title: PostTitle;
};

export const CreateNewPostSearchResult = (
  props: CreateNewPostSearchResultProps
) => <div>{getCreateNewPostPrompt(props.title)}</div>;
