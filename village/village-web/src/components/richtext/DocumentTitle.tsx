import React from "react";
import {
  EditableTypography,
  EditableTypographyProps,
} from "./EditableTypography";

const DocumentTitle = (props: EditableTypographyProps) => {
  return <EditableTypography variant="h4" {...props} />;
};

export default DocumentTitle;
