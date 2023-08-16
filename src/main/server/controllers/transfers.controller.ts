import express, { Router, Response, Request } from 'express';
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    res.status(200).send("welcome!")
})

export default router;