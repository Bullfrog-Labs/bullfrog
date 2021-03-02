import firebase from "firebase";
import * as log from "loglevel";

export const logEvent = (analytics: firebase.analytics.Analytics) => (
  eventName: string,
  parameters?: Object
) => {
  const logger = log.getLogger("logEvent");
  logger.debug(`logging event ${eventName} ${JSON.stringify(parameters)}`);
  analytics.logEvent(eventName, parameters);
};

export type LogEventFn = ReturnType<typeof logEvent>;

export const setCurrentScreen = (analytics: firebase.analytics.Analytics) => (
  pageName: string
) => {
  analytics.setCurrentScreen(pageName);
};

export type SetCurrentScreenFn = ReturnType<typeof setCurrentScreen>;
