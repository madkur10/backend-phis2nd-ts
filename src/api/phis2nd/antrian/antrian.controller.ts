import { Router, Request, Response, NextFunction } from "express";
import {
    panggilAntrianService,
    updatePanggilanService,
} from "./antrian.service";

export const router = Router();

router.post(
    "/panggil-antrian",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataPanggilan = await panggilAntrianService(req.body);

            let antrian_panggil;
            if (dataPanggilan) {
                antrian_panggil =
                    dataPanggilan.initial +
                    String(dataPanggilan.no_antrian).padStart(3, "0");

                // Mengambil instance Socket.io yang terpasang di Express app
                const io = req.app.get("io");
                if (io) {
                    io.emit("panggil-antrian", {
                        monitoring_antrian_resep_id:
                            dataPanggilan.monitoring_antrian_resep_id,
                        loket: dataPanggilan.loket,
                        antrian_panggil: antrian_panggil,
                    });
                }

                await updatePanggilanService(req.body);

                res.json({
                    metadata: { code: 200 },
                    data: {
                        monitoring_antrian_resep_id:
                            dataPanggilan.monitoring_antrian_resep_id,
                        loket: dataPanggilan.loket,
                        antrian_panggil: antrian_panggil,
                    },
                });
            } else {
                res.status(404).json({
                    metadata: { code: 404 },
                    message: "Data antrian tidak ditemukan",
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ metadata: { code: 500 }, message: "error" });
        }
    },
);
