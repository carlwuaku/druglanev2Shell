import * as fs from 'fs';
import { constants } from '../utils/constants';
import { Settings } from '../models/Settings';
//check if the database file exists. if it does, then the app has been validated.
export const isAppActivated = ():boolean => {
    return fs.existsSync(constants.db_path)
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
