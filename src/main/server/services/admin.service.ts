/**
 * This contains the logic for all the functionalities in the staffcontroller. also used in the
 * firebase functions. all functions must be async, and throw errors if necessary
 */
import { constants } from '../utils/constants'
import path from 'path';
import { Users } from '../models/Users';
import { Roles } from '../models/Roles';
import { Settings } from '../models/Settings';
import { Activities } from '../models/Activities';
import { Branches } from '../models/Branches';
import { UserSessions } from '../models/UserSessions';
import { logger } from '../config/logger'
import { InsuranceProviders } from '../models/InsuranceProviders';
import { Op, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs'
import { Permissions } from '../models/Permissions';
import { RolePermissions } from '../models/RolePermissions';
import {configKeys, errorMessages, infoMessages, moduleNames} from '../helpers/stringHelpers'
import { SettingsTransfer } from '../interfaces/settingsTransferInterface';
import crypto from 'crypto'
import { Tokens } from '../models/Tokens';
import { sendEmail } from '../utils/network'

// const path = require('path')

// const ActivitiesHelper = require('../helpers/activitiesHelper');

// const AdminHelper = require('../helpers/adminHelper');
// // const { default: rebuild } = require('electron-rebuild');
// const helper = new AdminHelper();
// const activitiesHelper = new ActivitiesHelper()

// const CustomerHelper = require('../helpers/customerHelper.js');
// const customerHelper = new CustomerHelper();



/**
 * Verify a username and password and log the user in if correct
 * @param {ReturnData} data the object containing data. typically will be _data or _data
 */
export async function login_function(data: { username: any; password: any; }): Promise<Users> {
    let username = data.username;
    let password = data.password;
    try {

        let user = await Users.findOne({
            where: {
                username: username,
            },
            include: [Roles]
        });
        let password_valid: boolean = false;
        if (user && user.password_hash) {
            //username was found. compare the password
            password_valid = bcrypt.compareSync(password, user.password_hash);
        }

        if (!user || !password_valid) {
            throw new Error(errorMessages.USER_NOT_FOUND)

        }
        //user is valid

        const now = new Date();
        let hash = bcrypt.hashSync(username + now, 10);
        let expires = now.getDate() + 3;
        let session_obj = { user_id: user.id, token: `${hash}`, expires: `${expires}` }
        UserSessions.create(session_obj)

        user.token = hash;
        user.role = user.role_id;
        // user.permissions = await helper.getRolePermissions(user.role_id, 'strings');
        // let settings = await Settings.findAll();


        user.type = "staff";
         Activities.create({
            activity: ` ${user.display_name} ${infoMessages.LOGGED_IN}`,
            user_id: user.id,
            module: 'System'
        })

        return user;
    } catch (error: any) {
        //if the error is "user not found", rethrow it. else if it's some other error, log it
        if (error instanceof Error) {
            logger.error({message:error})
            throw new Error(error.message)
        }
        else {
            throw new Error(error);

        }


    }
}

export async function server_admin_login_function(data: {  password: string; }): Promise<string> {
    let password = data.password;
    try {

        let settings = await Settings.findOne({
            where: {
                name: "admin_password",
            }
        });
        let password_valid: boolean = false;
        if (settings && settings.value) {
            //username was found. compare the password
            password_valid = bcrypt.compareSync(password, settings.value);
        }

        if (!password_valid) {
            throw new Error(errorMessages.PASSWORD_INCORRECT)

        }
        //user is valid

        const now = new Date();
        const hash = bcrypt.hashSync(configKeys.ADMIN_PASSWORD_SALT + now, 10);

        await Settings.update({
            value: hash
        }, {
            where: {
                name: 'admin_password_token'
            }
        })


        Activities.create({
            activity: ` server admin ${infoMessages.LOGGED_IN}`,
            user_id: '',
            module: 'System'
        })

        return hash;
    } catch (error: any) {
        //if the error is "user not found", rethrow it. else if it's some other error, log it
        if (error instanceof Error) {
            const serializedError = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };

            logger.error({ message: serializedError });
            throw new Error(error.message);

        }
        else {
            throw new Error(error);

        }


    }
}


