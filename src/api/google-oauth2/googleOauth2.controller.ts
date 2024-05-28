import { Router, Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import { getCheckEmail } from "./googleOauth2.service";
import { insertDataUser } from "../users/users.service";

export const router = Router();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID_GOOGLE,
    process.env.CLIENT_SECRET_GOOGLE,
    "http://localhost:4400/api/auth/google/callback"
);

const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    include_granted_scopes: true,
});

router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    res.redirect(authUrl);
});

router.get(
    "/google/callback",
    async (req: Request, res: Response, next: NextFunction) => {
        const code = req.query.code;
        const { tokens } = await oauth2Client.getToken(code as string);
        console.log(tokens);
        
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        if (!data) {
            return res.json({
                metadata: {
                    code: 400,
                    msg: "Data tidak tersedia!",
                },
                response: data,
            });
        }
        const email: string = data.email as string;
        const checkEmail: any = await getCheckEmail(email);

        if (!checkEmail) {
            // res.redirect(`http://localhost:8080?email=${email}&name=${data.name}&`);
            return res.json({
                metadata: {
                    code: 200,
                    msg: "Anda sudah terdaftar!",
                },
                response: data,
            })
        } else {
            return res.json({
                metadata: {
                    code: 200,
                    msg: "Anda sudah terdaftar!",
                },
                response: data,
            })
        }
    }
);
