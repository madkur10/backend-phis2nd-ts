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
} from "./resources.repository";
import { checkTokenService } from "../generate-token/generate-token.service";

import { requestAxios } from "../../../utils/axiosClient";
import { format } from "date-fns-tz";
import {
    updateStatusRegistrasi,
    getEncounterSatSet,
    updateDataEncounterSatSet,
    insertDataEncounterSatSet,
} from "../pelayanan-rawat-jalan/pelayanan-rawat-jalan.repository";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;

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
                        }
                    );
                } else {
                    const insertPatientSatSet = await insertDataPatientSatSet(
                        response.data,
                        {
                            no_mr: key_simrs,
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
            } else {
                const insertEncounterSatSet = await insertDataEncounterSatSet(
                    response.data,
                    {
                        registrasi_id: key_simrs,
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

export { createJobPasien, pushJobService };