/**
 * get the branches of the facility
 * @returns {Object}
 */
export async function get_branches_function(): Promise<Branches[]> {
    try {
        let query = await Branches.findAll();
        return query;

    } catch (error: any) {
        logger.error({message:error})
        throw new Error(errorMessages.ERROR_GETTING_BRANCHES)
    }
}


/**
 * get the logo of the facility
 * @returns {Promise<ReturnData>}
 */
export async function get_logo_function(): Promise<string> {
    try {
        const fs = require('fs');
        let logo = await Settings.findOne({
            where: {
                'name': "logo"
            }
        });//null or string (filenam.jpg for instance)

        let image = "";
        if (logo) {
            //get the extension. it will be the last item in the array if split by a dot (.)
            let split = logo.value.split(".");
            let extension =  split.pop()
            image = `data:image/${extension};base64,` + fs.readFileSync(path.join(constants.settings_location, logo.value), 'base64');

        }

        return image

    } catch (error: any) {
        logger.error({message:error})
        throw new Error(errorMessages.ERROR_GETTING_LOGO)
    }
}

export async function getSettings(_data?: { settings: string[] }): Promise<SettingsTransfer> {
    try {
        let data = await Settings.findAll(
            {
                where: _data && _data.settings ? { name: { [Op.in]: _data.settings } } : {}
            }
        );
        let returnData:any = {};
        data.forEach(setting => {
            returnData[setting.name] = setting.value;
        });
        return returnData;
    } catch (error: any) {
        logger.error({ message: error})
        throw new Error(errorMessages.ERROR_GETTING_SETTINGS)
    }

}

/**
 * update settings
 * @param _data the setting names and their new values
 */
export async function saveSettings(_data: {[key:string]: any}): Promise<string[]>{
    try {
        const results: string[] = [];
        for (const key in _data) {
            let value = _data[key];
            //each key should be in the settings as a name
            //for the admin password, encrypt it
            if (key === "admin_password") {
                let hash = bcrypt.hashSync(_data.admin_password, 10);
                // console.log(hash)
                value = `${hash}`;
            }
            try {

                await Settings.upsert(
                    { value: value, name: key, module: "System" }
                )
            } catch (error) {
                results.push(`settings key ${key} not updated . ${error}`)
            }
        }
        // let data = await Settings.update(
        // );
        return results
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(errorMessages.ERROR_SAVING_SETTINGS)
    }
}


/**
 * insert a new branch
 * @param {Object} _data object containing data
 * @returns {Object}
 */
export async function save_branch_function(_data: { [key: string]: any}): Promise<Branches> {
    try {
        let data = {
            name: `'${_data.name}'`,
            phone: `'${_data.phone}'`
        }
        let branch = await Branches.create(data)
         Activities.create({
            activity: infoMessages.CREATED_NEW_BRANCH,
            user_id: _data.user_id,
            module: moduleNames.SYSTEM
        })
        return branch;
    } catch (error: any) {
        logger.error({message:error})
        throw new Error(errorMessages.ERROR_CREATING_BRANCH)
    }
}

/**
 * get all insurers
 * @returns {Promise<InsuranceProviders[]>} an array of InsuranceProviders
 */
export async function get_insurers_function(): Promise<InsuranceProviders[]> {
    try {
        let insurers = await InsuranceProviders.findAll();
        return insurers
    } catch (error: any) {
        logger.error({message:error})
        throw new Error(errorMessages.ERROR_GETTING_INSURERS)

    }
}



/**
 * add a new insurance provider
 * @param _data an object containing the name of the insurance provider
 */
export async function add_insurer_function(_data: { [key: string]: any}): Promise<InsuranceProviders> {
    try {
        let data = { name: `'${_data.name}'` }
        let insuranceProvider = await InsuranceProviders.create(data);
         Activities.create({
            activity: 'created a new branch',
            user_id: _data.user_id,
            module: 'System'
        })
        return insuranceProvider
    } catch (error: any) {
        logger.error({message:error})
        throw new Error("Error creating insurer")
    }
};

