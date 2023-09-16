import { config } from './config';
import { Sequelize } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize';

const dbConfig = config[process.env.NODE_ENV!];



// Initialize Sequelize with your MariaDB connection details
const sequelize = new Sequelize({
  dialect: dbConfig.dialect,
  host: 'localhost',         // Replace with your MariaDB host
  port: dbConfig.port,                // Replace with your MariaDB port
  username: dbConfig.username, // Replace with your MariaDB username
  password: dbConfig.password, // Replace with your MariaDB password
});

// Function to check if the database exists
export async function checkDatabaseExists():Promise<boolean> {
  try {
    const results = await sequelize.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = :dbName`, {
    replacements: { dbName: dbConfig.database }, // Replace with your desired database name
    type: QueryTypes.SELECT,
  });

  return results.length > 0;
  } catch (error) {
    throw `Error checking if database exists: ${error}`
  }

}

export async function createDatabase():Promise<void>{
  try {
    await sequelize.query(`CREATE DATABASE ${dbConfig.database}`); // Replace with your desired database name
      console.log('Database created successfully');
  } catch (error) {
    throw `Error creating database exists: ${error}`
  }

}

