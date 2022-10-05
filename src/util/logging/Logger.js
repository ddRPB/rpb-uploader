/*
 * This file is part of RadPlanBio
 * 
 * Copyright (C) 2013 - 2022 RPB Team
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */

import LogLevels from "../../constants/LogLevels";

/**
 * Logger component that allows to collect log events on the whole session.
 * The user will be enabled to download a store with all events via UI.
 * It is a work arround, since a central colection of log events from different 
 * clinical networks is difficult in technical and data protection aspects.
 */
export default class Logger {

    constructor(level) {
        this.level = this.getIntLevelByString(level);
        this.logstore = [];
        this.logstoreTwo = [];
    }

    getLogStore() { return this.logstoreTwo };

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

            this.addMessageToFileDownloadLogStore(context, data, message);

            console.log({
                date: new Date(),
                message,
                context,
                data
            });
        }
    }

    /**
     * Currently, the capabilities to stringify JSON object without extra packages is limited.
     * This function is a work arround, where objects will be added stringified to the LogStore.
     */
    addMessageToFileDownloadLogStore(context, data, message) {
        let jsonContext = "";
        try {
            jsonContext = JSON.stringify(context);
        } catch (error) {
            //do nothing
        }

        let jsonData = "";
        try {
            jsonData = JSON.stringify(data);
        } catch (error) {
            //do nothing
        }

        this.logstoreTwo.push({
            date: new Date(),
            message,
            context: jsonContext,
            data: jsonData
        });
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

}