import express, { Router, Response, Request } from 'express';
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        let data:any[] = [];// await create_stock_adjustment_session(req.body);
        res.status(201).json(data)
    } catch (error) {
        res.status(500).json({ message: error })

    }
});

router.get("/v", async (req: Request, res: Response) => {
    res.status(200).send("welcome!")
});


export default router;
