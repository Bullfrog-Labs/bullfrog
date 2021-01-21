import React from "react";
import { Link } from "react-router-dom";
import { profileURL } from "../../routing/URLs";
import { UserRecord } from "../../services/store/Users";
import { useGlobalStyles } from "../../styles/styles";

export type PostAuthorLinkProps = {
  viewer: UserRecord;
  author: UserRecord;
};

export const PostAuthorLink = (props: PostAuthorLinkProps) => {
  const userIsAuthor = props.viewer.uid === props.author.uid;
  const globalClasses = useGlobalStyles();

  return (
    <div>
      by{" "}
      <Link
        className={globalClasses.link}
        to={profileURL(props.author.username)}
      >
        {userIsAuthor ? "you" : props.author.username}
      </Link>
    </div>
  );
};
