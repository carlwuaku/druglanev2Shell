import { logger } from './logger';
import { constants } from '../utils/constants'
import dayjs from 'dayjs';
const timeZoneOffset = dayjs().utcOffset()
console.log(timeZoneOffset)

const timeZoneOffsetMinutes = new Date().getTimezoneOffset();
const timeZoneOffsetHours = -timeZoneOffsetMinutes / 60;

export const sqliteConfig: {[key:string]: any}= {
    "development": {
        "dialect": "sqlite",
        "storage": constants.db_path,
        logging: (msg: any) => logger.debug(msg),
    },
    "test": {
        "dialect": "sqlite",
        "storage": "test_db.db",
        "logging": false
        // logging: (msg: any) => logger.debug(msg),
    },
    "production": {
        "dialect": "sqlite",
        "storage": constants.db_path,
        logging: (msg: any) => logger.debug(msg),
    }
}

export const config: { [key: string]: any } = {
    "development": {
        host: "127.0.0.1",
        dialect: "mariadb",
        username: "root",
        password: "r00t1",
        database: "druglaneDev",
        logging: (msg: any) => logger.debug(msg),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        port: 3307,
        dialectModule: require('mariadb'),
    },
    "test": {
        host: "127.0.0.1",
        dialect: "mariadb",
        username: "root",
        password: "r00t1",
        database: "test",
        "logging": false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dialectOptions: { // for reading
            useUTC: false,
            timezone: "Etc/GMT+1",
        },

        // logging: (msg: any) => logger.debug(msg),
    },
    "production": {
        host: "127.0.0.1",
        dialect: "mariadb",
        username: "root",
        password: "r00t",
        database: "druglane",
        logging: (msg: any) => logger.debug(msg),
        dialectModule: require('mariadb'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone

    }
}
