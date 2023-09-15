import { constants } from '../utils/constants';
import { Settings } from '../models/Settings';
import * as fs from 'fs'; // For reading the JWT from a file
import * as jwt from 'jsonwebtoken';
import Store from "electron-store";
import { LICENSE_KEY, SECRET_KEY } from '../utils/stringKeys';
import { logger } from './logger';
import { dialog } from 'electron';
import { getData } from '../utils/network';
import { sequelize } from './sequelize-config';
const store = new Store();


//check if the activationKey exists in store. if it does, then the app has been validated.
export const isAppActivated = ():boolean => {
    try {
      logger.info("checking activation...")
    // Read the JWT from a file (you can use your preferred method of storage)
    const token:any = store.get(LICENSE_KEY);
    if(!token){
      logger.error("no activation token found")
      return false;
    }
    const secretKey:any = store.get(SECRET_KEY);
    if(!secretKey){
      logger.error("no activation secret key found")
      return false;
    }
    // Verify the JWT's signature using the secret key
    jwt.verify(token, secretKey);
    logger.info("activation verified successfully")
    // If verification succeeds, the JWT is valid
    return true;
  } catch (error:any) {
    logger.error(`"activation failed": ${error.message}`);
    dialog.showErrorBox("System error", error.message)
    // Verification failed or JWT doesn't exist
    return false;
  }
}

/**
 * checks the database if the company details have been set
 * @returns {boolean}
 */
export async function isCompanySet(): Promise<boolean>{
    //get a connection to the database
    const setting = await Settings.findOne({
        where: {
            'name': 'company_id'
        }
    });
    if (setting == null) {
        return false;
    }
    //check if the actual value exists and is a valid number
    return isValidInt(setting.value) ;
}


/**
 * check the database if the admin password is set
 * @returns {boolean}
 */
export async function isAdminPasswordSet(): Promise<boolean>{
    const setting = await Settings.findOne({
        where: {
            'name': 'admin_password'
        }
    });
    if (setting == null) {
        return false;
    }
    //check if the actual value exists and is a valid string
    return setting.value.trim().length > 0;
}

export function isValidInt(value:any): boolean{
    return value != null && Number.isInteger(value);

}

export async function verifyLicenseKey(key: string):Promise<any> {

    try {
        console.log("calling verify license")

        return getData({url: `${constants.server_url}/api_admin/findBranchByKey?k=${key}`, token: ""})

    } catch (error: any) {
        console.log("verify key", error)
        logger.error({ message: error })
        throw new Error(error)

    }

}

export async function activateApplication(data: any):Promise<any> {

    try {
      const secretKey:any = store.get(SECRET_KEY);
       const jwtToken= jwt.sign(data, secretKey);
       store.set(LICENSE_KEY, jwtToken);
      console.log('secret', jwtToken)

    } catch (error: any) {
        console.log("verify key", error)
        logger.error({ message: error })
        throw new Error(error)

    }

}

export function setSecretKey(key:string){
  store.set(SECRET_KEY, key);
}

export async function testConnection():Promise<void>{
  try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error:any) {
  throw error;

}
}
