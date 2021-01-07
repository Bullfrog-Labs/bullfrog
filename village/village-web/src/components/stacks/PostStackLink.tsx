import React from "react";
import { Link } from "react-router-dom";
import { PostTitle } from "../../services/store/Posts";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";

export type PostStackLinkProps = {
  postTitle: PostTitle;
};

export const PostStackLink = (props: PostStackLinkProps) => {
  return (
    <Link to={`/stack/${props.postTitle}`}>
      <LibraryBooksOutlinedIcon />
    </Link>
  );
};
