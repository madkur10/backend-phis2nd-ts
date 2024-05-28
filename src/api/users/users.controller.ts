import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
    getDataUser,
    insertDataUser,
} from "./users.service";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
export const router = Router();

router.get(
    "/:id",
    param("id").isInt().toInt(),
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

            const idUser: number = parseInt(req.params.id);
            const dataUser = await getDataUser(idUser);
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

router.post(
    "/",
    body([
        "username",
        "password",
        "first_name",
        "last_name",
        "email",
    ]).notEmpty(),
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

            interface dataUsers {
                username: string;
                password: string;
                first_name: string;
                last_name: string;
                email: string;
            }

            const { username, password, first_name, last_name, email } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const data = {
                username,
                password: hashedPassword,
                first_name,
                last_name,
                email,
            }

            const dataUser = await insertDataUser(data);
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
