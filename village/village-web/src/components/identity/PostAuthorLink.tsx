import React from "react";
import { Link } from "react-router-dom";
import { UserRecord } from "../../services/store/Users";

export type PostAuthorLinkProps = {
  viewer: UserRecord;
  author: UserRecord;
};

export const PostAuthorLink = (props: PostAuthorLinkProps) => {
  const userIsAuthor = props.viewer.uid === props.author.uid;

  return (
    <div>
      by{" "}
      <Link to={`/profile/${props.author.uid}`}>
        {userIsAuthor ? "you" : props.author.username}
      </Link>
    </div>
  );
};
