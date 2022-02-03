import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
   const isDevelopment = env === 'development'
  return isDevelopment ? 'info' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'white'
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.message}`,
  ),
)

const transports = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxFiles: 5242880, 
    maxsize: 5
  }),
  new winston.transports.File({ filename: 'logs/log.log', maxFiles: 5, maxsize: 5242880  }),
]

export const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})
// addConsoleTransports();
// setLogLevel('debug');

export function addConsoleTransports() {
  Logger.add(new winston.transports.Console({ format: winston.format.combine(
    winston.format.colorize({
        all: true
    })) }));
}

export function setLogLevel(level: string) {
  Logger.level = level;
}

const testRunTransports = [
  new winston.transports.File({ filename: `logs/testrun_${new Date().toISOString()}_deveui_region.log`, maxFiles: 5, maxsize: 5242880  }),
]

export const TestRunLogger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports: testRunTransports
})