import { exec } from 'child_process';
import { config } from '../server/config/config';
import { constants } from './constants';
import { logger } from './logger';

const dbConfig = config[process.env.NODE_ENV!];
// 1819719
const dbName = dbConfig.database;
const backupFileName = `${constants.internal_backups_path}/backup_${Date.now()}.sql`;

export function runBackup(){
exec(`mariadb-dump -u ${dbConfig.username} -p${dbConfig.password} ${dbName} > ${backupFileName}`, (error, stdout, stderr) => {
  if (error) {
    logger.error(`Backup failed: ${error.message}`);
    throw error;
  }
  logger.info('Backup created successfully');
});
}
