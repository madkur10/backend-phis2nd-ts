import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getProcedureRadRequest,
    updateInsertIdProcedureRadRepo,
    updateUpdateIdProcedureRadRepo,
} from "./procedure.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendProcedureRadService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getProcedureRadRequestReady: any = await getProcedureRadRequest(
        limit
    );

    const resultPush: any = [];
    if (getProcedureRadRequestReady.length > 0) {
        const promises = getProcedureRadRequestReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/Procedure`;
                const method = "POST";
                const tglLayanan = element.tgl_hasil;

                const payload = {
                    resourceType: "Procedure",
                    basedOn: [
                        {
                            reference: `ServiceRequest/${element.service_request_id}`,
                        },
                    ],
                    status: "completed",
                    category: {
                        coding: [
                            {
                                system: "http://snomed.info/sct",
                                code: "103693007",
                                display: "Diagnostic procedure",
                            },
                        ],
                        text: "Prosedur Diagnostik",
                    },
                    code: {
                        coding: [
                            {
                                system:
                                    element.type_terminologi == "SnomedCT"
                                        ? "http://snomed.info/sct"
                                        : "http://loinc.org",
                                code: element.tindakan_satset_id,
                                display: element.nama_tindakan,
                            },
                        ],
                    },
                    subject: {
                        reference: `Patient/${element.patient_id}`,
                        display: `${element.patient_name}`,
                    },
                    encounter: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    performedPeriod: {
                        start: tglLayanan,
                        end: tglLayanan,
                    },
                    performer: [
                        {
                            actor: {
                                reference: `Practitioner/${element.practitioner_rad_id}`,
                                display: `${element.name_practitioner_rad}`,
                            },
                        },
                    ],
                };

                const response: any = await requestAxios(
                    headersData,
                    url,
                    method,
                    payload
                );

                if (response.status === 201) {
                    const updateInsertIdPatient =
                        updateInsertIdProcedureRadRepo(
                            element.hasil_rad_detail_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType + "Rad"
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdProcedureRadRepo(
                            element.hasil_rad_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ProcedureRad",
                            1
                        );

                    resultPush.push({
                        ...element,
                        status: "gagal",
                        response: response.data,
                    });
                }
            }
        );
        await Promise.all(promises);
    }

    return resultPush;
};

const sendProcedureRadRegistrasiService = async (registrasi_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceReady: any = await getProcedureRadRequest(
        "1",
        registrasi_id
    );

    const resultPush: any = [];
    if (getDataServiceReady.length > 0) {
        const promises = getDataServiceReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/ProcedureRad`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "ProcedureRad",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/allergy/${orgId}`,
                        use: "official",
                        value: `${element.registration_id}`,
                    },
                ],
                clinicalStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/ProcedureRad-clinical",
                            code: "active",
                            display: "Active",
                        },
                    ],
                },
                verificationStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/ProcedureRad-verification",
                            code: "confirmed",
                            display: "Confirmed",
                        },
                    ],
                },
                category: ["environment"],
                code: {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: "419199007",
                            display: "Allergy to substance (disorder)",
                        },
                    ],
                    text: `${element.alergi}`,
                },
                patient: {
                    reference: `Patient/${element.patient_id}`,
                    display: `${element.patient_name}`,
                },
                encounter: {
                    reference: `Encounter/${element.encounter_id}`,
                    display: `Kunjungan ${element.patient_name}`,
                },
                recordedDate: tglLayanan,
                recorder: {
                    reference: `Practitioner/${element.practitioner_id}`,
                },
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 201) {
                if (element.transaction_satu_sehat_id) {
                    const updateInsertIdPatient =
                        updateUpdateIdProcedureRadRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType + "Rad",
                            null,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdProcedureRadRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType + "Rad"
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
                if (element.transaction_satu_sehat_id) {
                    const updateInsertIdPatient =
                        updateUpdateIdProcedureRadRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            "0",
                            "ProcedureRad",
                            1,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdProcedureRadRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            "0",
                            "ProcedureRad",
                            1
                        );

                    resultPush.push({
                        ...element,
                        status: "gagal",
                        response: response.data,
                    });
                }
            }
        });
        await Promise.all(promises);
    }

    return resultPush;
};

export { sendProcedureRadService, sendProcedureRadRegistrasiService };
