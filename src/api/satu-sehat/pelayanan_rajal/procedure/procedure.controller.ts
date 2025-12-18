import { Router, Request, Response, NextFunction } from "express";
import {
    sendProcedureRadService,
    sendProcedureRadRegistrasiService,
} from "./procedure.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-procedure-rad/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendProcedureRadService(limit);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendService,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/send-procedure-rad/hasil_rad_detail_id/:hasil_rad_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hasil_rad_detail_id: string = req.params.hasil_rad_detail_id;
            const sendService = await sendProcedureRadRegistrasiService(hasil_rad_detail_id);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendService,
            });
        } catch (err) {
            next(err);
        }
    }
);
