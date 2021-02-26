import firebase from "firebase";

export const logEvent = (analytics: firebase.analytics.Analytics) => (
  eventName: string,
  parameters?: Object
) => {
  analytics.logEvent(eventName, parameters);
};

export type LogEventFn = ReturnType<typeof logEvent>;

export const setCurrentScreen = (analytics: firebase.analytics.Analytics) => (
  pageName: string
) => {
  analytics.setCurrentScreen(pageName);
};

export type SetCurrentScreenFn = ReturnType<typeof setCurrentScreen>;
