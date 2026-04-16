import { Router, Request, Response, NextFunction } from "express";
import { sendSpecimenService } from "./specimen.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-specimen/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendSpecimenService(limit);

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
