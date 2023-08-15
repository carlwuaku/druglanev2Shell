/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */
// import path from 'path';
// import * as winston from 'winston';
// import { constants } from '../utils/electronConstants';
// import { getToday } from '../utils/dateHelper';

// const defaultFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.align(),
//   winston.format.printf(
//     (info:any) => `${info.level}: ${[info.timestamp]}: ${info.message}`
//   )
// );

const logger = {
  info: (message:any) =>{console.log(message);},
  error: (message:any) => {console.error(message);}
};

// winston.createLogger({
//   transports: [
//     //
//     // - Write all logs with importance level of `error` or less to `error.log`
//     // - Write all logs with importance level of `info` or less to `combined.log`
//     //
//     new winston.transports.File({
//       filename: path.resolve(
//         constants.settings_location,
//         'logs',
//         'ui',
//         `${getToday()} debug.log`
//       ),
//       level: 'debug',
//       format: defaultFormat,
//     }),
//     new winston.transports.File({
//       filename: path.resolve(
//         constants.settings_location,
//         'logs',
//         'ui',
//         `${getToday()} info.log`
//       ),
//       level: 'info',
//       format: defaultFormat,
//     }),
//     new winston.transports.File({
//       filename: path.resolve(
//         constants.settings_location,
//         'logs',
//         'ui',
//         `${getToday()} error.log`
//       ),
//       level: 'error',
//       format: defaultFormat,
//     }),
//   ],
// });

// //
// // If we're not in production then log to the `console` with the format:
// // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// //
// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new winston.transports.Console({
//       format: defaultFormat,
//     })
//   );
// }

export { logger };
