import * as dotenv from "dotenv";
dotenv.config();
const secretKey: string = process.env.secretKey!;
const secretKeyLogin: string = process.env.secretKeyLogin!;
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.header("x-key");

    let data: any = {};
    if (token == null) {
        data.metadata = {
            code: 401,
            msg: "Token Tidak Ditemukan",
        };
        data.response = [];
        return res.status(401).json(data);
    }

    jwt.verify(token, secretKey, (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
            data.metadata = {
                code: 403,
                msg: "Token Tidak Sesuai atau token sudah kadarluwarsa",
            };
            data.response = [];
            return res.status(403).json(data);
        }
        req.body.input_user_id = user.id;
        next();
    });
};

const loginAuthentication = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader: string | undefined = req.headers["authorization"];
    const token: string | undefined = authHeader && authHeader.split(" ")[1];

    let data: any = {};
    if (token) {
        if (secretKeyLogin === token) {
            next();
        } else {
            data.metadata = {
                code: 401,
                msg: "Authentication Tidak Sesuai",
            };
            data.response = [];
            return res.status(401).json(data);
        }
    } else {
        data.metadata = {
            code: 401,
            msg: "Authentication Tidak Ditemukan",
        };
        data.response = [];
        return res.status(401).json(data);
    }
};

export { authenticateToken, loginAuthentication };
