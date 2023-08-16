import { activate_user_function, add_insurer_function, addRole, add_role_permission_function, delete_insurer_function, delete_role_function, delete_role_permission_function, delete_user_function, get_insurers_function, get_role_excluded_permissions_function, get_role_function, get_role_permissions_function, get_users_function, get_user_function, login_function, save_user_function } from "../services/admin.service";
import { runMigrations } from "../config/migrations/migrations";
const request = require('supertest');
import { app } from '../server';
import { InsuranceProviders } from "../models/InsuranceProviders";
import { Users } from "../models/Users";
import { Roles } from "../models/Roles";
import fs from 'fs'
import { constants } from "../../utils/constants";
import { Customers } from "../models/Customers";
import { _save } from "../services/customer.service";
import { Permissions } from "../models/Permissions";
import { allPermissions, PERMISSION_ADJUST_STOCK, PERMISSION_CREATE_SALES, PERMISSION_MANAGE_ACCOUNTS } from "../config/permissions";
import { RolePermissions } from "../models/RolePermissions";

const userCarl = {
    "name": "carl",
    "role_id": 1,
    "email": "wuakuc@gmail.com",
    username: "carl",
    "display_name": "Carl Kojo",
    "active": 1,
    "phone": "0203934",
    "allow_online": "yes",
    "password": "1234"
};

const userDoris = {
    "name": "doris",
    "role_id": 1,
    "email": "doris@gmail.com",
    username: "doris",
    "display_name": "Abena Dross",
    "active": 1,
    "phone": "020399874",
    "allow_online": "yes",
    "password": "2345"
};

const userHarriet = {
    "name": "harriet",
    "role_id": 1,
    "email": "harriet@gmail.com",
    username: "harriet",
    "display_name": "H Yankson",
    "active": 1,
    "phone": "020345114",
    "allow_online": "yes",
    "password": "0000"
};

const customeryaro = {
    "name": "bABA yARO",
    "sex": "Male",
    "email": "wuakuc@gmail.com",
    "phone": "0207085244",
    "location": "kojokrom",
    "date_of_birth": "1990-02-12"
};

const customerDoris = {
    "name": "doris",
    "sex": "Female",
    "email": "doris@gmail.com",
    "phone": "0207123444",
    "location": "accra",
    "date_of_birth": "1996-02-12"
};

const customerHarriet = {
    "name": "harriet",
    "sex": "Female",
    "email": "harriet@gmail.com",
    "phone": "0207030344",
    "location": "uk",
    "date_of_birth": "1996-02-12"
};


