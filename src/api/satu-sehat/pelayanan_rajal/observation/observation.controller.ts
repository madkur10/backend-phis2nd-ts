import { Router, Request, Response, NextFunction } from "express";
import {
    sendObservationService,
} from "./observation.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-observation/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendObservationService(limit);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendObservation,
            });
        } catch (err) {
            next(err);
        }
    }
);