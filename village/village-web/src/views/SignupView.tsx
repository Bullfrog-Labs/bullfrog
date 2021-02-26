import React from "react";
import { Helmet } from "react-helmet";

interface SignupViewProps {}

export const SignupView: React.FunctionComponent<SignupViewProps> = (
  props = {}
) => {
  return (
    <>
      <Helmet>
        <title>Sign up for Village</title>
        <meta
          property="og:url"
          content="https://villageink.lpages.co/village-signup/"
        />
        <link
          rel="opengraph"
          href="https://villageink.lpages.co/village-signup/"
        />
        <script src="//villageink.lpages.co/_/js/village-signup/"></script>
      </Helmet>
    </>
  );
};
