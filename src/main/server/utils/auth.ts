import { Settings } from "../models/Settings";
import { NextFunction, Request, Response } from 'express';
import { Users } from "../models/Users";
import { get_role_permissions_function } from "../services/admin.service";
import { errorMessages, infoMessages, moduleNames } from '../helpers/stringHelpers'
import { UserSessions } from "../models/UserSessions";
import { logger } from "../config/logger";

export  async function isAdminLoggedIn (request: Request, response: Response, next: NextFunction) {
    //get the admin_login_token setting from the settings table
    const setting = await Settings.findOne({
        where: {
            name: 'admin_login_token'
        }
    });
    //if nothing found, not logged in
    if (!setting) {
        response.status(500).json({ message: errorMessages.INCORRECT_SYSTEM_CONFIG });
        return;
    }
    //check if the headers are valid
    const userToken = request.headers['admin_token'];
    if (!userToken) {
        response.status(403).json({ message: errorMessages.INCORRECT_REQUEST_CONFIG });
        return;
    }
    else {
        if (userToken !== setting?.value) {
            response.status(403).json({ message: errorMessages.NOT_LOGGED_IN_AS_ADMIN });
            return;
        }
    }
    next();
}


export async function isUserLoggedIn (request: Request, response: Response, next: NextFunction)  {

    //check if the headers are valid
    const userToken = request.headers['token'];
    const userId = request.headers['userid'];
    if (!userToken || !userId) {
        response.status(403).json({ message: errorMessages.INCORRECT_REQUEST_CONFIG });
    }
    const user = await Users.findOne({
        where: {
            id: userId,
            token: userToken
        }
    })
    if (!user || user.token !== userToken) {
        response.status(403).json({ message: errorMessages.NOT_LOGGED_IN });
    }
    request.user_id = user!.id.toString();
    next();
}

/**
 * checks if the user has permission to access an endpoint. for admin, no permission check needed
 * @param permission the name of the permission
 * @returns void
 */
export async function hasPermission(request: Request, response: Response, next: NextFunction)  {
    //check if the headers are valid
    try {


    const userToken = request.headers['token'];
    const userId = request.headers['userid'];
    if (!userToken) {
        response.status(403).json({ message: errorMessages.INCORRECT_REQUEST_CONFIG });
        return;
    }
    const userSession = userId ? await  UserSessions.findOne({
        where: {
            user_id: userId,
            token: userToken
        }
    }) : null;

    const user = userId ? await Users.findOne({
        where: {
            id: userId
        }
    }) : null;

    const adminSession = await UserSessions.findOne({
        where: {
            user_id: '0',
            token: userToken
        }
    });
    if (userSession) {
        //check the permission, set the request user_id and call next
        const permission = routePermissions[request.path]
        if (permission) {
            const rolePermissions = await get_role_permissions_function({ id: user!.role_id.toString() });
            if (!rolePermissions.find(item => item.name === permission)) {
                response.status(403).json({ message: errorMessages.NO_PERMISSION });
                return;
            }
        }
        request.user_id = user!.id.toString();
        request.body.user_id = user!.id.toString();
        request.query.user_id = user!.id.toString();
        request.params.user_id = user!.id.toString();
        next();
    }
    else if (adminSession) {
        //set the request user_id to "0" for admin and call next
        request.user_id = "0";
        next();
    }
    else {
        //user is not logged in at all
        response.status(403).json({ message: errorMessages.NOT_LOGGED_IN });
        return;
    }
    } catch (error) {
      logger.error(error)
      throw error;
    }

}


export const routePermissions:{[key:string]: string} = {

}

