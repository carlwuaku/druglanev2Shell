import express, { Router, Response, Request } from 'express';
import { extractSqlMessage } from '../helpers/generalHelper';
import {
    _delete, _findById, _getList, _save,
    _saveDiagnostics, _getCustomerDiagnosticsList, _getDiagnosticsList, _addRefill, _addMultipleRefill, _deleteRefill, _getRefillList, _countRefills
} from '../services/customer.service';
import { hasPermission } from '../utils/auth';
const router: Router = express.Router();


router.use(hasPermission);
/**
 * get all customers. also for search
 */
router.get('/',  async (req: Request, res: Response) => {
    try {
        let data = await _getList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/',  async (req: Request, res: Response) => {
    try {
        let data = await _save(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.delete('/delete/:id',  async (req: Request, res: Response) => {
    try {
        let data = await _delete({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get('/customer/:id',  async (req: Request, res: Response) => {
    try {
        let data = await _findById({id: req.params.id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/saveDiagnostics',  async (req: Request, res: Response) => {
    try {
        let data = await _saveDiagnostics(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});
/**
 * reuse for findDiagnosticsBetweenDates
 */
router.get('/getCustomerDiagnosticsList',  async (req: Request, res: Response) => {
    try {
        let data = await _getCustomerDiagnosticsList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});


router.get('/getDiagnosticsList',  async (req: Request, res: Response) => {
    try {
        let data = await _getDiagnosticsList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/addRefill',  async (req: Request, res: Response) => {
    try {
        let data = await _addRefill(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/addMultipleRefill',  async (req: Request, res: Response) => {
    try {
        let data = await _addMultipleRefill(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.delete('/deleteRefill/:id',  async (req: Request, res: Response) => {
    try {
        let data = await _deleteRefill({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

/**reuse for getCustomerRefillList and findRefillBetweenDates */
router.get('/getRefillList',  async (req: Request, res: Response) => {
    try {
        let data = await _getRefillList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get('/countRefill',  async (req: Request, res: Response) => {
    try {
        let data = await _countRefills(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

export default router;
