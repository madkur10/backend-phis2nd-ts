import { Router, Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import { findEmail } from "./../patient/patient.service";

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

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
router.post(
    "/forgot-password",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Email required!",
                    },
                });
            }

            const checkEmail = await findEmail(email);
            if (!checkEmail) {
                return res.status(400).json({
                    metadata: {
                        code: 400,
                        msg: "Email not found!",
                    },
                });
            }

            const secretKey: string = process.env.secretKey || "";
            const token = jwt.sign({ email }, secretKey, {
                expiresIn: "15m",
            });

            let resetUrl = `http://localhost:8080/form-forgot-password?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Forgot Password",
                html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Thank you,</p>
        <p>Your Company Name</p>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        metadata: {
                            code: 500,
                            msg: "Failed to send email!",
                        },
                    });
                } else {
                    console.log("Email sent: " + info.response);
                    return res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Email sent!",
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
