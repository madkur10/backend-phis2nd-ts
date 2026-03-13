import rateLimit from "express-rate-limit";
import crypto from "crypto";

export const payloadThrottle = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => {
        const payload = JSON.stringify(req.body);

        return crypto.createHash("sha256").update(payload).digest("hex");
    },
    handler: (req, res) => {
        res.status(429).json({
            status: false,
            message: "Data yang sama dikirim berulang dalam waktu singkat",
        });
    },
});
