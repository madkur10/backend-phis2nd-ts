import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataEncounter,
    updateInsertIdEncounterRepo,
} from "./encounter.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const getEncounterIdService = async (id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Encounter/${id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getEncounterSubjectService = async (subject: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Encounter?subject=${subject}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const sendEncounterService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataEncounterReady: any = await getDataEncounter(limit);

    const resultPush: any = [];
    if (getDataEncounterReady.length > 0) {
        const promises = getDataEncounterReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Encounter`;
            const method = "POST";
            const tglLayanan = element.tgl_urut;
            const payload = {
                resourceType: "Encounter",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/encounter/${orgId}`,
                        value: `${element.registration_id}`,
                    },
                ],
                status: "arrived",
                class: {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "AMB",
                    display: "ambulatory",
                },
                subject: {
                    reference: `Patient/${element.patient_id}`,
                    display: `${element.patient_name}`,
                },
                participant: [
                    {
                        type: [
                            {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                        code: "ATND",
                                        display: "attender",
                                    },
                                ],
                            },
                        ],
                        individual: {
                            reference: `Practitioner/${element.practitioner_id}`,
                            display: `${element.practitioner_name}`,
                        },
                    },
                ],
                period: {
                    start: `${tglLayanan
                        .toISOString()
                        .replace(".000Z", "+00:00")}`,
                },
                location: [
                    {
                        location: {
                            reference: `Location/${element.location_poli_id}`,
                            display: `${element.location_poli_name}`,
                        },
                        period: {
                            start: `${tglLayanan
                                .toISOString()
                                .replace(".000Z", "+00:00")}`,
                        },
                        extension: [
                            {
                                url: "https://fhir.kemkes.go.id/r4/StructureDefinition/ServiceClass",
                                extension: [
                                    {
                                        url: "value",
                                        valueCodeableConcept: {
                                            coding: [
                                                {
                                                    system: "http://terminology.kemkes.go.id/CodeSystem/locationServiceClass-Outpatient",
                                                    code: "reguler",
                                                    display: "Kelas Reguler",
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        url: "upgradeClassIndicator",
                                        valueCodeableConcept: {
                                            coding: [
                                                {
                                                    system: "http://terminology.kemkes.go.id/CodeSystem/locationUpgradeClass",
                                                    code: "kelas-tetap",
                                                    display:
                                                        "Kelas Tetap Perawatan",
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
                statusHistory: [
                    {
                        status: "arrived",
                        period: {
                            start: `${tglLayanan
                                .toISOString()
                                .replace(".000Z", "+00:00")}`,
                        },
                    },
                ],
                serviceProvider: {
                    reference: `Organization/${orgId}`,
                },
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload
            );

            if (response.status === 201) {
                const updateInsertIdPatient = updateInsertIdEncounterRepo(
                    element.registration_id,
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
                const updateInsertIdPatient = updateInsertIdEncounterRepo(
                    element.registration_id,
                    payload,
                    response.data,
                    "0",
                    "Encounter",
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

export { sendEncounterService, getEncounterIdService, getEncounterSubjectService };
