function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value
    });
}

define("ERROR", "ERROR");
define("WARN", "WARN");
define("INFO", "INFO");
define("VERBOSE", "VERBOSE");
define("DEBUG", "DEBUG");
define("SILLY", "SILLY");

define("ERRORPRIO", 0);
define("WARNPRIO", 1);
define("INFOPRIO", 2);
define("VERBOSEPRIO", 3);
define("DEBUGPRIO", 4);
define("SILLYPRIO", 5);

define("LOGEVENT", "LogEvent");
define("LEVEL", "level");
define("INSTANCE", "instance");

define("URLINSTANCEID", 'http://169.254.169.254/latest/meta-data/instance-id');
define("DEFAULTNAMESPACE", 'NameSpaceAWSDefault');

define("LEVELSWINSTON", ['error', 'warn', 'info', 'verbose', 'silly']);