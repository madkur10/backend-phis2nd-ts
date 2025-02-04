import { Router, Request, Response, NextFunction } from "express";
import {
    sendEncounterService,
    getEncounterIdService,
    getEncounterSubjectService,
    sendEncounterRegistrasiService,
} from "./encounter.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/by-id/:id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id: string = req.params.id;
            const getEncounter = await getEncounterIdService(id);

            if (getEncounter.status === 200) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        id: getEncounter.data.id,
                        resources_type: getEncounter.data.resourceType,
                        raw_response: getEncounter.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                    response: getEncounter.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/by-subject/:subject",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const subject: string = req.params.subject;
            const getEncounter = await getEncounterSubjectService(subject);

            if (getEncounter.status === 200) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        total: getEncounter.data.total,
                        entry: getEncounter.data.entry,
                        raw_response: getEncounter.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                    response: getEncounter.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/send-encounter/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendEncounter = await sendEncounterService(limit);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendEncounter,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/send-encounter/registrasi_id/:registrasi_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const registrasi_id: string = req.params.registrasi_id;
            const sendEncounter = await sendEncounterRegistrasiService(registrasi_id);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: sendEncounter,
            });
        } catch (err) {
            next(err);
        }
    }
);
