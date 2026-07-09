import { Request, Response, NextFunction } from "express";

export function sanitizeInput(value: any): any {
    if (typeof value === "string") {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeInput(item));
    }
    if (value && typeof value === "object") {
        const sanitizedObj: any = {};
        for (const key of Object.keys(value)) {
            sanitizedObj[key] = sanitizeInput(value[key]);
        }
        return sanitizedObj;
    }
    return value;
}

export function containsXSS(value: any): boolean {
    if (typeof value === "string") {
        const xssPatterns = [
            /<script.*?>.*?<\/script>/gi, // script tag
            /javascript:/gi, // javascript pseudo-protocol
            /<.*?on\w+=.*?>/gi, // tag dengan event handler (misal <img onload=...>)
            /<iframe.*?>/gi,
            /<img.*?src=.*?>/gi,
            /<.*?src=.*?>/gi,
            /<.*?href=.*?>/gi,
        ];

        return xssPatterns.some((pattern) => pattern.test(value));
    }
    if (Array.isArray(value)) {
        return value.some((item) => containsXSS(item));
    }
    if (value && typeof value === "object") {
        return Object.values(value).some((val) => containsXSS(val));
    }
    return false;
}

export function sanitizeAndRejectXSS(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (req.body && typeof req.body === "object") {
        // Cek dulu secara rekursif apakah mengandung XSS
        if (containsXSS(req.body)) {
            next(new Error("Request ditolak, terdeteksi potensi XSS."));
            return;
        }

        // Sanitize value secara rekursif
        req.body = sanitizeInput(req.body);
    }

    next();
}
