import { environment } from "../../../utils/config";
import {
    getPatientSatSet,
    insertDataPatientSatSet,
    updateDataPatientSatSet,
    getPatientSimrs,
    insertJobData,
    updateJobData,
    updateStatusPasien,
    getJob,
    getPractitionerSimrs,
    getPractitionerSatSet,
    updateStatusPegawai,
    updateDataPractitionerSatSet,
    insertDataPractitionerSatSet,
    getDataPractitioner,
    updateInsertIdPractitionerRepo,
    getDataPatient,
    updateInsertIdPatientRepo,
} from "./resources.repository";
import { checkTokenService } from "../generate-token/generate-token.service";

import { requestAxios } from "../../../utils/axiosClient";
import { format } from "date-fns-tz";
import {
    updateStatusRegistrasi,
    getEncounterSatSet,
    updateDataEncounterSatSet,
    insertDataEncounterSatSet,
    updateStatusEmrDetail,
    getEmrDetailObservationSatSet,
    getEmrDetailConditionSatSet,
    updateDataEmrDetailObservationSatSet,
    updateDataEmrDetailConditionSatSet,
} from "../pelayanan-rawat-jalan/pelayanan-rawat-jalan.repository";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const createJobPasien = async (limit: number) => {
    const getDataPasien = await getPatientSimrs(limit);
    if (getDataPasien.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    }

    let dataPatient: any = await Promise.all(
        getDataPasien.map(async (item: any) => {
            const dataJob = {
                endpoint_name: "patient",
                status: 1,
                method: "GET",
                url: `/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${item.ktp}`,
                key_simrs: item.no_mr,
            };

            const checkPatientSatSet: any = await insertJobData(dataJob);
            if (!checkPatientSatSet) {
                return {
                    no_mr: item.no_mr,
                    ktp: item.ktp,
                    birthdate: item.birthdate,
                    gender: item.gender,
                    status: "failed",
                };
            } else {
                const updateStatus = await updateStatusPasien({
                    no_mr: item.no_mr,
                    status_satu_sehat: 1,
                });

                const checkPatientSatSet = await getPatientSatSet(item.no_mr);

                if (!checkPatientSatSet) {
                    const insertPatient = await insertDataPatientSatSet({
                        pasien_id: item.pasien_id,
                        nama_pasien: item.nama_pasien,
                        tgl_lahir: item.tgl_lahir,
                        nik: item.ktp,
                        no_mr: item.no_mr,
                    });
                }

                return {
                    no_mr: item.no_mr,
                    ktp: item.ktp,
                    birthdate: item.birthdate,
                    gender: item.gender,
                    status: "success",
                };
            }
        })
    );

    return {
        data: dataPatient,
        code: 200,
        message: "success",
    };
};

const createJobPractitioner = async (limit: number) => {
    const getDataPractitioner = await getPractitionerSimrs(limit);
    if (getDataPractitioner.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    }

    let dataPractitioner: any = await Promise.all(
        getDataPractitioner.map(async (item: any) => {
            let pegawaiId = item.pegawai_id;
            const dataJob = {
                endpoint_name: "practitioner",
                status: 1,
                method: "GET",
                url: `/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${item.nik}`,
                key_simrs: pegawaiId.toString(),
            };

            const checkPractitionerSatSet: any = await insertJobData(dataJob);
            if (!checkPractitionerSatSet) {
                return {
                    pegawai_id: pegawaiId,
                    ktp: item.ktp,
                    nama_pegawai: item.nama_pegawai,
                    status: "failed",
                };
            } else {
                return {
                    pegawai_id: pegawaiId,
                    ktp: item.ktp,
                    nama_pegawai: item.nama_pegawai,
                    status: "success",
                };
            }
        })
    );

    return {
        data: {
            jumlah_data: dataPractitioner.length,
            dataPractitioner,
        },
        code: 200,
        message: "success",
    };
};