/**
 * soft delete an insuranceprovider
 * @param _data {id:string}
 * @returns {Promise<ReturnData>}
 */
export async function delete_insurer_function(_data: { [key: string]: any}): Promise<boolean> {
    //split the id or name into an array
    const ids = _data.id.split(",");
    try {
        //delete where name in (param) or id in para
        await InsuranceProviders.destroy({
            where: {
                [Op.or]: [
                    {
                        id: { [Op.in]: ids }
                    },
                    {
                        name: { [Op.in]: ids }
                    }
                ]
            }
        })
        return true
    } catch (error: any) {
        logger.error({message:error})
        throw new Error("Error deleting insurer")
    }
};

/**
 *
 * @param _data {
    offset: number; limit: number;
    start_date: string; end_date: string;
}
 * @returns
 */
export async function get_all_activities_function(_data: {
    offset: number; limit: number;
    start_date: string; end_date: string;
}): Promise<Activities[]> {
    let offset = _data.offset == undefined ? 0 : _data.offset;
    let limit = _data.limit == undefined ? 100 : _data.limit;
    let start = _data.start_date == undefined ? null : _data.start_date;
    let end = _data.end_date == undefined ? null : _data.end_date;

    try {
        let objects;
        if (start == null) {
            objects = await Activities.findAll(
                {
                    limit: limit,
                    offset: offset,
                    raw: true
                }
            );
        }
        else {
            objects = await Activities.findAll({
                where: {
                    created_on: {
                        [Op.and]: {
                            [Op.gte]: `${start} 00:00:00`,
                            [Op.lte]: `${end} 23:59:59`
                        }
                    },
                },
                raw: true
            })

        }

        // for (let  i = 0; i < objects.length; i++) {
        //     let  obj = objects[i];
        //     obj.user = await helper.getItem(` id = ${obj.user_id} `, helper.table_name)

        // }
        //console.log(objects)
        return objects
    } catch (error: any) {
        logger.error({message:error})
        throw new Error("Error getting activities")
    }

};


/**
 * get the list of activities related to some object
 * @param _data
 * @returns a list of activities
 */
export async function get_activities_function(_data: { [key: string]: any}): Promise<Activities[]> {
    let reg = _data.r;//this would be the id or unique identifier of an object
    let offset = _data.offset == undefined ? 0 : parseInt(_data.offset);
    let limit = _data.limit|| parseInt(_data.limit);
    try {
        let objects = await Activities.findAll({
            where: {
                object_id: reg
            },
            limit: limit,
            offset: offset,
            include: {
                model: Users,
                as: 'user'
            }
        })


        return objects
    } catch (error: any) {
        logger.error({message:error})
        throw new Error("Error getting Activities")
    }

};

/**
 * get the list of activities for a specified user
 * @param _data
 * @returns {Promise<Activities[]>} a list of activities
 */
export async function get_user_activities_function(_data: { [key: string]: any}): Promise<Activities[]> {
    let offset = _data.offset == undefined ? 0 :parseInt(_data.offset);
    let limit = _data.limit == undefined ? 100 : parseInt(_data.limit);

    let start = _data.start_date == undefined ? null : _data.start_date;
    let end = _data.end_date == undefined ? null : _data.end_date;

    try {
        let where: { [key: string]: any } = {
            user_id: _data.id
        };
        if (start != null) {
            where["created_on"] = {
                [Op.and]: [`${start} 00:00:00`, `${end} 23:59:59`]
            };
        }
        // let where = start == null ? `user_id = ${reg}` : ` user_id = ${reg} and created_on >= '${start} 00:00:00' and created_on <= '${end} 23:59:59'`;
        // let objects = await activitiesHelper.getMany(where, activitiesHelper.table_name, limit, offset);
        let objects = await Activities.findAll({
            where: where,
            limit: limit,
            offset: offset,
            raw: true
        });

        // let total = await Activities.count({
        //     where: where
        // })
        // for (let  i = 0; i < objects.length; i++) {
        //     let  obj = objects[i];
        //     obj.user = await helper.getItem(` id = ${obj.user_id} `, helper.table_name)

        // }

        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error("Error getting Activities")
    }

};

