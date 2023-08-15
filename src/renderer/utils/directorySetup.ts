/* eslint-disable prettier/prettier */
/* eslint-disable import/prefer-default-export */
/* eslint-disable prettier/prettier */
import * as fs from 'fs';
import { logger } from '../config/logger';
import { constants } from './constants';

const folders = [
  constants.backup_folder,
  constants.internal_backups_path,
  constants.backup_temp_location,
];
export const runFolderCreation = () =>
  folders.forEach((folder) => {
    if (!fs.existsSync(folder))
      fs.mkdir(folder, function (err) {
        if (err) {
          console.log('folder not created', err);
          logger.error({ message: err });
        } else {
          // console.log('folder created')
        }
      });
  });
