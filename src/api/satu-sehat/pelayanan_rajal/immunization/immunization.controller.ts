import { Router, Request, Response, NextFunction } from "express";
import { sendImmunizationService } from "./immunization.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-immunization/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendImmunizationService(limit);

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
    },
);
