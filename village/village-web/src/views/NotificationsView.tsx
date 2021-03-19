import React from "react";
import { NotificationsList } from "../components/notifications/NotificationsList";
import {
  CurriedByUser,
  useLoggedInUserFromAppAuthContext,
} from "../services/auth/AppAuth";
import { GetCursoredActivitiesFromFeedFn } from "../services/store/Activities";

export type NotificationsViewControllerProps = {
  getCursoredActivitiesFromFeed: CurriedByUser<GetCursoredActivitiesFromFeedFn>;
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
    />
  );
};
