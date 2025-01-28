import { Router, Request, Response, NextFunction } from "express";
import {
    createJobPasien,
    pushJobService,
    createJobPractitioner,
    getPatientNikService,
    getPatientSendAllService,
    getPractitionerNikService,
    getPractitionerSendAllService,
    createOrganizationService,
    getOrganizationIdService,
    getOrganizationPartofService,
    createLocationService,
    getLocationIdService,
} from "./resources.service";
import { body, param, validationResult } from "express-validator";

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
    "/create-job-practitioner/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: number = parseInt(req.params.limit, 10);
            const statusAntrean = await createJobPractitioner(limit);

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

router.get(
    "/patient/nik/:nik",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nik: string = req.params.nik;
            const patientByNik = await getPatientNikService(nik);

            if (patientByNik.status === 200) {
                if (patientByNik.data.total === 0) {
                    res.status(200).json({
                        metadata: {
                            code: 201,
                            msg: "Data tidak tersedia!",
                        },
                        response: patientByNik.data,
                    });
                } else {
                    res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Operation completed successfully!",
                        },
                        response: {
                            patient_ihs_id:
                                patientByNik.data.entry[0].resource.id,
                            resources_type:
                                patientByNik.data.entry[0].resource
                                    .resourceType,
                            raw_response: patientByNik.data,
                        },
                    });
                }
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                    response: patientByNik.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/patient/send-all/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const patientByNik = await getPatientSendAllService(limit);

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: patientByNik,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/get-practitioner-nik/:nik",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nik: string = req.params.nik;
            const practitionerByNik = await getPractitionerNikService(nik);

            if (practitionerByNik.status === 200) {
                if (practitionerByNik.data.total === 0) {
                    res.status(200).json({
                        metadata: {
                            code: 201,
                            msg: "Data tidak tersedia!",
                        },
                        response: practitionerByNik.data,
                    });
                } else {
                    res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Operation completed successfully!",
                        },
                        response: {
                            practitioner_ihs_id:
                                practitionerByNik.data.entry[0].resource.id,
                            resources_type:
                                practitionerByNik.data.entry[0].resource
                                    .resourceType,
                            raw_response: practitionerByNik.data,
                        },
                    });
                }
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                    response: practitionerByNik.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/practitioner/nik/:nik",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nik: string = req.params.nik;
            const practitionerByNik = await getPractitionerNikService(nik);

            if (practitionerByNik.status === 200) {
                if (practitionerByNik.data.total === 0) {
                    res.status(200).json({
                        metadata: {
                            code: 201,
                            msg: "Data tidak tersedia!",
                        },
                        response: practitionerByNik.data,
                    });
                } else {
                    res.status(200).json({
                        metadata: {
                            code: 200,
                            msg: "Operation completed successfully!",
                        },
                        response: {
                            practitioner_ihs_id:
                                practitionerByNik.data.entry[0].resource.id,
                            resources_type:
                                practitionerByNik.data.entry[0].resource
                                    .resourceType,
                            raw_response: practitionerByNik.data,
                        },
                    });
                }
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Data tidak tersedia!",
                    },
                    response: practitionerByNik.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/practitioner/send-all/limit/:limit",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit: string = req.params.limit;
            const practitionerByNik = await getPractitionerSendAllService(
                limit
            );

            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Pengerjaan Selesai!",
                },
                response: practitionerByNik,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/organization",
    body(["nama_bagian", "bagian_id"]).notEmpty().isString(),
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
            const data = req.body;
            const createOrganization = await createOrganizationService(data);

            if (createOrganization.status === 201) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        practitioner_ihs_id: createOrganization.id,
                        resources_type: createOrganization.resourceType,
                        raw_response: createOrganization.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Operation failed!",
                    },
                    response: createOrganization.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/organization/id/:organization_id",
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
            const { organization_id } = req.params;
            const getOrganization = await getOrganizationIdService(
                organization_id
            );

            if (getOrganization.status === 200) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        raw_response: getOrganization.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Operation failed!",
                    },
                    response: getOrganization.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/organization/partOf/:organization_id?",
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
            const { organization_id } = req.params;
            const getOrganization = await getOrganizationPartofService(
                organization_id
            );

            if (getOrganization.status === 200) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        raw_response: getOrganization.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Operation failed!",
                    },
                    response: getOrganization.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/location",
    body(["nama_bagian", "bagian_id", "organization_id"]).notEmpty().isString(),
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
            const data = req.body;
            const createLocation = await createLocationService(data);

            if (createLocation.status === 201) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        practitioner_ihs_id: createLocation.id,
                        resources_type: createLocation.resourceType,
                        raw_response: createLocation.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Operation failed!",
                    },
                    response: createLocation.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);

router.get(
    "/location/id/:location_id",
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
            const { location_id } = req.params;
            const getLocation = await getLocationIdService(location_id);

            if (getLocation.status === 200) {
                res.status(200).json({
                    metadata: {
                        code: 200,
                        msg: "Operation completed successfully!",
                    },
                    response: {
                        raw_response: getLocation.data,
                    },
                });
            } else {
                res.status(200).json({
                    metadata: {
                        code: 201,
                        msg: "Operation failed!",
                    },
                    response: getLocation.data,
                });
            }
        } catch (err) {
            next(err);
        }
    }
);
