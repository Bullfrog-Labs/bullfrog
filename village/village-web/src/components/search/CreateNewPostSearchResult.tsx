import { PostTitle } from "../../services/store/Posts";

export type CreateNewPostSearchResultProps = {
  title: PostTitle;
};

export const CreateNewPostSearchResult = (
  props: CreateNewPostSearchResultProps
) => <div>Create new post: {props.title}</div>;