/**
 * get the list of users
 * @param _data
 * @returns {Promise<Users>} a list of users
 */
export async function get_users_function(_data: { [key: string]: any}): Promise<Users[]> {
    try {

        let offset = _data.offset == undefined ? 0 : parseInt(_data.offset);
        let limit = _data.limit == undefined ? 100 : parseInt(_data.limit);
        let objects = await Users.findAll({
            limit: limit,
            offset: offset,
            include: {
                model: Roles
            },
            raw: true
        });

        return objects
    } catch (error: any) {
        // console.log(error)

        logger.error({ message: error })
        throw new Error("Error getting users")
    }
};



/**
 * add a user to the database
 * @param _data
 * @returns {Promise<Users>} an instance of the saved user
 */
export async function save_user_function(_data: { [key: string]: any }): Promise<Users> {
    try {

        const id = _data.id;
        const updatePassword = _data.updatePassword;//in an edit we want the user to choose
        //whether to update the password or not
        let user = null;
        if (id) {
           user = await Users.findByPk(_data.id)
        }
        //update. else insert
        let password = _data.password;
        //console.log(password)
        if (!id || updatePassword === "yes") {
            if (password !== undefined && password !== null && password != "undefined") {
                let hash = bcrypt.hashSync(password, 10);
                // console.log(hash)
                _data.password_hash = `${hash}`;
            }
        }

        else {
            delete _data.password_hash;
        }
        if (!user) {
          user  = await Users.create(_data)
        }
        else {
           await user.update(_data)
        }

        Activities.create({
            activity: `modified a  user: ${user.display_name}`,
            user_id: _data.user_id || '0',
            module: 'System'
        })



        return user
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Error: ${error}`)
    }





};


/**
 * soft delete a user
 * @param _data
 * @returns {boolean} true if the user was actually deleted
 */
export async function delete_user_function(_data: { [key: string]: any}): Promise<boolean> {

    let id = _data.id;

    //console.log(id)
    try {
        let user = await Users.findOne({
            where: {
                id: id
            }
        })
        await user?.destroy();
        Activities.create({
            activity: `deleted user ${JSON.stringify(user)}`,
            user_id: `${_data.user_id}`,
            object_id: user?.id,
            module: 'users'
        })
        return true
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error)
    }

};

/**
 * get a user object with the provided id
 * @param _data
 * @returns {Promise<Users>} a user object
 */
export async function get_user_function(_data: { [key: string]: any}): Promise<Users> {
    try {
        let user = await Users.findOne({
            where: {
                id: _data.id
            },
            raw: true,
            include: {
                model: Roles
            }
        }
        );

        if (!user) throw new Error(`user ${_data.id} not found`);
        return user
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error)
    }

};


export async function activate_user_function(_data: { [key: string]: any}): Promise<boolean> {


    //console.log(id)
    try {
        await Users.update({
            active: _data.active
        }, {
            where: {
                id: _data.id
            }
        })

        Activities.create({
            activity: `activated a user: ${_data.display_name}`,
            user_id: _data.user_id,
            module: 'System'
        })



        return true
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Error activating user: error: ${error}`)
    }

};


