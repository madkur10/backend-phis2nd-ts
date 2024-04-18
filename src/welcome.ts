import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

export const router = Router();

const htmlIndex = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Welcome to Bridging BPJS</title>
        </head>
        <body>
            <div class="welcome-container">
                <h1>Welcome to Backend Phis2nd</h1>
                <p>Discover something amazing</p>
            </div>
        </body>
    </html>
`;

router.get("/", (req: Request, res: Response) => {
    if (fs.existsSync(path.join(__dirname, "./views")) === true) {
        fs.writeFileSync(path.join(__dirname, "./views/index.html"), htmlIndex);
        res.sendFile(path.join(__dirname, "./views", "index.html"));
    } else {
        fs.mkdirSync(path.join(__dirname, "./views"));
        fs.writeFileSync(path.join(__dirname, "./views/index.html"), htmlIndex);
        res.sendFile(path.join(__dirname, "./views", "index.html"));
    }
});
