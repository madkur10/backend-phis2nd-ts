import { Router, Request, Response, NextFunction } from "express";
import {
    sendMedicationCreateRequestService,
    sendMedicationRequestService,
    sendMedicationCreateDispenseService,
    sendMedicationDispenseService,
} from "./medication.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-medication-create-request/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendMedicationCreateRequestService(limit);

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

router.get(
    "/send-medication-request/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendMedicationRequestService(limit);

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

router.get(
    "/send-medication-create-dispense/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendMedicationCreateDispenseService(limit);

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

router.get(
    "/send-medication-dispense/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendMedicationDispenseService(limit);

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