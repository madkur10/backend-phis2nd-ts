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
import { sanitizeAndRejectXSS } from "./utils/sanitize";

import { insertedTicketService } from "./api/it-support/itsupport.service";
import { chatFarmasiKasir } from "./api/chat/chat.service";
import { chatSupportService } from "./api/it-support/itsupport.service";
import { disconnectAll } from "./db";
import { router as farmasiMerialRouter } from "./api/phis2nd/antrian/antrian.controller";
import { initAntrolCron } from "./api/antrol-auto/antrolAuto.cron";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 bikin HTTP server utk Express & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 10e6, // biar bisa diakses client lain
});

app.set("io", io);

// 🔹 middlewares
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(sanitizeAndRejectXSS);
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

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
app.use("/farmasi-merial", farmasiMerialRouter);

io.on("connection", async (socket) => {
    const BAGIAN_ID: string = socket.handshake.query.bagian as string;
    const PROFESI_ID: string = socket.handshake.query.profesi as string;
    // console.log(`User dari bagian ${BAGIAN_ID} terhubung`);

    if (BAGIAN_ID) {
        socket.join(BAGIAN_ID);
    }
    if (PROFESI_ID) {
        socket.join(`profesi_${PROFESI_ID}`);
    }

    socket.on("chat message", async (data) => {
        try {
            const chatData = await chatFarmasiKasir(data);
            if (chatData?.code === 200) {
                const rooms = [data.bagian_id_tertuju, data.bagian_id_pengirim];
                data.chat_detail_id = chatData.chat_detail_id;
                data.nama_pasien = chatData.nama_pasien;
                data.no_mr = chatData.no_mr;

                io.to(rooms).emit("chat message", data);
            } else {
                io.to(data.bagian_id_pengirim).emit("chat message", {
                    ...data,
                    message: "Gagal mengirim pesan",
                });
            }
        } catch (err) {
            console.error("Error pada socket event 'chat message':", err);
            io.to(data.bagian_id_pengirim).emit("chat message", {
                ...data,
                message: "Gagal mengirim pesan karena terjadi kesalahan internal",
            });
        }
    });

    socket.on("chat message support", async (data) => {
        try {
            const chatDataSupport = await chatSupportService(data);
            if (chatDataSupport?.code === 200) {
                const rooms = [data.bagian_id_tertuju, data.bagian_id_pengirim];
                io.to(rooms).emit("chat message support", chatDataSupport.data);
            } else {
                io.to(data.bagian_id_pengirim).emit("chat message support", {
                    ...data,
                    message: "Gagal mengirim pesan",
                });
            }
        } catch (err) {
            console.error("Error pada socket event 'chat message support':", err);
            io.to(data.bagian_id_pengirim).emit("chat message support", {
                ...data,
                message: "Gagal mengirim pesan karena terjadi kesalahan internal",
            });
        }
    });

    socket.on("new_complaint_ticket", async (payload, callback) => {
        try {
            const insertedTicket = await insertedTicketService(payload);
            if (typeof callback === "function") {
                callback(insertedTicket);
            }
            io.to([payload.department_id, payload.bagian_id_support]).emit(
                "new_complaint_ticket",
                insertedTicket,
            );
        } catch (err) {
            console.error("Error pada socket event 'new_complaint_ticket':", err);
            if (typeof callback === "function") {
                callback({
                    metadata: { code: 500, message: "Terjadi kesalahan internal server" }
                });
            }
        }
    });

    socket.on("update_complaint_ticket", async (payload, callback) => {
        try {
            if (typeof callback === "function") {
                callback({
                    metadata: { code: 200, message: "Success Update Ticket Status" },
                    data: payload,
                });
            }
            io.to([payload.department_id, payload.bagian_id_support]).emit(
                "ticket_updated",
                payload,
            );
        } catch (err) {
            console.error("Error pada socket event 'update_complaint_ticket':", err);
        }
    });

    socket.on("emergency_code", (payload) => {
        try {
            const isTargeted = payload.target_profesi && payload.target_profesi !== 'all';
            if (isTargeted) {
                // target_profesi is a comma-separated list of profession IDs, e.g. "3,6"
                const targets = payload.target_profesi.split(',');
                const rooms = targets.map((p: string) => `profesi_${p.trim()}`);
                
                // Selalu sertakan TV Display Monitor di koridor
                rooms.push("profesi_TV_MONITOR");

                // Kirimkan ke semua target profesi
                io.to(rooms).emit("emergency_code", payload);
            } else {
                // Kirimkan ke seluruh client jika 'all'
                io.emit("emergency_code", payload);
            }
        } catch (err) {
            console.error("Error pada socket event 'emergency_code':", err);
        }
    });

    socket.on("emergency_ack", (payload) => {
        try {
            io.emit("emergency_ack", payload);
        } catch (err) {
            console.error("Error pada socket event 'emergency_ack':", err);
        }
    });

    socket.on("emergency_resolve", (payload) => {
        try {
            io.emit("emergency_resolve", payload);
        } catch (err) {
            console.error("Error pada socket event 'emergency_resolve':", err);
        }
    });

    socket.on("emergency_video_update", (payload) => {
        try {
            io.emit("emergency_video_update", payload);
        } catch (err) {
            console.error("Error pada socket event 'emergency_video_update':", err);
        }
    });

    socket.on("disconnect", () => {
        // console.log(`User dari bagian ${BAGIAN_ID} terputus`);
    });
});

app.use(notFoundRouter);

// 🔹 error handler
app.use(errLogger);

// 🔹 start server
server.listen(PORT, () => {
    console.log(`✅ Server running on PORT ${PORT} at ${new Date()}`);
    initAntrolCron();
});

const handleShutdown = async (signal: string) => {
    console.log(`\n🚨 Received ${signal}. Starting graceful shutdown...`);
    await disconnectAll();
    process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGUSR2", async () => {
    await disconnectAll();
    process.kill(process.pid, "SIGUSR2");
});
