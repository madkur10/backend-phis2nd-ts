import { Router, Request, Response, NextFunction } from "express";
import { createJobPasien, pushJobService } from "./resources.service";

export const router = Router();

router.get(
    "/create-job-pasien/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: number = parseInt(req.params.limit, 10);
            const statusAntrean = await createJobPasien(limit);

            if (statusAntrean) {
                res.send({
                    response: statusAntrean.data,
                    metadata: {
                        message: statusAntrean.message,
                        code: statusAntrean.code,
                    },
                });
            } else {
                res.status(200).json({
                    response: "",
                    metadata: {
                        message: "Gagal",
                        code: 201,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/push-job/:nama_endpoint/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: number = parseInt(req.params.limit, 10);
            const nama_endpoint = req.params.nama_endpoint;
            const pushJob = await pushJobService(nama_endpoint, limit);

            if (pushJob) {
                res.send({
                    response: pushJob.data,
                    metadata: {
                        message: pushJob.message,
                        code: pushJob.code,
                    },
                });
            } else {
                res.status(200).json({
                    response: "",
                    metadata: {
                        message: "Gagal",
                        code: 201,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);
