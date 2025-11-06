import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataDiagnosticReport,
    updateInsertIdDiagnosticReportRepo,
    updateUpdateIdDiagnosticReportRepo,
} from "./diagnosticReport.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendDiagnosticReportService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataDiagnosticReportReady: any = await getDataDiagnosticReport(
        limit
    );

    const resultPush: any = [];
    if (getDataDiagnosticReportReady.length > 0) {
        const promises = getDataDiagnosticReportReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/DiagnosticReport`;
                const method = "POST";
                const tglLayanan = element.tgl_hasil;

                const payload = {
                    resourceType: "DiagnosticReport",
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/diagnostic/${orgId}/rad`,
                            use: "official",
                            value: element.hasil_rad_id.toString(),
                        },
                    ],
                    status: "final",
                    category: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                                    code: "RAD",
                                    display: "Radiology",
                                },
                            ],
                        },
                    ],
                    code: {
                        coding: [
                            {
                                system: "http://loinc.org",
                                code: "85430-7",
                                display: element.nama_tindakan,
                            },
                        ],
                    },
                    subject: {
                        reference: `Patient/${element.patient_id}`,
                    },
                    encounter: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    effectiveDateTime: tglLayanan,
                    issued: tglLayanan,
                    performer: [
                        {
                            reference: `Practitioner/${element.practitioner_rad_id}`,
                            display: element.name_practitioner_rad,
                        },
                        {
                            reference: `Organization/${orgId}`,
                        },
                    ],
                    result: [
                        {
                            reference: `Observation/${element.observation_rad_id}`,
                        },
                    ],
                    basedOn: [
                        {
                            reference: `ServiceRequest/${element.service_request_id}`,
                        },
                    ],
                    conclusion:
                        (element.deskripsi
                            ? `Deskripsi: ${element.deskripsi}`
                            : ``) +
                        (element.kesan ? `Kesan: ${element.kesan}` : ``) +
                        (element.saran ? `Saran: ${element.saran}` : ``),
                };

                const response: any = await requestAxios(
                    headersData,
                    url,
                    method,
                    payload
                );

                if (response.status === 201) {
                    const updateInsertIdPatient =
                        updateInsertIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            "0",
                            "DiagnosticReport",
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

const sendDiagnosticReportOrderRadService = async (hasil_rad_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceReady: any = await getDataDiagnosticReport(
        "1",
        hasil_rad_id
    );

    const resultPush: any = [];
    if (getDataServiceReady.length > 0) {
        const promises = getDataServiceReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/DiagnosticReport`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "DiagnosticReport",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/diagnostic/${orgId}/rad`,
                        use: "official",
                        value: element.hasil_rad_id.toString(),
                    },
                ],
                status: "final",
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/v2-0074",
                                code: "RAD",
                                display: "Radiology",
                            },
                        ],
                    },
                ],
                code: {
                    coding: [
                        {
                            system: "http://loinc.org",
                            code: "85430-7",
                            display: element.nama_tindakan,
                        },
                    ],
                },
                subject: {
                    reference: `Patient/${element.patient_id}`,
                },
                encounter: {
                    reference: `Encounter/${element.encounter_id}`,
                },
                effectiveDateTime: tglLayanan,
                issued: tglLayanan,
                performer: [
                    {
                        reference: `Practitioner/${element.practitioner_rad_id}`,
                        display: element.name_practitioner_rad,
                    },
                    {
                        reference: `Organization/${orgId}`,
                    },
                ],
                result: [
                    {
                        reference: `Observation/${element.observation_rad_id}`,
                    },
                ],
                basedOn: [
                    {
                        reference: `ServiceRequest/${element.service_request_id}`,
                    },
                ],
                conclusion:
                    (element.deskripsi
                        ? `Deskripsi: ${element.deskripsi}`
                        : ``) +
                    (element.kesan ? `Kesan: ${element.kesan}` : ``) +
                    (element.saran ? `Saran: ${element.saran}` : ``),
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
                        updateUpdateIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType,
                            null,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
                if (element.transaction_satu_sehat_id) {
                    const updateInsertIdPatient =
                        updateUpdateIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            "0",
                            "DiagnosticReport",
                            1,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdDiagnosticReportRepo(
                            element.hasil_rad_id,
                            payload,
                            response.data,
                            "0",
                            "DiagnosticReport",
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

export { sendDiagnosticReportService, sendDiagnosticReportOrderRadService };