const pushJobService = async (endpoint_name: string, limit: number) => {
    const getJobRepository = await getJob(endpoint_name, limit);
    if (getJobRepository.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    }

    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }

    let token = tokenService?.data?.access_token;
    let dataJob: any = await Promise.all(
        getJobRepository.map(async (item: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}${item.url}`;
            const method = item.method;
            const payload = item.payload;
            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );
            const key_simrs = item.key_simrs;

            if (item.endpoint_name === "patient") {
                const executePatient = await executePatientService(
                    response,
                    item,
                    key_simrs
                );
                return executePatient;
            } else if (item.endpoint_name === "encounter") {
                const executeEncounter = await executeEncounterService(
                    response,
                    item,
                    key_simrs
                );
                return executeEncounter;
            } else if (item.endpoint_name === "practitioner") {
                const executePractitioner = await executePractitionerService(
                    response,
                    item,
                    key_simrs
                );
                return executePractitioner;
            } else if (item.endpoint_name === "observation") {
                const executeObservation = await executeObservationService(
                    response,
                    item,
                    key_simrs
                );
                return executeObservation;
            } else if (item.endpoint_name === "condition") {
                const executeCondition = await executeConditionService(
                    response,
                    item,
                    key_simrs
                );
                return executeCondition;
            }
        })
    );

    return {
        data: dataJob,
        code: 200,
        message: "success",
    };
};

const executePatientService = async (
    response: any,
    item: any,
    key_simrs: string
) => {
    if (response.status === 200) {
        if (response.data.resourceType === "OperationOutcome") {
            const updateStatus = await updateStatusPasien({
                no_mr: key_simrs,
                status_satu_sehat: 3,
            });
            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 3,
            });
            return {
                job_id: item.id,
                status: "failed",
                response: response.data,
            };
        } else {
            if (response.data.total > 0) {
                const checkPatientSatSet = await getPatientSatSet(key_simrs);

                if (checkPatientSatSet) {
                    const updatePatientSatSet = await updateDataPatientSatSet(
                        response.data,
                        {
                            no_mr: key_simrs,
                            pasien_id: checkPatientSatSet.pasien_id,
                        }
                    );
                }

                const updateStatus = await updateStatusPasien({
                    no_mr: key_simrs,
                    status_satu_sehat: 2,
                    id_satu_sehat: response.data.entry[0].resource.id,
                });

                const updateJob = await updateJobData({
                    id: item.id,
                    response: response.data,
                    status: 2,
                });

                return {
                    job_id: item.id,
                    status: "success",
                    response: response.data.entry[0].resource,
                };
            } else {
                const updateStatus = await updateStatusPasien({
                    no_mr: key_simrs,
                    status_satu_sehat: 3,
                });

                const updateJob = await updateJobData({
                    id: item.id,
                    response: response.data,
                    status: 3,
                });

                return {
                    job_id: item.id,
                    status: "failed",
                    response: response.data,
                };
            }
        }
    } else {
        const updateStatus = await updateStatusPasien({
            no_mr: key_simrs,
            status_satu_sehat: 3,
        });

        const updateJob = await updateJobData({
            id: item.id,
            response: response.data,
            status: 3,
        });
        return {
            job_id: item.id,
            status: "failed",
            response: response.data,
        };
    }
};

const executeEncounterService = async (
    response: any,
    item: any,
    key_simrs: string
) => {
    if (response.status === 201) {
        if (response.data.resourceType === "OperationOutcome") {
            const updateStatus = await updateStatusRegistrasi({
                registrasi_id: parseInt(key_simrs, 10),
                status_satu_sehat: 3,
            });
            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 3,
            });
            return {
                job_id: item.id,
                status: "failed",
                response: response.data,
            };
        } else {
            const checkEncounterSatSet = await getEncounterSatSet(key_simrs);

            if (checkEncounterSatSet) {
                const updateEncounterSatSet = await updateDataEncounterSatSet(
                    response.data,
                    {
                        registrasi_id: key_simrs,
                        id: checkEncounterSatSet.id,
                    }
                );
            }

            const updateStatus = await updateStatusRegistrasi({
                registrasi_id: parseInt(key_simrs, 10),
                status_satu_sehat: 2,
                id_satu_sehat: response.data.id,
            });

            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 2,
            });

            return {
                job_id: item.id,
                status: "success",
                response: response.data,
            };
        }
    } else {
        const updateStatus = await updateStatusRegistrasi({
            registrasi_id: parseInt(key_simrs, 10),
            status_satu_sehat: 3,
        });

        const updateJob = await updateJobData({
            id: item.id,
            response: response.data,
            status: 3,
        });
        return {
            job_id: item.id,
            status: "failed",
            response: response.data,
        };
    }
};

const executePractitionerService = async (
    response: any,
    item: any,
    key_simrs: string
) => {
    let url = item.url;
    let nik = url.substring(58);

    if (response.status === 200) {
        if (response.data.resourceType === "OperationOutcome") {
            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 3,
            });
            return {
                job_id: item.id,
                status: "failed",
                response: response.data,
            };
        } else {
            if (response.data.total > 0) {
                const checkPractitionerSatSet = await getPractitionerSatSet(
                    key_simrs
                );

                if (checkPractitionerSatSet) {
                    const updatePractitionerSatSet =
                        await updateDataPractitionerSatSet(response.data, {
                            pegawai_id: key_simrs,
                            nik: nik,
                            id: checkPractitionerSatSet.id,
                        });
                } else {
                    const insertPractitionerSatSet =
                        await insertDataPractitionerSatSet(response.data, {
                            pegawai_id: key_simrs,
                            nik: nik,
                        });
                }

                const updateStatus = await updateStatusPegawai({
                    pegawai_id: parseInt(key_simrs, 10),
                    status_satu_sehat: 2,
                    id_satu_sehat: response.data.entry[0].resource.id,
                });

                const updateJob = await updateJobData({
                    id: item.id,
                    response: response.data,
                    status: 2,
                });

                return {
                    job_id: item.id,
                    status: "success",
                    response: response.data,
                };
            } else {
                const updateJob = await updateJobData({
                    id: item.id,
                    response: response.data,
                    status: 3,
                });
                return {
                    job_id: item.id,
                    status: "failed",
                    response: response.data,
                };
            }
        }
    } else {
        const updateJob = await updateJobData({
            id: item.id,
            response: response.data,
            status: 3,
        });

        return {
            job_id: item.id,
            status: "failed",
            response: response.data,
        };
    }
};

const executeObservationService = async (
    response: any,
    item: any,
    key_simrs: string
) => {
    if (response.status === 201) {
        if (response.data.resourceType === "OperationOutcome") {
            const updateStatus = await updateStatusEmrDetail({
                emr_detail_id: parseInt(key_simrs, 10),
                status_satu_sehat: 3,
            });
            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 3,
            });
            return {
                job_id: item.id,
                status: "failed",
                response: response.data,
            };
        } else {
            const checkEmrDetailObservationSatSet =
                await getEmrDetailObservationSatSet(key_simrs);

            if (checkEmrDetailObservationSatSet) {
                const updateEmrDetailSatSet =
                    await updateDataEmrDetailObservationSatSet(response.data, {
                        emr_detail_id: key_simrs,
                        id: checkEmrDetailObservationSatSet.admission_id,
                    });
            }

            const updateStatus = await updateStatusEmrDetail({
                emr_detail_id: parseInt(key_simrs, 10),
                status_satu_sehat: 2,
                id_satu_sehat: response.data.id,
            });

            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 2,
            });

            return {
                job_id: item.id,
                status: "success",
                response: response.data,
            };
        }
    } else {
        const updateStatus = await updateStatusEmrDetail({
            emr_detail_id: parseInt(key_simrs, 10),
            status_satu_sehat: 3,
        });

        const updateJob = await updateJobData({
            id: item.id,
            response: response.data,
            status: 3,
        });
        return {
            job_id: item.id,
            status: "failed",
            response: response.data,
        };
    }
};

const executeConditionService = async (
    response: any,
    item: any,
    key_simrs: string
) => {
    if (response.status === 201) {
        if (response.data.resourceType === "OperationOutcome") {
            const updateStatus = await updateStatusEmrDetail({
                emr_detail_id: parseInt(key_simrs, 10),
                status_satu_sehat: 3,
            });
            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 3,
            });
            return {
                job_id: item.id,
                status: "failed",
                response: response.data,
            };
        } else {
            const checkEmrDetailSatSet = await getEmrDetailConditionSatSet(
                key_simrs
            );

            if (checkEmrDetailSatSet) {
                const updateEmrDetailSatSet =
                    await updateDataEmrDetailConditionSatSet(response.data, {
                        emr_detail_id: key_simrs,
                        id: checkEmrDetailSatSet.admission_id,
                    });
            }

            const updateStatus = await updateStatusEmrDetail({
                emr_detail_id: parseInt(key_simrs, 10),
                status_satu_sehat: 2,
                id_satu_sehat: response.data.id,
            });

            const updateJob = await updateJobData({
                id: item.id,
                response: response.data,
                status: 2,
            });

            return {
                job_id: item.id,
                status: "success",
                response: response.data,
            };
        }
    } else {
        const updateStatus = await updateStatusEmrDetail({
            emr_detail_id: parseInt(key_simrs, 10),
            status_satu_sehat: 3,
        });

        const updateJob = await updateJobData({
            id: item.id,
            response: response.data,
            status: 3,
        });
        return {
            job_id: item.id,
            status: "failed",
            response: response.data,
        };
    }
};

const getPatientNikService = async (nik: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getPractitionerNikService = async (nik: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const createOrganizationService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Organization`;
    const method = "POST";
    const payload = {
        resourceType: "Organization",
        active: true,
        identifier: [
            {
                use: "official",
                system: "http://sys-ids.kemkes.go.id/organization/" + orgId,
                value: data.bagian_id,
            },
        ],
        type: [
            {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/organization-type",
                        code: "dept",
                        display: "Hospital Department",
                    },
                ],
            },
        ],
        name: data.nama_bagian,
        partOf: {
            reference: "Organization/" + orgId,
        },
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getOrganizationPartofService = async (organization_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    organization_id = organization_id ?? orgId;

    const url = `${baseUrl}/Organization?partof=${organization_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getOrganizationIdService = async (organization_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const url = `${baseUrl}/Organization/${organization_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const createLocationService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Location`;
    const method = "POST";
    const payload = {
        resourceType: "Location",
        identifier: [
            {
                system: "http://sys-ids.kemkes.go.id/location/" + orgId,
                value: data.bagian_id,
            },
        ],
        status: "active",
        name: data.nama_bagian,
        description: "This is a location for " + data.nama_bagian,
        mode: "instance",
        physicalType: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
                    code: "ro",
                    display: "Room",
                },
            ],
        },
        managingOrganization: {
            reference: "Organization/" + data.organization_id,
        },
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getLocationIdService = async (location_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const url = `${baseUrl}/Location/${location_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getPractitionerSendAllService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataPractitionerReady: any = await getDataPractitioner(limit);

    const resultPush: any = [];
    if (getDataPractitionerReady.length > 0) {
        const promises = getDataPractitionerReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${element.nik}`;
            const method = "GET";
            const payload = null;
            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 200) {
                if (response.data.total === 0) {
                    resultPush.push({
                        ...element,
                        status: "gagal",
                    });
                } else {
                    const updateInsertIdPractitioner =
                        updateInsertIdPractitionerRepo(
                            element.pegawai_id,
                            response.data,
                            response.data.entry[0].resource.id,
                            response.data.entry[0].resource.resourceType
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
                resultPush.push({
                    ...element,
                    status: "gagal",
                });
            }
        });
        await Promise.all(promises);
    }

    return resultPush;
};

const getPatientSendAllService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataPatientReady: any = await getDataPatient(limit);

    const resultPush: any = [];
    if (getDataPatientReady.length > 0) {
        const promises = getDataPatientReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${element.ktp}`;
            const method = "GET";
            const payload = null;
            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 200) {
                if (response.data.total === 0) {
                    const updateInsertIdPatient = updateInsertIdPatientRepo(
                        element.pasien_id,
                        response.data,
                        "0",
                        "Patient",
                        1
                    );
                    resultPush.push({
                        ...element,
                        status: "gagal",
                    });
                } else {
                    const updateInsertIdPatient = updateInsertIdPatientRepo(
                        element.pasien_id,
                        response.data,
                        response.data.entry[0].resource.id,
                        response.data.entry[0].resource.resourceType
                    );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
                resultPush.push({
                    ...element,
                    status: "gagal",
                    response: response.data,
                });
            }
        });
        await Promise.all(promises);
    }

    return resultPush;
};

export {
    createJobPasien,
    pushJobService,
    createJobPractitioner,
    getPatientNikService,
    getPractitionerNikService,
    createOrganizationService,
    getOrganizationPartofService,
    getOrganizationIdService,
    createLocationService,
    getLocationIdService,
    getPractitionerSendAllService,
    getPatientSendAllService,
};
