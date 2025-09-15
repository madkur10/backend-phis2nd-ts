import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataObservation,
    updateInsertIdObservationRepo,
    updateUpdateIdObservationRepo,
} from "./observation.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendObservationService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataObservationReady: any = await getDataObservation(limit);

    const resultPush: any = [];
    if (getDataObservationReady.length > 0) {
        const promises = getDataObservationReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Observation`;
            const method = "POST";
            const tglLayanan = element.input_time_emr;
            let code = "";
            let code_display = "";
            let valueQuantityUnit = "";
            let valueQuantityCode = "";
            if (element.objek_id === 6) {
                code = `8480-6`;
                code_display = `Systolic Blood Pressure`;
                valueQuantityUnit = `mm[Hg]`;
                valueQuantityCode = `mm[Hg]`;
            } else if (element.objek_id === 7) {
                code = `8462-4`;
                code_display = `Diastolic blood pressure`;
                valueQuantityUnit = `mm[Hg]`;
                valueQuantityCode = `mm[Hg]`;
            } else if (element.objek_id === 13) {
                code = `8310-5`;
                code_display = `Body temperature`;
                valueQuantityUnit = `Cel`;
                valueQuantityCode = `Cel`;
            } else if (element.objek_id === 12) {
                code = `8867-4`;
                code_display = `Heart rate`;
                valueQuantityUnit = `{beats}/min`;
                valueQuantityCode = `{beats}/min`;
            } else if (element.objek_id === 14) {
                code = `9279-1`;
                code_display = `Respiratory rate`;
                valueQuantityUnit = `breaths/min`;
                valueQuantityCode = `/min`;
            }

            const payload = {
                resourceType: "Observation",
                status: "final",
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                code: "vital-signs",
                                display: "Vital Signs",
                            },
                        ],
                    },
                ],
                code: {
                    coding: [
                        {
                            system: "http://loinc.org",
                            code: code,
                            display: code_display,
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
                effectiveDateTime: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                issued: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                performer: [
                    {
                        reference: `Practitioner/${element.practitioner_id}`,
                        display: `${element.practitioner_name}`,
                    },
                ],
                valueQuantity: {
                    value: parseInt(element.value, 10),
                    unit: valueQuantityUnit,
                    system: "http://unitsofmeasure.org",
                    code: valueQuantityCode,
                },
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 201) {
                const updateInsertIdPatient = updateInsertIdObservationRepo(
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
                const updateInsertIdPatient = updateInsertIdObservationRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Observation",
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

const sendObservationRegistrasiService = async (emr_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataObservationReady: any = await getDataObservation('1', emr_detail_id);

    const resultPush: any = [];
    if (getDataObservationReady.length > 0) {
        const promises = getDataObservationReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Observation`;
            const method = "POST";
            const tglLayanan = element.input_time_emr;
            let code = "";
            let code_display = "";
            let valueQuantityUnit = "";
            let valueQuantityCode = "";
            if (element.objek_id === 6) {
                code = `8480-6`;
                code_display = `Systolic Blood Pressure`;
                valueQuantityUnit = `mm[Hg]`;
                valueQuantityCode = `mm[Hg]`;
            } else if (element.objek_id === 7) {
                code = `8462-4`;
                code_display = `Diastolic blood pressure`;
                valueQuantityUnit = `mm[Hg]`;
                valueQuantityCode = `mm[Hg]`;
            } else if (element.objek_id === 13) {
                code = `8310-5`;
                code_display = `Body temperature`;
                valueQuantityUnit = `Cel`;
                valueQuantityCode = `Cel`;
            } else if (element.objek_id === 12) {
                code = `8867-4`;
                code_display = `Heart rate`;
                valueQuantityUnit = `{beats}/min`;
                valueQuantityCode = `{beats}/min`;
            } else if (element.objek_id === 14) {
                code = `9279-1`;
                code_display = `Respiratory rate`;
                valueQuantityUnit = `breaths/min`;
                valueQuantityCode = `/min`;
            }

            const payload = {
                resourceType: "Observation",
                status: "final",
                category: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                code: "vital-signs",
                                display: "Vital Signs",
                            },
                        ],
                    },
                ],
                code: {
                    coding: [
                        {
                            system: "http://loinc.org",
                            code: code,
                            display: code_display,
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
                effectiveDateTime: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                issued: `${tglLayanan
                    .toISOString()
                    .replace(".000Z", "+00:00")}`,
                performer: [
                    {
                        reference: `Practitioner/${element.practitioner_id}`,
                        display: `${element.practitioner_name}`,
                    },
                ],
                valueQuantity: {
                    value: parseInt(element.value, 10),
                    unit: valueQuantityUnit,
                    system: "http://unitsofmeasure.org",
                    code: valueQuantityCode,
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
                    const updateInsertIdPatient = updateUpdateIdObservationRepo(
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
                    const updateInsertIdPatient = updateUpdateIdObservationRepo(
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
                    const updateInsertIdPatient = updateUpdateIdObservationRepo(
                        element.emr_detail_id,
                        payload,
                        response.data,
                        "0",
                        "Observation",
                        1,
                        element.transaction_satu_sehat_id
                    );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient = updateUpdateIdObservationRepo(
                        element.emr_detail_id,
                        payload,
                        response.data,
                        "0",
                        "Observation",
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

export { sendObservationService, sendObservationRegistrasiService };
