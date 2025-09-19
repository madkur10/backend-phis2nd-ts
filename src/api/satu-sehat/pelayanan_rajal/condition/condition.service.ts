import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataCondition,
    updateInsertIdConditionRepo,
    updateUpdateIdConditionRepo,
} from "./condition.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendConditionService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataConditionReady: any = await getDataCondition(limit);

    const resultPush: any = [];
    if (getDataConditionReady.length > 0) {
        const promises = getDataConditionReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Condition`;
            const method = "POST";
            const tglLayanan = element.input_time_emr;

            const payload = {
                resourceType: "Condition",
                clinicalStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            code: "active",
                            display: "Active",
                        },
                    ],
                },
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                code: "encounter-diagnosis",
                                display: "Encounter Diagnosis",
                            },
                        ],
                    },
                ],
                code: {
                    coding: [
                        {
                            system: "http://hl7.org/fhir/sid/icd-10",
                            code: `${element.kode_diagnosa}`,
                            display: `${element.nama_diagnosa}`,
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
                onsetDateTime: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                recordedDate: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 201) {
                const updateInsertIdPatient = updateInsertIdConditionRepo(
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
                const updateInsertIdPatient = updateInsertIdConditionRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Condition",
                    1
                );

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

const sendConditionRegistrasiService = async (emr_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataConditionReady: any = await getDataCondition(
        "1",
        emr_detail_id
    );

    const resultPush: any = [];
    if (getDataConditionReady.length > 0) {
        const promises = getDataConditionReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Condition`;
            const method = "POST";
            const tglLayanan = element.input_time_emr;

            const payload = {
                resourceType: "Condition",
                clinicalStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            code: "active",
                            display: "Active",
                        },
                    ],
                },
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                code: "encounter-diagnosis",
                                display: "Encounter Diagnosis",
                            },
                        ],
                    },
                ],
                code: {
                    coding: [
                        {
                            system: "http://hl7.org/fhir/sid/icd-10",
                            code: `${element.kode_diagnosa}`,
                            display: `${element.nama_diagnosa}`,
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
                onsetDateTime: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                recordedDate: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 201) {
                if (element.transaction_satu_sehat_id) {
                    const updateInsertIdPatient = updateUpdateIdConditionRepo(
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
                    const updateInsertIdPatient = updateUpdateIdConditionRepo(
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
                    const updateInsertIdPatient = updateUpdateIdConditionRepo(
                        element.emr_detail_id,
                        payload,
                        response.data,
                        "0",
                        "Condition",
                        1,
                        element.transaction_satu_sehat_id
                    );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient = updateUpdateIdConditionRepo(
                        element.emr_detail_id,
                        payload,
                        response.data,
                        "0",
                        "Condition",
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

export { sendConditionService, sendConditionRegistrasiService };
