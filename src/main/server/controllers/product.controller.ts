import express, { Router, Response, Request } from 'express';
import { create_stock_adjustment_session, delete_product, find, get_distinct_field_values, get_latest_session, get_stock_values, mass_edit, restore_deleted_product, save, _getCount, _getList } from '../services/product.service';
import { hasPermission } from '../utils/auth';
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
   try {
        let data = await _getList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.get("/product/:id", async (req: Request, res: Response) => {
   try {
        let data = await find({id: req.params.id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.get("/count", async (req: Request, res: Response) => {
   try {
        let data = await _getCount(req.query);
        res.status(201).json(data)
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: error })

    }
});

router.post('/', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await save(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.put('/product', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await save(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.delete('/product/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await delete_product({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.put('/restore/:id', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await restore_deleted_product({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.get("/stock/:id", async (req: Request, res: Response) => {
   try {
        let data = await find({id: req.params.id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});


router.get("/stockValues/:type", async (req: Request, res: Response) => {
   try {
        let data = await get_stock_values(req.params.type);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.post('/createStockAdjustmentSession', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await create_stock_adjustment_session(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.put('/closeStockAdjustmentSession', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await create_stock_adjustment_session(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.get('/distinctList/:field', hasPermission, async (req: Request, res: Response) => {
    try {
        let data = await get_distinct_field_values({field: req.params.field});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});



// router.get('/lastStockAdjustmentSession', hasPermission, async (req: Request, res: Response) => {
//     try {
//         let data = await get_latest_session({date: req.query.date, created_on: req.query.created_on});
//         res.status(201).json(data)
//     } catch (error) {
//         res.status(500).json({ message: error })

//     }
// });

export default router;
