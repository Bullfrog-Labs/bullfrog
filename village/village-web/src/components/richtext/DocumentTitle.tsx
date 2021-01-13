import React, { forwardRef } from "react";
import {
  EditableTypography,
  EditableTypographyImperativeHandle,
  EditableTypographyProps,
} from "./EditableTypography";

export const DocumentTitle = forwardRef<
  EditableTypographyImperativeHandle,
  EditableTypographyProps
>((props, ref) => {
  return <EditableTypography variant="h1" ref={ref} {...props} />;
});
