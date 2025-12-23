/**
 * Logger Utility
 * Wrapper around console methods that respects environment
 * In production, only errors are logged
 */

const isDevelopment = process.env.NODE_ENV === 'development' || 
                      import.meta?.env?.DEV || 
                      !process.env.NODE_ENV;

class Logger {
  log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  info(...args) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  error(...args) {
    // Always log errors, even in production
    console.error(...args);
  }

  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  table(...args) {
    if (isDevelopment) {
      console.table(...args);
    }
  }

  group(label) {
    if (isDevelopment) {
      console.group(label);
    }
  }

  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }
}

export default new Logger();
