import { Router, Request, Response, NextFunction } from "express";
import {
    sendConditionService,
    sendConditionRegistrasiService,
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

router.get(
    "/send-condition/emr_detail_id/:emr_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const emr_detail_id: string = req.params.emr_detail_id;
            const sendCondition = await sendConditionRegistrasiService(emr_detail_id);

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