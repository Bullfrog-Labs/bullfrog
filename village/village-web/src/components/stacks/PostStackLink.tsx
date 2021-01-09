import React from "react";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { PostTitle } from "../../services/store/Posts";
import LibraryBooksOutlinedIcon from "@material-ui/icons/LibraryBooksOutlined";
import { useGlobalStyles } from "../../styles/styles";

export type PostStackLinkProps = {
  postTitle: PostTitle;
};

export const PostStackLink = (props: PostStackLinkProps) => {
  const globalClasses = useGlobalStyles();
  return (
    <Typography variant="h1">
      <Link
        className={globalClasses.stackLink}
        to={`/stack/${props.postTitle}`}
      >
        <LibraryBooksOutlinedIcon />
      </Link>
    </Typography>
  );
};
