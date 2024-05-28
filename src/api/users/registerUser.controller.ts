import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { getDataUsername, insertDataUserPatient } from "./users.service";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
export const router = Router();

router.post(
    "/",
    body([
        "username",
        "password",
        "first_name",
        "last_name",
        "patient_name",
        "patient_phone",
        "patient_email",
        "patient_address",
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
                    metadata: {
                        code: 400,
                        msg: "Please check your input!",
                    },
                    errors: errors.array(),
                });
                return;
            }

            interface dataUserPatient {
                username: string;
                password: string;
                first_name: string;
                last_name: string;
                patient_name: string;
                patient_phone: string;
                patient_email: string;
                patient_address: string;
                identity_number: string;
                date_of_birth: string;
                gender: string;
            }

            const {
                username,
                password,
                first_name,
                last_name,
                patient_name,
                patient_phone,
                patient_email,
                patient_address,
                identity_number,
                date_of_birth,
                gender,
            } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const data = {
                username,
                password: hashedPassword,
                first_name,
                last_name,
                patient_name,
                patient_phone,
                patient_email,
                patient_address,
                identity_number,
                date_of_birth,
                gender,
            };

            const dataUser = await insertDataUserPatient(data);
            if (dataUser !== null) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        data: dataUser,
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

router.get(
    "/check-username/:username",
    param("username").notEmpty(),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).send({
                    metadata: {
                        code: 400,
                        msg: errors.array(),
                    },
                });
                return;
            }

            const { username } = req.params;
            const dataUser = await getDataUsername(username);

            if (dataUser !== null) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        data: dataUser,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                });
            }
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    }
);
