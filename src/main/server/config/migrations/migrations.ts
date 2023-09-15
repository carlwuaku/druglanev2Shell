


require('ts-node/register')

import { Umzug, SequelizeStorage } from 'umzug';
import { migrationsList } from './migrationsList';
import { sequelize } from '../sequelize-config'
import { logger } from '../logger';

const umzug = new Umzug({
  migrations: migrationsList,
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});



// export the type helper exposed by umzug, which will have the `context` argument typed correctly
export type Migration = typeof umzug._types.migration;
export const runMigrations =
  (async () => {
    try {
      await umzug.up();
    } catch (error) {
      logger.error({ message: error });
      throw new Error("Migration error:" + error);

    }


  });