import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken } from "../../../middlewares/auth";
import { verifikasiPasienService, daftarPasienService } from "./registrasi.service";

export const router = Router();

/**
 * @route POST /api/phis2nd/registrasi/verifikasi
 * @desc Verifikasi data pasien berdasarkan No MR dan Tanggal Lahir (Protected)
 */
router.post(
    "/verifikasi",
    authenticateToken,
    [
        body("noMr").notEmpty().withMessage("noMr wajib diisi"),
        body("tanggalLahir").notEmpty().withMessage("tanggalLahir wajib diisi"),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                metadata: { code: 400, message: "Validasi Gagal" },
                response: errors.array(),
            });
            return;
        }

        try {
            const { noMr, tanggalLahir } = req.body;
            const result = await verifikasiPasienService(noMr, tanggalLahir);

            if (result.status) {
                res.status(200).json({
                    metadata: { code: 200, message: "Verifikasi Berhasil" },
                    response: {
                        status: true,
                        nama_pasien: result.nama_pasien,
                        email: result.email,
                        penjamin: result.penjamin, // Array of guarantors
                    },
                });
            } else {
                res.status(200).json({
                    metadata: { code: 201, message: "Verifikasi Gagal" },
                    response: {
                        status: false,
                        message: result.message || "Data pasien tidak sesuai",
                    },
                });
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route POST /api/phis2nd/registrasi/daftar
 * @desc Pendaftaran pasien ke klinik/dokter tertentu (Protected)
 */
router.post(
    "/daftar",
    authenticateToken,
    [
        body("noMr").notEmpty().withMessage("noMr wajib diisi"),
        body("kodeKlinik").notEmpty().withMessage("kodeKlinik wajib diisi"),
        body("kodeDokter").notEmpty().withMessage("kodeDokter wajib diisi"),
        body("tanggalDaftar").notEmpty().withMessage("tanggalDaftar wajib diisi"),
        body("kodePenjamin").notEmpty().withMessage("kodePenjamin (pasien_nasabah_id) wajib diisi"),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                metadata: { code: 400, message: "Validasi Gagal" },
                response: errors.array(),
            });
            return;
        }

        try {
            const { noMr, kodeKlinik, kodeDokter, tanggalDaftar, kodePenjamin } = req.body;
            const result = await daftarPasienService({
                noMr,
                kodeKlinik: parseInt(kodeKlinik, 10),
                kodeDokter: parseInt(kodeDokter, 10),
                tanggalDaftar,
                kodePenjamin: parseInt(kodePenjamin, 10),
            });

            if (result.status) {
                res.status(200).json({
                    metadata: { code: 200, message: "Pendaftaran Berhasil" },
                    response: result.data,
                });
            } else {
                res.status(200).json({
                    metadata: { code: 201, message: "Pendaftaran Gagal" },
                    response: {
                        message: result.message || "Gagal melakukan pendaftaran",
                    },
                });
            }
        } catch (error) {
            next(error);
        }
    }
);
