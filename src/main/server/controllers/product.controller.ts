import express, { Router, Response, Request } from 'express';
import { extractSqlMessage } from '../helpers/generalHelper';
import { create_stock_adjustment_session, delete_product, find, get_distinct_field_values, get_latest_session, get_stock_values, mass_edit, restore_deleted_product, save, _getCount, _getList } from '../services/product.service';
import { hasPermission } from '../utils/auth';
const router: Router = express.Router();

router.use(hasPermission);
router.get("/", async (req: Request, res: Response) => {
   try {
        let data = await _getList(req.query);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get("/product/:id", async (req: Request, res: Response) => {
   try {
        let data = await find({id: req.params.id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get("/count", async (req: Request, res: Response) => {
   try {
        let data = await _getCount(req.query);
        res.status(201).json(data)
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/',  async (req: Request, res: Response) => {
    try {
        let data = await save(req.body);
        res.status(201).json(data)
    } catch (error:any) {

        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.put('/product',  async (req: Request, res: Response) => {
    try {
        let data = await save(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.delete('/product/:id',  async (req: Request, res: Response) => {
    try {
        let data = await delete_product({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.put('/restore/:id',  async (req: Request, res: Response) => {
    try {
        let data = await restore_deleted_product({id: req.params.id, user_id: req.user_id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get("/stock/:id", async (req: Request, res: Response) => {
   try {
        let data = await find({id: req.params.id});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});


router.get("/stockValues/:type", async (req: Request, res: Response) => {
   try {
        let data = await get_stock_values(req.params.type);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.post('/createStockAdjustmentSession',  async (req: Request, res: Response) => {
    try {
        let data = await create_stock_adjustment_session(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.put('/closeStockAdjustmentSession',  async (req: Request, res: Response) => {
    try {
        let data = await create_stock_adjustment_session(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});

router.get('/distinctList/:field',  async (req: Request, res: Response) => {
    try {
        let data = await get_distinct_field_values({field: req.params.field});
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: extractSqlMessage(error) })

    }
});



// router.get('/lastStockAdjustmentSession',  async (req: Request, res: Response) => {
//     try {
//         let data = await get_latest_session({date: req.query.date, created_on: req.query.created_on});
//         res.status(201).json(data)
//     } catch (error) {
//         res.status(500).json({ message: extractSqlMessage(error) })

//     }
// });

export default router;