export async function update_user_function(_data: {[key:string]:any}): Promise<boolean> {


    //console.log(id)
    try {
        let user = await Users.findByPk(_data.id);
        if (!user) throw new Error(`user ${_data.id} not found`);
        user.set(_data)
        await user.save();

        Activities.create({
            activity: `updated a user: ${user.display_name}: ${JSON.stringify(_data)} `,
            user_id: _data.user_id,
            module: 'System'
        })



        return true
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Error updating user: error: ${error}`)
    }

};



export async function addRole(_data: {
    role_name: string, description: string,
    selectedPermissions: string[], user_id: string,
    role_id?:string
}): Promise<Roles> {


    try {
        let id = _data.role_id;
        let role;
        //do the permissions
        const permissions: { role_id: string, permission_id: string }[] = [];

        if (id) {
            role = await Roles.findByPk(id);
            if (!role) {
                throw new Error(`error updating a role id ${id}. Not found `);
            }
            Roles.update({ role_name: _data.role_name, description: _data.description }, {
                where: {
                    role_id: id
                }
            });
            RolePermissions.destroy({
                where: {
                    role_id: id
                },
                force: true
            })
        }
        else {
            role = await Roles.create(_data);
            id = role.role_id.toString();
        }

        _data.selectedPermissions.forEach(permission => {
            permissions.push({ role_id: id!, permission_id: permission })
        })

        await RolePermissions.bulkCreate(permissions)

        Activities.create({
            activity: `created a new role ${_data.role_name}`,
            user_id: 'admin',
            module: 'System'
        })
        return role!;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Error adding/updating a role: ${error}`)

    }




};

/**
 * get all roles from the database
 * @param _data the limit and offset
 * @returns a list of roles
 */
