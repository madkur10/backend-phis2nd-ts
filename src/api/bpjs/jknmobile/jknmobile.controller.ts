import { Router, Request, Response, NextFunction } from "express";
import {
    body,
    header,
    param,
    query,
    validationResult,
} from "express-validator";
import * as dotenv from "dotenv";
import { authenticateToken } from "./../../../middlewares/auth";
import jwt from "jsonwebtoken";
const secretKey: string = process.env.secretKey || "";

import { getLoginUser } from "./../../login/login.service";
import {
    statusAntreanService,
    daftarPerjanjianService,
    sisaAntreanService,
    batalAntreanService,
    checkInService,
    pasienBaruService,
    listJadwalOperasiService,
    jadwalOperasiService,
} from "./jknmobile.service";
import { checkDpjpHfis, checkPoliHfis } from "./jknmobile.repository";

dotenv.config();
export const router = Router();

router.get(
    "/get-auth",
    [header(["x-username", "x-password"]).notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(201).send({
                response: errors.array(),
                metadata: {
                    code: 400,
                    message: "Validation error",
                },
            });
            return;
        }

        try {
            const username: string | any = req.headers["x-username"];
            const password: string | any = req.headers["x-password"];
            const data: any = {
                username: username,
                password: password,
            };

            const dataUser = await getLoginUser(data);

            let token: String | undefined;
            if (dataUser) {
                token = jwt.sign(
                    {
                        id: dataUser.user_id,
                        username: dataUser.user_name,
                    },
                    secretKey,
                    {
                        expiresIn: "1h",
                    }
                );

                res.cookie("jwt", token, {
                    expires: new Date(Date.now() + 3600000),
                    httpOnly: true,
                });

                res.send({
                    response: {
                        token: token,
                    },
                    metadata: {
                        message: "Ok",
                        code: 200,
                    },
                });
            } else {
                res.status(200).json({
                    response: "",
                    metadata: {
                        message:
                            "Login Gagal! Mohon periksa kembali username dan password anda.",
                        code: 201,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/status-antrean",
    authenticateToken,
    [
        body("kodepoli")
            .notEmpty()
            .custom(async (value) => {
                const poli_hfis = await checkPoliHfis(value);

                if (!poli_hfis) {
                    return Promise.reject(
                        "Kode Poli Tidak Terdaftar Di SIMRS!"
                    );
                }
            }),
        body("kodedokter")
            .notEmpty()
            .custom(async (value) => {
                value = value.toString();
                const dpjp_hfis = await checkDpjpHfis(value);

                if (!dpjp_hfis) {
                    return Promise.reject(
                        "Kode Dokter Tidak Terdaftar Di SIMRS!"
                    );
                }
            }),
        body("tanggalperiksa").isISO8601(),
        body("jampraktek").notEmpty(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(200).send({
                response: errors.array(),
                metadata: {
                    code: 400,
                    message: "Validation error",
                },
            });
            return;
        }

        try {
            const statusAntrean = await statusAntreanService(req.body);

            if (statusAntrean) {
                res.send({
                    response: statusAntrean,
                    metadata: {
                        message: "Ok",
                        code: 200,
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

router.post(
    "/daftar-perjanjian",
    authenticateToken,
    [
        body("nomorkartu").notEmpty(),
        body("nik").notEmpty(),
        body("nohp").notEmpty(),
        body("kodepoli")
            .notEmpty()
            .custom(async (value, { req }) => {
                const poli_hfis: any = await checkPoliHfis(value);

                if (poli_hfis.length == 0) {
                    return Promise.reject(
                        "Kode Poli Tidak Terdaftar Di SIMRS!"
                    );
                } else {
                    req.body.bagian_id = poli_hfis[0].bagian_id;
                }
            }),
        body("tanggalperiksa").notEmpty().isISO8601(),
        body("kodedokter")
            .notEmpty()
            .custom(async (value, { req }) => {
                value = value.toString();
                const dpjp_hfis = await checkDpjpHfis(value);

                if (!dpjp_hfis) {
                    return Promise.reject(
                        "Kode Dokter Tidak Terdaftar Di SIMRS!"
                    );
                } else {
                    req.body.dokter_id = dpjp_hfis.user_id;
                }
            }),
        body("jeniskunjungan").notEmpty(),
        body("nomorreferensi").notEmpty(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const createRegistrasi: any = await daftarPerjanjianService(
                req.body
            );

            if (createRegistrasi.code === 200) {
                res.send({
                    response: createRegistrasi.data,
                    metadata: {
                        message: createRegistrasi.message,
                        code: createRegistrasi.code,
                    },
                });
            } else {
                res.status(200).json({
                    response: "",
                    metadata: {
                        message: createRegistrasi.message,
                        code: createRegistrasi.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/sisa-antrean",
    authenticateToken,
    [body("kodebooking").notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const sisaAntrean: any = await sisaAntreanService(req.body);

            if (sisaAntrean.code === 200) {
                res.send({
                    response: sisaAntrean.data,
                    metadata: {
                        message: sisaAntrean.message,
                        code: sisaAntrean.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: sisaAntrean.message,
                        code: 201,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/batal-antrean",
    authenticateToken,
    [body("kodebooking").notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const batalAntrean: any = await batalAntreanService(req.body);

            if (batalAntrean.code === 200) {
                res.send({
                    metadata: {
                        message: batalAntrean.message,
                        code: batalAntrean.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: batalAntrean.message,
                        code: batalAntrean.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/check-in",
    authenticateToken,
    [body("kodebooking").notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const checkIn: any = await checkInService(req.body);

            if (checkIn.code === 200) {
                res.send({
                    metadata: {
                        message: checkIn.message,
                        code: checkIn.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: checkIn.message,
                        code: checkIn.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/pasien-baru",
    authenticateToken,
    [
        body("nomorkartu").notEmpty(),
        body("nik").notEmpty(),
        body("nomorkk").notEmpty(),
        body("nama").notEmpty(),
        body("jeniskelamin").notEmpty(),
        body("tanggallahir").notEmpty(),
        body("nohp").notEmpty(),
        body("alamat").notEmpty(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const pasienBaru: any = await pasienBaruService(req.body);
            if (pasienBaru.code === 200) {
                res.send({
                    response: {
                        norm: pasienBaru.norm,
                    },
                    metadata: {
                        message: pasienBaru.message,
                        code: pasienBaru.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: pasienBaru.message,
                        code: pasienBaru.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/list-jadwal-operasi",
    authenticateToken,
    [
        body("tanggalawal").notEmpty().isISO8601(),
        body("tanggalakhir")
            .notEmpty()
            .isISO8601()
            .custom((value, { req }) => {
                if (new Date(value) < new Date(req.body.tanggalawal)) {
                    throw new Error(
                        "Tanggal akhir tidak boleh lebih kecil dari tanggal awal"
                    );
                }
                return true;
            }),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const listJadwalOperasi: any = await listJadwalOperasiService(
                req.body
            );
            if (listJadwalOperasi.code === 200) {
                res.send({
                    response: {
                        list: listJadwalOperasi.data,
                    },
                    metadata: {
                        message: listJadwalOperasi.message,
                        code: listJadwalOperasi.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: listJadwalOperasi.message,
                        code: listJadwalOperasi.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/jadwal-operasi",
    authenticateToken,
    [body("nopeserta").notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(200).send({
                    response: errors.array(),
                    metadata: {
                        code: 400,
                        message: "Validation error",
                    },
                });
                return;
            }

            const jadwalOperasi: any = await jadwalOperasiService(req.body);
            if (jadwalOperasi.code === 200) {
                res.send({
                    response: {
                        list: jadwalOperasi.data,
                    },
                    metadata: {
                        message: jadwalOperasi.message,
                        code: jadwalOperasi.code,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        message: jadwalOperasi.message,
                        code: jadwalOperasi.code,
                    },
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/ambil-antrean-farmasi",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send({
                msg: "test success!",
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/status-antrean-farmasi",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send({
                msg: "test success!",
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/rekap-antrian",
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send({
                msg: "test success!",
            });
        } catch (err) {
            next(err);
        }
    }
);
