import * as log from "loglevel";
import _ from "lodash";

function toLogLevel(logLevel: string | undefined): log.LogLevelDesc {
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

function configure(log: log.RootLogger) {
  const logLevel = toLogLevel(process.env.REACT_APP_LOG_LEVEL);
  log.setDefaultLevel(logLevel);
  const original = log.methodFactory;
  log.methodFactory = (methodName, logLevel, loggerName) => {
    const applied = original(methodName, logLevel, loggerName);
    return (message) => {
      const padding = 5 - methodName.length + 1;
      applied(
        `${_.toUpper(methodName)}${_.repeat(
          " ",
          padding
        )}: ${loggerName} : ${message}`
      );
    };
  };
  const logger = log.getLogger("Logging");
  logger.info(`Using log level ${logLevel}`);
}

export default {
  configure,
};
