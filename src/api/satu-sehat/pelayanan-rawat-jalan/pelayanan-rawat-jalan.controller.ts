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

router.get(
    "/encounter/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: number = parseInt(req.params.limit, 10);
            const generateJob: any = await generateJobEncounterService(limit);

            if (generateJob.code === 200) {
                res.send({
                    metadata: {
                        message: generateJob.message,
                        code: generateJob.code,
                    },
                    data: generateJob.data,
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: generateJob.message,
                        code: generateJob.code,
                    },
                    data: generateJob.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);
