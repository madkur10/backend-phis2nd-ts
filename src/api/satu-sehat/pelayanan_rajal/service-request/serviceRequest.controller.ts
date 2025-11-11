import { Router, Request, Response, NextFunction } from "express";
import {
    sendServRequestRadService,
    sendServRequestOrderRadService,
} from "./serviceRequest.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-service-request-rad/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendServRequestRadService(limit);

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
    "/send-service-request-rad/hasil_rad_detail_id/:hasil_rad_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hasil_rad_detail_id: string = req.params.hasil_rad_detail_id;
            const sendService = await sendServRequestOrderRadService(hasil_rad_detail_id);

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
