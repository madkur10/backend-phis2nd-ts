import { Router, Request, Response, NextFunction } from "express";
import {
    sendClinicalImpressionService,
    sendClinicalImpressionEmrService,
} from "./clinicalImpression.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-clinical-impression/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendClinicalImpressionService(limit);

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
    "/send-clinical-impression/emr_detail_id/:emr_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const emr_detail_id: string = req.params.emr_detail_id;
            const sendService = await sendClinicalImpressionEmrService(emr_detail_id);

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
