import express, { Router, Response, Request } from 'express';
import {
    _delete, _findById, _getList, _save,
    _saveDiagnostics, _getCustomerDiagnosticsList, _getDiagnosticsList, _addRefill, _addMultipleRefill, _deleteRefill, _getRefillList, _countRefills
} from '../services/customer.service';
import { hasPermission } from '../utils/auth';
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.status(200).send("welcome!")
});

/**
 * get all customers. also for search
 */
router.get('/getList', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _getList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/save', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _save(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.delete('/delete/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _delete({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/findById', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _findById(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/saveDiagnostics', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _saveDiagnostics(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});
/**
 * reuse for findDiagnosticsBetweenDates
 */
router.get('/getCustomerDiagnosticsList', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _getCustomerDiagnosticsList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});


router.get('/getDiagnosticsList', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _getDiagnosticsList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/addRefill', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _addRefill(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.post('/addMultipleRefill', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _addMultipleRefill(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.delete('/deleteRefill/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _deleteRefill({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

/**reuse for getCustomerRefillList and findRefillBetweenDates */
router.get('/getRefillList', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _getRefillList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

router.get('/countRefill', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await _countRefills(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ status: '-1', data: null, message: error })

    }
});

export default router;