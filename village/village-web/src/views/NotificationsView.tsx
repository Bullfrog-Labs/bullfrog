import React from "react";
import { NotificationsList } from "../components/notifications/NotificationsList";

export type NotificationsViewControllerProps = {};

export const NotificationsViewController = (
  props: NotificationsViewControllerProps
) => {
  return <NotificationsList />;
};
