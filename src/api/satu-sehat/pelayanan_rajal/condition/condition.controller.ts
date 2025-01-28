import { Router, Request, Response, NextFunction } from "express";
import {
    sendConditionService,
} from "./condition.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-condition/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendCondition = await sendConditionService(limit);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendCondition,
            });
        } catch (err) {
            next(err);
        }
    }
);