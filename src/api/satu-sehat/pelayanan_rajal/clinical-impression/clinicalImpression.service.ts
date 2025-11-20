import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getClinicImpressionRequest,
    updateInsertIdClinicalImpressionRepo,
    updateUpdateIdClinicalImpressionRepo,
} from "./clinicalImpression.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendClinicalImpressionService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getClinicImpressionRequestReady: any =
        await getClinicImpressionRequest(limit);

    const resultPush: any = [];
    if (getClinicImpressionRequestReady.length > 0) {
        const promises = getClinicImpressionRequestReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/ClinicalImpression`;
                const method = "POST";
                const tglLayanan = element.input_time;

                const payload = {
                    resourceType: "ClinicalImpression",
                    status: "completed",
                    code: {
                        coding: [
                            {
                                system: "http://terminology.kemkes.go.id",
                                code: "TK000057",
                                display: "Riwayat Penyakit Sekarang",
                            },
                        ],
                    },
                    subject: {
                        reference: `Patient/${element.patient_id}`,
                        display: element.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    effectiveDateTime: tglLayanan,
                    date: tglLayanan,
                    assessor: {
                        reference: `Practitioner/${element.practitioner_id}`,
                    },
                    prognosisCodeableConcept: [
                        {
                            coding: [
                                {
                                    system: "http://snomed.info/sct",
                                    code: "709519000",
                                    display: "Prognosis unknown",
                                },
                            ],
                        },
                    ],
                    summary: element.summary,
                };

                const response: any = await requestAxios(
                    headersData,
                    url,
                    method,
                    payload
                );

                if (response.status === 201) {
                    const updateInsertIdPatient =
                        updateInsertIdClinicalImpressionRepo(
                            element.emr_detail_id,
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
                        updateInsertIdClinicalImpressionRepo(
                            element.emr_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ClinicalImpression",
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

const sendClinicalImpressionEmrService = async (emr_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceReady: any = await getClinicImpressionRequest(
        "1",
        emr_detail_id
    );

    const resultPush: any = [];
    if (getDataServiceReady.length > 0) {
        const promises = getDataServiceReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/ClinicalImpression`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "ClinicalImpression",
                status: "completed",
                code: {
                    coding: [
                        {
                            system: "http://terminology.kemkes.go.id",
                            code: "TK000057",
                            display: "Riwayat Penyakit Sekarang",
                        },
                    ],
                },
                subject: {
                    reference: `Patient/${element.patient_id}`,
                    display: element.patient_name,
                },
                encounter: {
                    reference: `Encounter/${element.encounter_id}`,
                },
                effectiveDateTime: tglLayanan,
                date: tglLayanan,
                assessor: {
                    reference: `Practitioner/${element.practitioner_id}`,
                },
                prognosisCodeableConcept: [
                    {
                        coding: [
                            {
                                system: "http://snomed.info/sct",
                                code: "709519000",
                                display: "Prognosis unknown",
                            },
                        ],
                    },
                ],
                summary: element.summary,
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
                        updateUpdateIdClinicalImpressionRepo(
                            element.emr_detail_id,
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
                        updateInsertIdClinicalImpressionRepo(
                            element.emr_detail_id,
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
                        updateUpdateIdClinicalImpressionRepo(
                            element.emr_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ClinicalImpression",
                            1,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdClinicalImpressionRepo(
                            element.emr_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ClinicalImpression",
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

export { sendClinicalImpressionService, sendClinicalImpressionEmrService };
