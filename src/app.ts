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

import {
    panggilAntrianService,
    updatePanggilanService,
} from "./api/phis2nd/antrian/antrian.service";
import { insertedTicketService } from "./api/it-support/itsupport.service";
import { chatFarmasiKasir } from "./api/chat/chat.service";
import { chatSupportService } from "./api/it-support/itsupport.service";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 bikin HTTP server utk Express & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 10e6, // biar bisa diakses client lain
});

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
    },
);

io.on("connection", async (socket) => {
    const BAGIAN_ID: string = socket.handshake.query.bagian as string;
    console.log(`User dari bagian ${BAGIAN_ID} terhubung`);

    socket.join(BAGIAN_ID);

    socket.on("chat message", async (data) => {
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
    });

    socket.on("chat message support", async (data) => {
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
    })

    socket.on("new_complaint_ticket", async (payload, callback) => {
        const insertedTicket = await insertedTicketService(payload);
        callback(insertedTicket);
        io.to([payload.department_id, payload.bagian_id_support]).emit(
            "new_complaint_ticket",
            insertedTicket,
        );
    });

    socket.on("update_complaint_ticket", async (payload, callback) => {
        callback({
            metadata: { code: 200, message: "Success Update Ticket Status" },
            data: payload,
        });
        io.to([payload.department_id, payload.bagian_id_support]).emit(
            "ticket_updated",
            payload,
        );
    });

    socket.on("disconnect", () => {
        console.log(`User dari bagian ${BAGIAN_ID} terputus`);
    });
});

app.use(notFoundRouter);

// 🔹 error handler
app.use(errLogger);

// 🔹 start server
server.listen(PORT, () => {
    console.log(`✅ Server running on PORT ${PORT} at ${new Date()}`);
});
