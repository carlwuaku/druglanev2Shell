import { constants } from "@/utils/constants";
import { logger } from "@/app/config/logger";
import * as fs from 'fs';

const folders = [constants.backup_folder,
constants.internal_backups_path,
constants.backup_temp_location]
export const runFolderCreation = () =>
    folders.forEach(folder => {
        //create folder for backups 
        if (!fs.existsSync(folder)) fs.mkdir(folder, function (err) {
            if (err) {
                console.log('folder not created', err)
                logger.error({ message: err });
            }
            else {
                // console.log('folder created')
            }
        });
    })