export async function get_roles_function(_data: { offset?: string, limit?:string}):Promise<Roles[]>  {
    try {
        let offset = _data.offset == undefined ? 0 : parseInt(_data.offset);
        let limit = _data.limit == undefined ? 100 : parseInt(_data.limit);
        let data = await Roles.findAll({
            limit: limit,
            offset: offset,
            raw: true
        })

        return data;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Error getting roles: ${error}`)
    }

};



/**
 * get list of permissions assigned to a role
 * @param _data {id: the id of the role}
 * @returns the list of permissions
 */
export async function get_role_permissions_function(_data: { id:string}): Promise<Permissions[]> {
    try {
        let data = await Permissions.findAll({
            where: {
                permission_id: {
                    [Op.in]: Sequelize.literal(`(select permission_id from ${RolePermissions.tableName}
                    where role_id = ${_data.id})`)
                }
            },
            raw:true
        })


        return data
    } catch (error: any) {
        logger.error({ message: error });
        throw new Error(`Error getting role permissions for role_id: ${_data.id}: ${error}`)
    }

};
//tested

/**
 * get permissions not available to a role
 * @param _data
 * @returns a list of permissions
 */
export async function get_role_excluded_permissions_function(_data: { [key: string]: any}): Promise<Permissions[]>  {
    try {
        let data = await Permissions.findAll({
            where: {
                permission_id: {
                    [Op.notIn]: Sequelize.literal(`(select permission_id from ${RolePermissions.tableName}
                    where role_id = ${_data.id})`)
                }
            },
            raw: true,
            logging: console.log
        })

        return data
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(`Unable to get excluded permissions for role id: ${_data.id}: ${error}`)
    }

};
//tested
/**
 * add a new permission to the role
 * @param _data
 * @returns the role_permission object
 */
export async function add_role_permission_function (_data: {[key:string]:any}): Promise<RolePermissions>  {

    try {
        let role_permission = await RolePermissions.create(_data);
        Activities.create({
            activity: `added a permission ${_data.permission_name} to role: ${_data.role_name}`,
            user_id: _data.user_id,
            module: 'System'
        })
        return role_permission
    } catch (error: any) {
        logger.error({message:error})
        throw new Error(`Unable to add a permission ${_data.permission_name}
        to role: ${_data.role_name}: : ${error}`)
    }

};

export async function get_permissions_function(): Promise<Permissions[]> {
    try {
        let data = await Permissions.findAll({
            raw: true
        })


        return data
    } catch (error: any) {
        logger.error({ message: error });
        throw new Error(`Error getting all permissions for role_id: ${error}`)
    }

};

/**
 * delete a permission from a role
 * @param _data
 * @returns true if successful
 */
export async function delete_role_permission_function(_data: { role_id: string; permission_id: string; user_id: string; }):Promise<boolean>  {

    try {
        const role = await Roles.findByPk(_data.role_id);
        const permission = await Permissions.findByPk(_data.permission_id);
        if (!role) {
            throw new Error("Unable to find specified role");

        }
        if (!permission) {
            throw new Error("Unable to find specified permission");

        }
        await RolePermissions.destroy({
            where: {
                role_id: _data.role_id,
                permission_id: _data.permission_id
            }
        })
        Activities.create({
            activity: `removed a permission ${permission.name} from role ${role.role_name}`,
            user_id: `${_data.user_id}`,
            module: 'users'
        })

        return true
    } catch (error: any) {
        logger.error({message: error})
        throw new Error(`Error removing permission from role: error: ${error}`)
    }

};




export async function delete_role_function(_data: { id: string; user_id: string; }): Promise<boolean>  {

    try {
        const object = await Roles.findByPk(_data.id, {
            raw: true
        });
        await Roles.destroy({
            where: { role_id: _data.id }
        });
        Activities.create({
            activity: `deleted a role ${object?.role_name} `,
            user_id: `${_data.user_id}`,
            module: 'users'
        })

        return true

    } catch (error: any) {
       logger.error({message:error})
        throw new Error("Error deleting a role. Error: "+error)

    }
};//tested

export async function get_role_function(_data: { [key: string]: any}): Promise<Roles>  {

    try {
        let object = await Roles.findByPk(_data.id, {
            include: [Permissions]
        })

        if (!object) throw new Error(`role ${_data.id} not found`);

        return object
    } catch (error: any) {
        logger.error({message: error})
        throw new Error("Error getting a role. Error: " + error)
    }

};


export async function change_staff_password_function(_data: { [key: string]: any}) {


    let old_password = _data.old_password
    try {

        let user = await Users.findOne({
            where: {
                username: _data.username,
            }
        });
        let password_valid: boolean = false;
        if (user && user.password_hash) {
            //username was found. compare the password
            password_valid = bcrypt.compareSync(_data.old_password, user.password_hash);
        }

        if (user == null || !password_valid) {
            throw new Error(errorMessages.WRONG_COMBINATION)

        }
        //user is valid. update the password
        let hash = bcrypt.hashSync(_data.password, 10);
        // console.log(hash)
        user.password_hash = `${hash}`;
        await user.save();


        Activities.create({
            activity: ` ${user.display_name} changed their password`,
            user_id: user.id,
            module: 'System'
        })

        return user;



    } catch (error: any) {
        logger.error({message: error})

        throw new Error(error)
    }



};

export async function resetAdminPassword():Promise<{ error: boolean; message:any }> {
    try {

        const token = crypto.randomBytes(5).toString("hex");
        await Tokens.destroy({
            where: {
                name: "reset_admin_password"
            }
        });

        await Tokens.create({
            name: "reset_admin_password",
            token: token
        })

        const emailSetting = await Settings.findOne({
            where: {
                name: 'email'
            }
        });

        const nameSetting = await Settings.findOne({
            where: {
                name: 'company_name'
            }
        })

        const subject = "Reset your admin password"
        const message = `You have requested to reset your ${constants.appname} for ${nameSetting!.value} server admin password.
Please use this code as token in the reset page: ${token}.`;

            const response = await sendEmail(message, emailSetting!.value, subject);
            const data = {
                error: response.data.status === "1",
                message: response.data.status === "1" ? `Email sent to your administrator email. Please
                    check your inbox to retrieve the token` : response.data.data
        }
        return data;
    }
    catch (error: any) {
        logger.error({ message: error })

        throw new Error(error)
    }
}


export async function doResetAdminPassword(_data:{password:string, token:string}): Promise<boolean> {
    try {

        const hash = bcrypt.hashSync(_data.password, 10);

        await Tokens.destroy({
            where: {
                name: "reset_admin_password"
            }
        });

        await Settings.update({
            value: hash
        }, {
            where: {
                name: 'admin_password'
            }
        })


        return true;
    }
    catch (error: any) {
        logger.error({ message: error })

        throw new Error(error)
    }
}


// ////////////////INCOMING PAYMENTS//////////////////////
// exports.save_incoming_payment_function = async (_data) => {
//     try {
//         let helperClass = require('../helpers/incomingPaymentHelper')
//         let h = new helperClass();

//         let data = h.prep_data(_data);
//         data.created_by = _data.user_id;

//         try {
//             let customer_phone = _data.customer_phone;
//             //get the customer who matches the name
//             let cust_details = await customerHelper.getItem(` phone = "${customer_phone}" `, customerHelper.table_name);
//             if (cust_details == null) {
//                 //save the person
//                 data.payer =
//                     await customerHelper.insert({
//                         name: `"${_data.customer_name}"`,
//                         phone: `"${_data.customer_phone}"`
//                     }, customerHelper.table_name)
//             }
//             // sales_data.customer = `"${_data.customer_name} - ${_data.customer_phone}"`;

//         } catch (error: any) {
//             log.error(error)
//         }


//         // //console.log(data)
//         await h.insert(data, h.table_name);

//         return { status: '1', data: null }
//     } catch (error: any) {
//         await helper.closeConnection();
//         if (process.env.NODE_ENV != "production") console.log(error)

//         log.error(error)
//         throw new Error(error)
//     }





// };

// exports.find_incoming_payments_between_dates_function = async (_data) => {
//     try {
//         let helperClass = require('../helpers/incomingPaymentHelper')
//         let h = new helperClass();

//         let start = _data.start_date == undefined ? h.getToday() : _data.start_date;
//         let end = _data.end_date == undefined ? h.getToday() : _data.end_date;
//         let code = _data.code;
//         let type = _data.type

//         let objects = null;
//         if (code != undefined) {
//             objects = await h.search(code)
//         }
//         else if (type != undefined) {
//             objects = await h.getMany(` date >= '${start}' and date <= '${end}' and type ='${type}'`, h.table_name);
//         }
//         else {
//             objects = await h.getMany(` date >= '${start}' and date <= '${end}' `, h.table_name);

//         }

//         for (var i = 0; i < objects.length; i++) {
//             try {
//                 let customer = await customerHelper.getItem(`id = '${objects[i].payer}'`, customerHelper.table_name);
//                 objects[i].customer_name = customer.name;
//                 objects[i].phone = customer.phone;
//             } catch (error: any) {
//                 log.error(error)
//                 objects[i].customer_name = "N/A";
//                 objects[i].phone = "N/A";
//             }

//         }




//         return {
//             status: '1',
//             data: objects
//         }
//     } catch (error: any) {
//         await helper.closeConnection();
//         // if(process.env.NODE_ENV != "production") console.log(error)

//         log.error(error)
//         throw new Error(error)
//     }

// };

// exports.delete_incoming_payment_function = async (_data) => {
//     let helperClass = require('../helpers/incomingPaymentHelper')
//     let h = new helperClass();
//     try {
//         let codes = _data.id.split(",");//comma-separated
//         let code_quotes = []
//         for (var i = 0; i < codes.length; i++) {
//             code_quotes.push(`${codes[i]}`)
//         }


//         await h.delete(` id in (${code_quotes.join(",")}) `, h.table_name);
//         await activitiesHelper.log(_data.user_id, `"deleted credit payment receipt: ${code_quotes.join(",")}  "`, `'Accounts'`)



//         return {
//             status: '1'
//         }
//     } catch (error: any) {
//         await helper.closeConnection();
//         log.error(error)
//         throw new Error(error)
//     }

// };


// exports.get_customer_payments_function = async (_data) => {

//     let helperClass = require('../helpers/incomingPaymentHelper')
//     let h = new helperClass();
//     try {
//         let id = _data.customer;
//         let objects = await h.getMany(` payer = ${id}  `, h.table_name);


//         // objects.map(obj => {
//         //     obj.stock = obj.current_stock
//         // })
//         return { status: '1', data: objects }
//     } catch (error: any) {
//         await helper.closeConnection();
//         log.error(error)
//         throw new Error(error)
//     }

// };
// ///////////////////END INCOMING PAYMENTS///////////////


// exports.reset_user_password = async (_data) => {
//     let Helper = require('../helpers/token');
//     let h = new Helper();
//     try {


//         //if retry, do not regenerate the token.
//         if (_data.retry == "1") {
//             message = _data.message;

//             let data = { error: true, retry: true, message: message }
//             //render the page
//             res.render("resetPassword", data)
//             return false;
//         }
//         //check the username  or email
//         let user = _data.user;
//         let AdminHelper = require("../helpers/adminHelper")
//         let adminHelper = new AdminHelper();
//         let user_details = await adminHelper.getItem(`lower(email) = lower('${user}') or lower(username) = lower('${user}')`, adminHelper.table_name);
//         //if found, generate the token and send the mail
//         if (user_details != null) {


//             //create a token and send it to the url
//             const crypto = require("crypto");

//             const token = crypto.randomBytes(5).toString("hex");
//             //insert it into the token table
//             //clear others
//             await h.delete(`name = 'reset_user_password_${user_details.email}'`, h.table_name)
//             await h.insert({ name: `'reset_user_password_${user_details.email}'`, token: `'${token}'` }, h.table_name)

//             const axios = require('axios');


//             let email = user_details.email;

//             message = `You have requested to reset your Druglane password. Please use this code as token in the reset page: ${token}.`;
//             // console.log(message)
//             const FormData = require('form-data');

//             const form = new FormData();
//             form.append('mails', email);
//             form.append('message', message);
//             form.append('subject', "Reset Druglane Password");

//             axios.post(constants.server_url + `/api_admin/sendBulkMail`, form, { headers: form.getHeaders() })


//                 .then(function (response) {
//                     // console.log(response.data);
//                     let data = {
//                         error: false, retry: false, message: `Email sent to your email. Please
//             check your inbox to retrieve the token`}
//                     //render the page
//                     return data;
//                 })
//                 .catch(function (error) {
//                     let data = {
//                         error: true, retry: false, message: `Unable to communicate with cloud server. Please
//             check your internet connection and try again`}
//                     return data;
//                 });
//         }
//         else {
//             let data = {
//                 error: true, retry: false, message: `No username or email found. Please check and try
//                 again.`}
//             return data;
//         }

//     } catch (error: any) {
//         // console.log(error);
//         let data = {
//             error: true, retry: false, message: `Server error. Please try again`
//         }
//         return data;
//     }

// };


// exports.do_reset_user_password = async (_data) => {
//     try {
//         let Helper = require('../helpers/token');
//         let h = new Helper();
//         const activityHelper = require('../helpers/activitiesHelper')
//         const ah = new activityHelper();

//         let token = _data.token;
//         let password = _data.password;
//         let email = _data.username;

//         var bcrypt = require('bcryptjs');

//         let AdminHelper = require("../helpers/adminHelper")
//         let adminHelper = new AdminHelper();
//         let user_details = await adminHelper.getItem(`lower(email) = lower('${email}') or lower(username) = lower('${email}')`, adminHelper.table_name);

//         if (user_details == null) {
//             return { status: "-1", message: "Username or email not found" }
//         }
//         //get the setting admin_password
//         var old_token = await h.getField("token", h.table_name, `name = 'reset_user_password_${user_details.email}'`);
//         // console.log(old_token.token, token)
//         if (token == old_token.token) {
//             var hash = bcrypt.hashSync(password, 10);

//             //set the new password
//             await adminHelper.updateField("password_hash", `'${hash}'`, `id = ${user_details.id}`, adminHelper.table_name)
//             return { status: "1", message: "Password reset successfully" }

//         } else {
//             // Passwords don't match
//             return { status: "-1", message: "Wrong token entered. Try again" }

//         }

//     } catch (error: any) {
//         log.error(error)
//         // console.log(error)
//         throw new Error(error)

//     }




// };





