import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataServiceRequest,
    updateInsertIdServiceRequestRepo,
    updateUpdateIdServiceRequestRepo,
} from "./serviceRequest.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendServRequestRadService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceRequestReady: any = await getDataServiceRequest(limit);

    const resultPush: any = [];
    if (getDataServiceRequestReady.length > 0) {
        const promises = getDataServiceRequestReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/ServiceRequest`;
                const method = "POST";
                const tglLayanan = element.tgl_hasil;

                const payload = {
                    resourceType: "ServiceRequest",
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/servicerequest/${orgId}`,
                            value: element.hasil_rad_detail_id.toString(),
                        },
                        {
                            use: "usual",
                            type: {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                                        code: "ACSN",
                                    },
                                ],
                            },
                            system: `http://sys-ids.kemkes.go.id/acsn/${orgId}`,
                            value: element.order_rad_detail_id.toString(),
                        },
                    ],
                    status: "active",
                    intent: "original-order",
                    priority: "routine",
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
                    },
                    encounter: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    occurrenceDateTime: tglLayanan,
                    requester: {
                        reference: `Practitioner/${element.practitioner_request_id}`,
                        display: element.request_name_practitioner,
                    },
                    performer: [
                        {
                            reference: `Practitioner/${element.practitioner_rad_id}`,
                            display: element.name_practitioner_rad,
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
                        updateInsertIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
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
                        updateInsertIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ServiceRequest",
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

const sendServRequestOrderRadService = async (hasil_rad_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceReady: any = await getDataServiceRequest(
        "1",
        hasil_rad_detail_id
    );

    const resultPush: any = [];
    if (getDataServiceReady.length > 0) {
        const promises = getDataServiceReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/ServiceRequest`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "ServiceRequest",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/servicerequest/${orgId}`,
                        value: element.hasil_rad_detail_id.toString(),
                    },
                    {
                        use: "usual",
                        type: {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                                    code: "ACSN",
                                },
                            ],
                        },
                        system: `http://sys-ids.kemkes.go.id/acsn/${orgId}`,
                        value: element.order_rad_detail_id.toString(),
                    },
                ],
                status: "active",
                intent: "original-order",
                priority: "routine",
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
                },
                encounter: {
                    reference: `Encounter/${element.encounter_id}`,
                },
                occurrenceDateTime: tglLayanan,
                requester: {
                    reference: `Practitioner/${element.practitioner_request_id}`,
                    display: element.request_name_practitioner,
                },
                performer: [
                    {
                        reference: `Practitioner/${element.practitioner_rad_id}`,
                        display: element.name_practitioner_rad,
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
                if (element.transaction_satu_sehat_id) {
                    const updateInsertIdPatient =
                        updateUpdateIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
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
                        updateInsertIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
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
                        updateUpdateIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ServiceRequest",
                            1,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdServiceRequestRepo(
                            element.hasil_rad_detail_id,
                            payload,
                            response.data,
                            "0",
                            "ServiceRequest",
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

export { sendServRequestRadService, sendServRequestOrderRadService };
