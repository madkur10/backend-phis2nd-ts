import { Router, Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const router = Router();

router.post(
    "/validate-token",
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.body.token;
            if (!token) {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Token required!",
                    },
                });
            }

            const secretKey: string = process.env.secretKey || "";
            if (typeof token !== "string" || token.trim() === "") {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Invalid token format!",
                    },
                });
            }

            jwt.verify(token, secretKey, (err: any, decoded: any) => {
                if (err) {
                    if (err instanceof TokenExpiredError) {
                        // Token telah kedaluwarsa
                        return res.status(401).json({
                            metadata: {
                                code: 401,
                                msg: "Token expired!",
                            },
                        });
                    } else {
                        // Token tidak valid atau terjadi kesalahan lainnya
                        return res.status(401).json({
                            metadata: {
                                code: 401,
                                msg: "Invalid token!",
                            },
                        });
                    }
                } else {
                    // Token valid
                    return res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Token valid!",
                        },
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    "/check-token-password",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.body.token;
            if (!token) {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Token required!",
                    },
                });
            }

            const secretKey: string = process.env.secretKey || "";
            if (typeof token !== "string" || token.trim() === "") {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Invalid token format!",
                    },
                });
            }

            jwt.verify(token, secretKey, (err: any, decoded: any) => {
                if (err) {
                    if (err instanceof TokenExpiredError) {
                        // Token telah kedaluwarsa
                        return res.status(401).json({
                            metadata: {
                                code: 401,
                                msg: "Token expired!",
                            },
                        });
                    } else {
                        // Token tidak valid atau terjadi kesalahan lainnya
                        return res.status(401).json({
                            metadata: {
                                code: 401,
                                msg: "Invalid token!",
                            },
                        });
                    }
                } else {
                    // Token valid
                    return res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Token valid!",
                        },
                    });
                }
            });
        } catch (error) {
            next(error);
        }
    }
);
