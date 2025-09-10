import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import { router as welcomeRouter } from "./welcome";
import { router as notFoundRouter } from "./404";
import { router as apiRouter } from "./api/index";
import { logger, credentials, errLogger } from "./middlewares";
import { corsOptions } from "./config/corsOption";
import cookieParser from "cookie-parser";

import {
    panggilAntrianService,
    updatePanggilanService,
} from "./api/phis2nd/antrian/antrian.service";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 bikin HTTP server utk Express & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }, // biar bisa diakses client lain
});

// 🔹 middlewares
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// 🔹 CORS manual (opsional kalau corsOptions sudah cukup)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🔹 routes
app.use("/", welcomeRouter);
app.use("/api", apiRouter);
app.post(
    "/farmasi-merial/panggil-antrian",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataPanggilan = await panggilAntrianService(req.body);

            let antrian_panggil;
            if (dataPanggilan) {
                antrian_panggil =
                    dataPanggilan.initial +
                    String(dataPanggilan.no_antrian).padStart(3, "0");
                io.emit("panggil-antrian", {
                    monitoring_antrian_resep_id:
                        dataPanggilan.monitoring_antrian_resep_id,
                    loket: dataPanggilan.loket,
                    antrian_panggil: antrian_panggil,
                });

                const updatePanggilan = await updatePanggilanService(req.body);

                res.json({
                    metadata: { code: 200 },
                    data: {
                        monitoring_antrian_resep_id:
                            dataPanggilan.monitoring_antrian_resep_id,
                        loket: dataPanggilan.loket,
                        antrian_panggil: antrian_panggil,
                    },
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ metadata: { code: 500 }, message: "error" });
        }
    }
);
app.use(notFoundRouter);

// 🔹 error handler
app.use(errLogger);

// 🔹 start server
server.listen(PORT, () => {
    console.log(`✅ Server running on PORT ${PORT} at ${new Date()}`);
});
