import React from "react";
import {
  EditableTypography,
  EditableTypographyProps,
} from "./EditableTypography";

export const DocumentTitle = (props: EditableTypographyProps) => {
  return <EditableTypography variant="h1" {...props} />;
};
