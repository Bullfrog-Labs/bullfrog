import * as log from "loglevel";
import _ from "lodash";

export function toLogLevel(logLevel: string | undefined): log.LogLevelDesc {
  switch (logLevel) {
    case "TRACE":
    case "DEBUG":
    case "INFO":
    case "WARN":
    case "ERROR":
      return logLevel;
    default:
      return "DEBUG";
  }
}

export function formatLogLine(
  methodName: string,
  loggerName: string,
  message: string
) {
  const padding = 5 - methodName.length + 1;
  return `${_.toUpper(methodName)}${_.repeat(
    " ",
    padding
  )}: ${loggerName} : ${message}`;
}

function configure(log: log.RootLogger) {
  const logLevel = toLogLevel(process.env.REACT_APP_LOG_LEVEL);
  log.setDefaultLevel(logLevel);
  const original = log.methodFactory;
  log.methodFactory = (methodName, logLevel, loggerName) => {
    const applied = original(methodName, logLevel, loggerName);
    return (message) => {
      applied(formatLogLine(methodName, loggerName, message));
    };
  };
  const logger = log.getLogger("Logging");
  logger.info(`Using log level ${logLevel}`);
}

export default {
  configure,
};
