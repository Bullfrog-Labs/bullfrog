import React, { ReactNode } from "react";
import { useGlobalStyles } from "../styles/styles";

export const Blockquote = (props: {
  children?: ReactNode;
  className?: string;
}) => {
  const classes = useGlobalStyles();

  let className = classes.blockquote;
  if (props.className) {
    className = props.className;
  }

  return (
    <blockquote className={`${className} ${classes.alwaysBreakWord}`}>
      {props.children}
    </blockquote>
  );
};
