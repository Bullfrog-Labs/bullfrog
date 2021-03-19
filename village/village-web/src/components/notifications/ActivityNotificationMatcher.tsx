import React from "react";
import { Activity } from "../../services/activities/Types";
import { PostFollowNotification } from "./PostFollowNotification";

export type ActivityNotificationMatcherProps = {
  activity: Activity;
};

export const ActivityNotificationMatcher = (
  props: ActivityNotificationMatcherProps
) => {
  const verb = props.activity.verb;
  const target = props.activity.target;

  if (verb.type === "follow" && target.type === "post") {
    return <PostFollowNotification activity={props.activity} />;
  } else {
    throw new Error(
      `Found unexpected activity type: (verbType: ${verb.type}, targetType: ${target.type})`
    );
  }
};
