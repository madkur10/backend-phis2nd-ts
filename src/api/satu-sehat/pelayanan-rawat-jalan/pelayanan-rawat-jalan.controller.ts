import { Router, Request, Response, NextFunction } from "express";
import {
    body,
    header,
    param,
    query,
    validationResult,
} from "express-validator";
import * as dotenv from "dotenv";

import {
    generateJobEncounterService,
    generateJobObservationService,
    generateJobConditionService,
} from "./pelayanan-rawat-jalan.service";

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

router.get(
    "/observation/:type_observation/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const type_observation: string = req.params.type_observation;
            const limit: number = parseInt(req.params.limit, 10);
            const generateJob: any = await generateJobObservationService(
                limit,
                type_observation
            );

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

router.get(
    "/condition/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: number = parseInt(req.params.limit, 10);
            const generateJob: any = await generateJobConditionService(
                limit,
            );

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
