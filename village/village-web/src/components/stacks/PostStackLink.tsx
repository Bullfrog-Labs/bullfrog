import React from "react";
import { Link } from "react-router-dom";
import { PostTitle } from "../../services/store/Posts";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";

export type PostStackLinkProps = {
  postTitle: PostTitle;
};

export const PostStackLink = (props: PostStackLinkProps) => {
  return (
    <div>
      <Link to={`/stack/${props.postTitle}`}>
        <LibraryBooksIcon />
      </Link>
    </div>
  );
};
