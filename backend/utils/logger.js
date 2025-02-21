import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to Winston
winston.addColors(colors);

// Custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports to use based on environment
const transports = [
  // Always write to console
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // Write all logs with level 'error' and below to error.log
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error'
  }),
  
  // Write all logs to combined.log
  new winston.transports.File({
    filename: path.join('logs', 'combined.log')
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  // Don't exit on uncaught errors
  exitOnError: false
});

// Create a stream object for Morgan middleware
const stream = {
  write: (message) => logger.http(message.trim())
};

export {logger,stream};