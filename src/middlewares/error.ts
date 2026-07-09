import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

function maskSensitiveFields(body: any): string {
    if (!body || typeof body !== "object") return JSON.stringify(body);
    
    const masked = { ...body };
    const sensitiveKeys = ["password", "token", "access_token", "secretkey", "secret"];
    
    for (const key of Object.keys(masked)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            masked[key] = "********";
        }
    }
    return JSON.stringify(masked);
}

export async function errLogger(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const errorDetails = error.stack || error.message || error;
    const bodyLog = maskSensitiveFields(req.body);
    const dataLog = `${req.method}\t${uuid()}\t${req.ip}\t${
        req.originalUrl
    }\t${Date.now()}\t${new Date()}\t${errorDetails}\t${bodyLog}`;
    
    const pathFolderLog = path.join(__dirname, "../log/error");
    const filePath = path.join(pathFolderLog, `log_${getCurrentDate()}.txt`);

    try {
        // Membuat direktori secara asinkron jika belum ada
        await fs.mkdir(pathFolderLog, { recursive: true });
        // Menulis/menambahkan log ke file secara asinkron (non-blocking)
        await fs.appendFile(filePath, `\n${dataLog}`);
    } catch (err) {
        console.error("Gagal menulis log error:", err);
    }

    res.status(error.status || 500).json({
        metadata: {
            msg: error.msg || error.message || "Internal Server Error",
            code: error.code || 500,
        },
    });
}

function getCurrentDate() {
    const currentDate: Date = new Date();

    const year: number = currentDate.getUTCFullYear();
    let month: number | string = currentDate.getUTCMonth() + 1;
    month = month < 10 ? "0" + month : month;

    let day: number | string = currentDate.getUTCDate();
    day = day < 10 ? "0" + day : day;

    const formattedDate: string = `${year}-${month}-${day}`;

    return formattedDate;
}
