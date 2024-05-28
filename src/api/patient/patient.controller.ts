import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { insertDataPatient } from "./patient.service";

export const router = Router();

router.post(
    "/register-patient",
    body([
        "name",
        "phone",
        "email",
        "address",
        "identity_number",
        "date_of_birth",
        "gender",
    ]).notEmpty(),
    body("date_of_birth").toDate(),
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

            interface dataPatient {
                name: string;
                phone: string;
                email: string;
                address: string;
                identity_number: string;
                date_of_birth: string;
                gender: string;
            }

            const { name, phone, email, address, identity_number, date_of_birth, gender } = req.body;
            const data = { name, phone, email, address, identity_number, date_of_birth, gender };

            const dataPatient = await insertDataPatient(data);
            if (dataPatient !== null) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        data: dataPatient,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Data tidak tersedia!",
                    },
                });
            }
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    }
);