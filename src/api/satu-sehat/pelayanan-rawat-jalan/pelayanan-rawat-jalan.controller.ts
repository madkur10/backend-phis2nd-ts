import { Router, Request, Response, NextFunction } from "express";
import {
    body,
    header,
    param,
    query,
    validationResult,
} from "express-validator";
import * as dotenv from "dotenv";

import { generateJobEncounterService } from "./pelayanan-rawat-jalan.service";

dotenv.config();
export const router = Router();

router.post(
    "/encounter",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const generateJob: any = await generateJobEncounterService();

            if (generateJob.code === 200) {
                res.send({
                    metadata: {
                        message: generateJob.message,
                        code: generateJob.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: generateJob.message,
                        code: generateJob.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);
