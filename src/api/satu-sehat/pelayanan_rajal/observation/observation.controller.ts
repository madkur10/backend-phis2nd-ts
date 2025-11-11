import { Router, Request, Response, NextFunction } from "express";
import {
    sendObservationService,
    sendObservationRegistrasiService,
    sendObservationRadService,
    sendObservationRadOrderService,
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

router.get(
    "/send-observation/emr_detail_id/:emr_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const emr_detail_id: string = req.params.emr_detail_id;
            const sendObservation = await sendObservationRegistrasiService(emr_detail_id);

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
    "/send-observation-rad/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendObservation = await sendObservationRadService(limit);

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
    "/send-observation-rad/hasil_rad_detail_id/:hasil_rad_detail_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hasil_rad_detail_id: string = req.params.hasil_rad_detail_id;
            const sendObservation = await sendObservationRadOrderService(hasil_rad_detail_id);

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
