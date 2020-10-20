import { StructureMode } from "../Types";
import { makeStyles } from "@material-ui/core";
import React, { FunctionComponent } from "react";

// TODO: Move the colors into a theme
const useStyles = makeStyles((theme) => ({
  structureBoxOutline: {
    backgroundColor: (props: StructuralBoxProps) => {
      if (props.selected) {
        return "#C4FFF9";
      } else {
        return "#FFFFFF";
      }
    },
    borderLeftWidth: "thick",
    borderLeftColor: (props: StructuralBoxProps) =>
      props.selected ? "#07BEB8" : "gainsboro",
    borderLeftStyle: "solid",
    borderLeftRadius: "4px",
    padding: "4px",
    marginTop: "0px",
    marginBottom: "1px",
  },
  structureBox: {},
}));

type StructuralBoxProps = {
  structureMode: StructureMode;
  selected: boolean;
};

export const StructuralBox: FunctionComponent<StructuralBoxProps> = (props) => {
  const { structureMode, children } = props;
  const classes = useStyles(props);

  const className =
    structureMode === "outline-mode"
      ? classes.structureBoxOutline
      : classes.structureBox;

  return <div className={className}>{children}</div>;
};
