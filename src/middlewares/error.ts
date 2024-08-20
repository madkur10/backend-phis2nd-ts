import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export function errLogger(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const dataLog = `${req.method}\t${uuid()}\t${req.ip}\t${
        req.originalUrl
    }\t${Date.now()}\t${new Date()}\t${error}\t${JSON.stringify(req.body)}`;
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
    res.status(error.status || 500).json({
        metadata: {
            msg: error.msg || "Internal Server Error",
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
