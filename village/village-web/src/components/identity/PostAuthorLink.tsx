import React from "react";
import { Link } from "react-router-dom";

export type PostAuthorLinkProps = {
  uid: string;
  username: string;
};

export const PostAuthorLink = (props: PostAuthorLinkProps) => {
  return (
    <div>
      by <Link to={`/profile/${props.uid}`}>{props.username}</Link>
    </div>
  );
};