describe('Admin Service', () => {

    beforeAll(() => {
        //delete the database and start afresh
        if (fs.existsSync("../../../test_db.db")) {
            console.log("deleting db")
            fs.unlinkSync("../../../test_db.db")
        }
        return runMigrations();
    });

    it('add an insurer', async () => {
        //clear the table and try to insert
        await InsuranceProviders.destroy({ truncate: true, force: true });
        const insurer = await add_insurer_function({ name: "NHS", user_id: "1" })
        expect(insurer).toBeInstanceOf(InsuranceProviders);
        const numExisting = await get_insurers_function();
        expect(numExisting).toHaveLength(1)
    });


    it('deletes insurer', async () => {
        await InsuranceProviders.destroy({ truncate: true, force: true });
        const insurer = await add_insurer_function({ name: "NHS", user_id: "1" });
        await delete_insurer_function({ id: insurer.id.toString() });
        const numExisting = await get_insurers_function();
        expect(numExisting).toHaveLength(0)
    })


    it('adds a user', async () => {

        await Users.destroy({ truncate: true, force: true });
        const user = await save_user_function({ ...userCarl, user_id: "1" });
        expect(user).toBeInstanceOf(Users);
        //get the users and expect it to have one user
        const users = await get_users_function({ offset: 0, limit: 10 });
        expect(users).toHaveLength(1)


    })

    it('adds does not allow duplicate username', async () => {

        await Users.destroy({ truncate: true, force: true });
        const user = await save_user_function({ ...userCarl, user_id: "1" });
        //add again
        await expect(save_user_function).rejects.toThrow("Error adding a user")

    });

    it('adds multiple users', async () => {
        await Users.destroy({ truncate: true, force: true });


        await save_user_function({ ...userCarl, user_id: "1" });
        await save_user_function({ ...userDoris, user_id: "1" });
        await save_user_function({ ...userHarriet, user_id: "1" });
        const users = await get_users_function({ offset: 0, limit: 10 });

        expect(users).toHaveLength(3)
    });

    it('deletes users', async () => {
        await Users.destroy({ truncate: true, force: true });

        const carl = await save_user_function({ ...userCarl, user_id: "1" });
        const doris = await save_user_function({ ...userDoris, user_id: "1" });
        const harriet = await save_user_function({ ...userHarriet, user_id: "1" });

        await delete_user_function({ id: carl.id, user_id: "1" })

        let users = await Users.findAll()
        expect(users).toHaveLength(2);

        await doris.destroy();
        users = await Users.findAll();
        expect(users).toHaveLength(1)
    })

    it('logs user in with correct credentials', async () => {
        await Users.destroy({ truncate: true, force: true });

        await save_user_function({ ...userCarl, user_id: "1" });
        const login_details = await login_function({ "password": "1234", "username": "carl" });
        expect(login_details).toBeInstanceOf(Users);
    });

    it('does not log user in with wrong password', async () => {
        await Users.destroy({ truncate: true, force: true });

        await save_user_function({ ...userCarl, user_id: "1" });
        await expect(login_function({ "password": "0004", "username": "carl" })).rejects.
            toThrow("User not found")

    });

    it('does not log user in with wrong username', async () => {
        await Users.destroy({ truncate: true, force: true });
        await save_user_function({ ...userCarl, user_id: "1" });
        await expect(login_function({ "password": "1234", "username": "joojo" })).rejects.
            toThrow("User not found")
    });


    it('updates a user', async () => {
        await Users.destroy({ truncate: true, force: true });

        let carl = await save_user_function({ ...userCarl, user_id: "1" });
        //update the user's name to amina
        await carl.update({ display_name: 'Aminatu', username: 'amina' });
        let new_carl = await Users.findOne({ where: { id: carl.id } });
        // console.log(new_carl)
        expect(new_carl!.display_name).toBe("Aminatu");
        expect(new_carl!.username).toBe("amina")
    })


    it('fetches  a user based on id', async () => {
        await Users.destroy({ truncate: true, force: true });

        let carl = await save_user_function({ ...userCarl, user_id: "1" });
        carl = await get_user_function({ id: carl.id });
        expect(carl).toBeInstanceOf(Users);
        expect(carl.username).toBe("carl")
    });


    it('activates a user', async () => {
        await Users.destroy({ truncate: true, force: true });

        let carl = await save_user_function({ ...userCarl, user_id: "1" });
        carl = await get_user_function({ id: carl.id });

        expect(carl).toBeInstanceOf(Users);
        expect(carl.active).toBe(1);
        let activate = await activate_user_function({ id: carl.id, user_id: "1", active: "0", display_name: carl.display_name });
        expect(activate).toBe(true);
        carl = await get_user_function({ id: carl.id });
        expect(carl.active).toBe(0)
    });

    it('adds a role', async () => {
        //there are 2 roles by default
        let initial = await Roles.count();
        let newObject = await addRole({ role_name: "role 1", description: "a description", user_id: "1", selectedPermissions: [] });
        expect(newObject).toBeInstanceOf(Roles);
        //get the number of items in the table
        let count = await Roles.count();
        expect(count).toBe(initial + 1)
    });

    it('has 26 permissions', async () => {
        let count = await Permissions.count();
        expect(count).toBe(26)
    });

    //branch managers have all permissions by default
    it('gets all permissions for branch manager', async () => {
        let objects = await get_role_permissions_function({ id: '1' });
        expect(objects.length).toBe(26)
    });

    it('gets all permissions for branch manager', async () => {
        let objects = await get_role_excluded_permissions_function({ id: '1' });
        expect(objects.length).toBe(0)
    });

   
    it('gets all permissions for an added role', async () => {
        let newObject = await addRole({
            role_name: "role 2",
            description: "a description", user_id: "1",
            selectedPermissions: []
        });
         await add_role_permission_function({
             permission_id: 85, role_id: newObject.role_id,
            permission_name: PERMISSION_MANAGE_ACCOUNTS,
             role_name: 'role 2',
            user_id: "1"
         });
        //get the role's permissions and excluded permissions

        let perms = await get_role_permissions_function({ id: newObject.role_id.toString() });
        expect(perms.length).toBe(1)
        expect(perms[0]).toBeInstanceOf(Permissions);
        //get the excluded permissions
        let excluded_perms = await get_role_excluded_permissions_function({ id: newObject.role_id.toString() });
        expect(excluded_perms.length).toBe(25)
        expect(excluded_perms[0]).toBeInstanceOf(Permissions);

    });

   

    it('adds role permission', async () => {
        let initial = await RolePermissions.count({
            where: {
                role_id: 2
            }
        });
        let object = await add_role_permission_function({
            permission_id: 85, role_id: 2,
            permission_name: PERMISSION_MANAGE_ACCOUNTS,
            role_name: 'Sales Person',
            user_id: "1"
        });
        expect(object).toBeInstanceOf(RolePermissions);
        let final = await RolePermissions.count({
            where: {
                role_id: 2
            }
        });
        expect(final).toBe(initial + 1)
    });

    // it('deletes role permission', async () => {
    //     //add a role, add 3 permissions, delete 1
    //     let newObject = await add_role_function({
    //         role_name: "role 1",
    //         description: "a description", user_id: "1"
    //     });

    //     await add_role_permission_function({
    //         permission_id: allPermissions.get(PERMISSION_MANAGE_ACCOUNTS).permission_id,
    //         role_id: newObject.role_id,
    //         permission_name: allPermissions.get(PERMISSION_MANAGE_ACCOUNTS).name,
    //         role_name: 'Sales Person',
    //         user_id: "1"
    //     })
    //     await add_role_permission_function({
    //         permission_id: allPermissions.get(PERMISSION_CREATE_SALES).permission_id,
    //         role_id: newObject.role_id,
    //         permission_name: allPermissions.get(PERMISSION_CREATE_SALES).name,
    //         role_name: 'Sales Person',
    //         user_id: "1"
    //     })
        
    //     let initial = await RolePermissions.count({
    //         where: {
    //             role_id: newObject.role_id
    //         }
    //     });
    //     let object = await delete_role_permission_function({
    //         permission_id: allPermissions.get(PERMISSION_CREATE_SALES).permission_id,
    //         role_id: newObject.role_id,
    //         permission_name: allPermissions.get(PERMISSION_CREATE_SALES).name,
    //         role_name: 'Sales Person',
    //         user_id: "1"
    //     });
    //     expect(object).toBe(true);

    //     let final = await RolePermissions.count({
    //         where: {
    //             role_id: newObject.role_id
    //         }
    //     });
    //     expect(final).toBe(initial - 1);

    //     //undo the delete
    // });

    it('deletes a role', async () => {
        //crate a role and give it a permission
        let newObject = await addRole({
            role_name: "role 2",
            description: "a description", user_id: "1", selectedPermissions: []
        });
        
         
        let deleted = await delete_role_function({
            id: newObject.role_id.toString(),
            user_id: "1"
        });
        expect(deleted).toBe(true);

        let objects = await get_role_function({ id: newObject.role_id.toString() });
        expect(objects).toBe(null)
    });

    it('gets a role', async () => {
        let newObject = await addRole({
            role_name: "role 3",
            description: "a description", user_id: "1", selectedPermissions: []
        });

        let objects = await get_role_function({ id: newObject.role_id.toString() });
        expect(objects).toBeInstanceOf(Roles);
    });


    it('add a customer', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        let newObject = await _save({ ...customerDoris, user_id: "1" });
        expect(newObject).toBeInstanceOf(Customers);
        //get the number of items in the table
        let count = await Customers.count();
        expect(count).toBe(1)
    });

})