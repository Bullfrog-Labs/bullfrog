import { FunctionComponent } from "react";

export type ConditionalWrapperProps = {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
};

export const ConditionalWrapper: FunctionComponent<ConditionalWrapperProps> = (
  props
) =>
  props.condition ? (
    <>{props.wrapper(props.children)}</>
  ) : (
    <>{props.children}</>
  );
