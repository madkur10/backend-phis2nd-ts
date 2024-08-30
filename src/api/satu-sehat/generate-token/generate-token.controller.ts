import { Router, Request, Response, NextFunction } from "express";
import { generateTokenService } from "./generate-token.service";

export const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const generateToken: any = await generateTokenService();

        if (generateToken.code === 200) {
            res.send({
                metadata: {
                    message: generateToken.message,
                    code: generateToken.code,
                },
                data: generateToken.data,
            });
        } else {
            res.status(200).json({
                metadata: {
                    message: generateToken.message,
                    code: generateToken.code,
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
});
