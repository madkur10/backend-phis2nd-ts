import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
    getAllUsers,
    getDataUser,
    insertDataUser,
    getDataNameUser,
} from "./users.service";
import * as dotenv from "dotenv";

dotenv.config();
export const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dataUser = await getAllUsers();
        if (dataUser.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataUser,
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
});

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

router.get(
    "/byName/:name",
    param("name").isString(),
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

            const nameUser: string | any = req.params.name;
            const dataUser = await getDataNameUser(nameUser);
            if (dataUser.length > 0) {
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
        "user_name",
        "user_password",
        "nama_pegawai",
        "pegawai_id",
    ]).notEmpty(),
    body("pegawai_id").toInt(),
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
                input_user_id: number;
                user_name: string;
                user_password: string;
                nama_pegawai: string;
                pegawai_id: number;
            }

            const data: dataUsers = req.body;
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
