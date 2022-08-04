import LogLevels from "../../constants/LogLevels";

export default class Logger {

    constructor(level) {
        this.level = this.getIntLevelByString(level);
        this.logstore = [];
    }

    trace(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.TRACE, message, context, data);
    }

    debug(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.DEBUG, message, context, data);
    }

    info(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.INFO, message, context, data);
    }

    warn(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.WARN, message, context, data);
    }

    error(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.ERROR, message, context, data);
    }

    fatal(message, context, data) {
        if (context === undefined) {
            context = {}
        }
        if (data === undefined) {
            data = {}
        }
        this.addLog(LogLevels.FATAL, message, context, data);
    }

    addLog(level, message, context, data) {
        if (this.level <= this.getIntLevelByString(level)) {
            context.level = level;
            this.logstore.push({
                date: new Date(),
                message,
                context,
                data
            });
            console.log({
                date: new Date(),
                message,
                context,
                data
            });
        }
    }

    getIntLevelByString(level) {
        switch (level) {
            case LogLevels.TRACE:
                return 10;
                break;
            case LogLevels.DEBUG:
                return 20;
                break;
            case LogLevels.INFO:
                return 30;
                break;
            case LogLevels.WARN:
                return 40;
                break;
            case LogLevels.ERROR:
                return 50;
                break;
            case LogLevels.FATAL:
                return 60;
                break;
            default:
                return 50;
                break;
        }
    }



    // { "context": { "logLevel": 10 }, "message": "foo", "sequence": "0", "time": 1506776210000, "version": "2.0.0" }
}