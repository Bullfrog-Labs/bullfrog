import React from "react";
import { Activity } from "../../services/activities/Types";
import { LogEventFn } from "../../services/Analytics";
import { PostFollowNotification } from "./PostFollowNotification";

export type ActivityNotificationMatcherProps = {
  activity: Activity;
  logEvent: LogEventFn;
};

export const ActivityNotificationMatcher = (
  props: ActivityNotificationMatcherProps
) => {
  const verb = props.activity.verb;
  const target = props.activity.target;

  if (verb.type === "follow" && target.type === "post") {
    return (
      <PostFollowNotification
        activity={props.activity}
        logEvent={props.logEvent}
      />
    );
  } else {
    throw new Error(
      `Found unexpected activity type: (verbType: ${verb.type}, targetType: ${target.type})`
    );
  }
};
