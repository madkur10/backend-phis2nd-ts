import { Request, Response, NextFunction } from "express";

export function sanitizeInput(str: any): any {
    if (typeof str !== "string") return str;

    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function containsXSS(value: any): boolean {
    if (typeof value !== "string") return false;

    const xssPatterns = [
        /<script.*?>.*?<\/script>/gi, // script tag
        /javascript:/gi, // javascript pseudo-protocol
        /on\w+=/gi, // onClick=, onLoad=, dll
        /<.*?on\w+=.*?>/gi, // tag dengan event handler
        /<iframe.*?>/gi,
        /<img.*?src=.*?>/gi,
        /<.*?src=.*?>/gi,
        /<.*?href=.*?>/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(value));
}

export function sanitizeAndRejectXSS(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.body && typeof req.body === "object") {
        for (const key of Object.keys(req.body)) {
            const value = req.body[key];

            // cek dulu apakah mengandung XSS
            if (containsXSS(value)) {
                next(new Error("Request ditolak, terdeteksi potensi XSS."));
                return;
            }

            // sanitize value
            req.body[key] = sanitizeInput(value);
        }
    }

    next();
}
