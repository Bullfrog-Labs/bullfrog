import React from "react";
import { NotificationsList } from "../components/notifications/NotificationsList";
import { LogEventFn } from "../services/Analytics";
import {
  CurriedByUser,
  useLoggedInUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { GetCursoredActivitiesFromFeedFn } from "../services/store/Activities";

export type NotificationsViewControllerProps = {
  getCursoredActivitiesFromFeed: CurriedByUser<GetCursoredActivitiesFromFeedFn>;
  logEvent: LogEventFn;
};

export const NotificationsViewController = (
  props: NotificationsViewControllerProps
) => {
  const userRecord = useLoggedInUserFromAppAuthContext();
  return (
    <NotificationsList
      getCursoredActivitiesFromFeed={props.getCursoredActivitiesFromFeed(
        userRecord
      )}
      logEvent={props.logEvent}
    />
  );
};
