import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export function errLogger(req: Request, res: Response, next: NextFunction, error: any) {
    const dataLog = `${req.method} | ${req.ip} | ${
        req.originalUrl
    } | ${Date.now()} | ${new Date()} | ${error}`;
    const pathFolderLog = path.join(__dirname, "../log");
    const filePath = `${pathFolderLog}/error/log_${getCurrentDate()}.txt`;

    if (fs.existsSync(pathFolderLog) === true) {
        if (fs.existsSync(`${pathFolderLog}/error`) === true) {
            if (fs.existsSync(filePath) === true) {
                fs.appendFileSync(filePath, `\n${dataLog}`);
            } else {
                fs.writeFileSync(filePath, dataLog);
            }
        } else {
            fs.mkdirSync(`${pathFolderLog}/error`, { recursive: true });
            fs.writeFileSync(filePath, dataLog);
        }
    } else {
        fs.mkdirSync(`${pathFolderLog}/error`, { recursive: true });
        fs.writeFileSync(filePath, dataLog);
    }
    next();
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
