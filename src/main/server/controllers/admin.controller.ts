import { logger } from '../config/logger';
import express, { Router, Response, Request } from 'express';
const router: Router = express.Router();
import {addRole, delete_role_function, delete_role_permission_function, delete_user_function, doResetAdminPassword, getSettings, get_branches_function, get_insurers_function, get_logo_function, get_permissions_function, get_roles_function, get_role_function, get_role_permissions_function, get_users_function, get_user_function, login_function, resetAdminPassword, saveSettings, save_branch_function, save_user_function, server_admin_login_function} from '../services/admin.service'
import { hasPermission } from '../utils/auth';
import { constants } from '../utils/constants';


router.get("/", async (req: Request, res: Response) => {
    res.status(200).send("welcome!")
});


router.get('/getAppName', async (req: Request, res: Response) => {
    try {
        let data = { name: constants.appname, long_name: constants.appLongName };
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })
    }
})


router.post('/login', async (req: Request, res: Response) => {

    try {

        const user = await login_function(req.body);
        res.status(201).json(user);

    } catch (error) {
        console.log(error)
        // await helper.closeConnection();
        res.status(500).json({ status: '-1', data: null, message: error })

    }

});

router.post('/admin_login', async (req: Request, res: Response) => {

    try {

        const token = await server_admin_login_function(req.body);
        res.status(201).json(token);

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: '-1', data: null, message: error })

    }

});

router.post('/resetAdminLogin', async (req: Request, res: Response) => {

    try {

        const token = await resetAdminPassword();
        res.status(201).json(token);

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: '-1', data: null, message: error })

    }

});

router.post('/resetAdminPassword', async (req: Request, res: Response) => {

    try {

        const token = await doResetAdminPassword(req.body);
        res.status(201).json(token);

    } catch (error) {
        console.log(error)
        res.status(500).json({ status: '-1', data: null, message: error })

    }

});

router.get('/getBranches', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_branches_function();
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
})




router.get('/getLogo', async (req: Request, res: Response) => {

    try {
        let data = await get_logo_function();
        res.status(201).json(data);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ status: '-1', data: null, message: error })
    }
})




router.post('/saveBranch', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await save_branch_function(req.body);
        res.json(data);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ status: '-1', data: null, message: error })

    }
})

router.get('/getInsurers', async (req: Request, res: Response) => {
    try {
        let data = await get_insurers_function();
        res.json(data);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/settings',  async (req: Request, res: Response) => {
    try {
        let data = await getSettings();
        res.json(data);
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/allPermissions', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_permissions_function();
        res.json(data);
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/saveSettings',  async (req: Request, res: Response) => {
    try {
        console.log(req.body)

        let data = await saveSettings(req.body);
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
})

router.post('/saveRole', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await addRole(req.body);
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/getRoles', hasPermission, hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_roles_function({});
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/getUsers', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_users_function({});
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/user/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_user_function({id: req.params.id});
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/role/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_role_function({ id: req.params.id });
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/rolePermissions/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_role_permissions_function({ id: req.params.id });
        res.status(200).json(data);
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.delete('/rolePermissions/:role_id/:permission_id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await delete_role_permission_function({
            role_id: req.params.role_id, permission_id: req.params.permission_id,
            user_id: req.user_id
        });
        res.status(200).json(data);
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/saveUser', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await save_user_function(req.body);
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.delete('/user/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await delete_user_function({
            id: req.params.id,
            user_id: ''
        });
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.delete('/role/:id/', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await delete_role_function({
            id: req.params.id,
            user_id: ''
        });
        res.status(200).json(data)
    } catch (error) {
        logger.error({ message: error })
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

export default router;
