import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { insertDataAppointment, getDataAppointment, getListAppointment } from "./appointment.service";

export const router = Router();

router.post(
    "/register-appointment",
    body([
        "patient_id",
        "appointment_date",
        "doctor_id",
        "clinic_id",
        "payer_id",
    ]).notEmpty(),
    body("appointment_date").toDate(),
    body(["patient_id", "doctor_id", "clinic_id", "payer_id"]).toInt(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).send({
                    code: 400,
                    msg: errors.array(),
                });
                return;
            }

            interface dataAppointment {
                patient_id: number;
                doctor_id: number;
                appointment_date: string;
                clinic_id: number;
                payer_id: number;
            }

            const data = await insertDataAppointment(
                req.body as dataAppointment
            );
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    data,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/data-appointments/:patient_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patient_id: number = parseInt(req.params.patient_id);
            const data = await getDataAppointment(patient_id);
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    data,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/list-appointments/:patient_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const patient_id: number = parseInt(req.params.patient_id);
            const data = await getListAppointment(patient_id);
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    data,
                },
            });
        } catch (error) {
            next(error);
        }
    }
)
