import * as typeformEmbed from "@typeform/embed";
import React, { useEffect, useRef } from "react";

interface EmbeddedTypeformProps {
  link: string;
  hideFooter?: boolean;
  hideHeaders?: boolean;
  opacity?: number;
}

export const EmbeddedTypeform: React.FunctionComponent<EmbeddedTypeformProps> = ({
  link,
  hideFooter = true,
  hideHeaders = true,
  opacity = 90,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      typeformEmbed.makeWidget(elementRef.current, link, {
        hideFooter,
        hideHeaders,
        opacity,
      });
    }
  }, [link, hideFooter, hideHeaders, opacity, elementRef]);

  return (
    <div
      ref={elementRef}
      style={{
        margin: "0",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: "fixed",
      }}
    />
  );
};

interface TypeformViewProps {}

export const TypeformView: React.FunctionComponent<TypeformViewProps> = ({}) => {
  return (
    <EmbeddedTypeform link="https://c4u762321zs.typeform.com/to/ZCup330f" />
  );
};