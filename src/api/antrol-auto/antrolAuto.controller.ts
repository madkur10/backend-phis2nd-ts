import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
    hitFisioNow
} from "./antrolAuto.service";

export const router = Router();

router.get("/fisio-now/:limit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number= parseInt(req.params.limit, 10);
        const dataFisio = await hitFisioNow(limit);
        if (dataFisio.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataFisio,
                },
            });
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})