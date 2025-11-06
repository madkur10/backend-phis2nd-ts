import { Router, Request, Response, NextFunction } from "express";
import {
    sendDiagnosticReportService,
    sendDiagnosticReportOrderRadService,
} from "./diagnosticReport.service";
import { body, param, validationResult } from "express-validator";

export const router = Router();

router.get(
    "/send-diagnostic-report-rad/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const sendService = await sendDiagnosticReportService(limit);

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
    "/send-diagnostic-report-rad/hasil_rad_id/:hasil_rad_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const hasil_rad_id: string = req.params.hasil_rad_id;
            const sendService = await sendDiagnosticReportOrderRadService(
                hasil_rad_id
            );

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
