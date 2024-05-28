import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { getLoginUser } from "./login.service";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();
const secretKey: string = process.env.secretKey || "";
export const router = Router();

router.post(
    "/",
    [body(["username", "password"]).notEmpty()],
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
            const { username, password } = req.body;
            const dataUser = await getLoginUser(username);

            let tokenJwt: String | undefined;
            if (dataUser) {
                const inputPassword = await bcrypt.compare(
                    password,
                    dataUser.password
                );
                if (inputPassword === true) {
                    tokenJwt = jwt.sign(
                        {
                            id: dataUser.user_id,
                            username: dataUser.user_name,
                        },
                        secretKey,
                        {
                            expiresIn: "1h",
                        }
                    );

                    res.cookie("jwt", tokenJwt, {
                        expires: new Date(Date.now() + 15 * 60000),
                        httpOnly: true,
                    });
                    const { password, ...dataUserEnd } = dataUser;
                    res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Login Berhasil!",
                        },
                        response: {
                            data: dataUserEnd,
                            token: tokenJwt,
                        },
                    });
                } else {
                    res.status(200).json({
                        metadata: {
                            code: 201,
                            msg: "Login Gagal!",
                        },
                        response: {
                            error: "Password anda tidak sesuai!",
                        },
                    });
                }
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Login Gagal!",
                    },
                    response: {
                        error: "Username anda tidak sesuai!",
                    },
                });
            }
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    }
);
