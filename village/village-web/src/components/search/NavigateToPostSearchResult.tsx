import { NavigateToPostSuggestion } from "../../services/search/Suggestions";
import { UserRecord } from "../../services/store/Users";

export type NavigateToPostSearchResultProps = {
  user: UserRecord;
  suggestion: NavigateToPostSuggestion;
};

export const NavigateToPostSearchResult = (
  props: NavigateToPostSearchResultProps
) => {
  const ownPost = props.user.uid === props.suggestion.authorId;
  if (ownPost) {
    return <div>{props.suggestion.title}</div>;
  } else {
    return (
      <div>
        {props.suggestion.title} by {props.suggestion.authorUsername}
      </div>
    );
  }
};
