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
            <title>404 - Not Found</title>
            <style>
                body {
                    font-family: "Arial", sans-serif;
                    background-color: #f4f4f4;
                    text-align: center;
                    padding: 50px;
                }

                h1 {
                    color: #333;
                }

                p {
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>404 - Not Found</h1>
            <p>Maaf, Endpoint yang Anda cari tidak ditemukan.</p>
        </body>
    </html>
`;

router.use("*", (req: Request, res: Response) => {
    if (fs.existsSync(path.join(__dirname, "./views")) === true) {
        if (fs.existsSync(path.join(__dirname, "./views/404.html")) === true) {
            res.sendFile(path.join(__dirname, "./views", "404.html"));
        } else {
            fs.writeFileSync(
                path.join(__dirname, "./views/404.html"),
                htmlIndex
            );
            res.sendFile(path.join(__dirname, "./views", "404.html"));
        }
    } else {
        fs.mkdirSync(path.join(__dirname, "./views"));
        fs.writeFileSync(path.join(__dirname, "./views/404.html"), htmlIndex);
        res.sendFile(path.join(__dirname, "./views", "404.html"));
    }
});
