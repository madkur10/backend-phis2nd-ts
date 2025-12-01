import { Router, Request, Response, NextFunction } from "express";
import {
    sendAllergyIntoleranceService,
    sendAllergyIntoleranceRegistrasiService,
} from "./allergyIntolerance.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-allergy-intolerance/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendAllergyIntoleranceService(limit);

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
    "/send-allergy-intolerance/registrasi_id/:registrasi_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const registrasi_id: string = req.params.registrasi_id;
            const sendService = await sendAllergyIntoleranceRegistrasiService(registrasi_id);

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
