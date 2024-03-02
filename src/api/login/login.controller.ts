import { Router, Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { getLoginUser } from "./login.service";
import { errLogger } from "../../middlewares/error";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
const secretKey: string = process.env.secretKey || "";
export const router = Router();

// router.get("/test-error",async () => {
//     next

// })

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
            const loginUserData = req.body;
            const dataUser = await getLoginUser(loginUserData);

            let token: String | undefined;
            if (dataUser.length > 0) {
                token = jwt.sign(
                    {
                        id: dataUser[0].user_id,
                        username: dataUser[0].user_name,
                    },
                    secretKey,
                    {
                        expiresIn: "1h",
                    }
                );

                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 3600000),
                    httpOnly: true,
                });

                res.send({
                    data: dataUser,
                    token: token,
                    msg: "Login Berhasil!",
                });
            } else {
                res.status(200).json({
                    msg: "Login Gagal!",
                    error: "Periksa kembali username & password!",
                });
            }
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    }
);
