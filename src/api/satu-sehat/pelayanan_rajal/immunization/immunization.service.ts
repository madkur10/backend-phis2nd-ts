import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataImmunization,
    updateInsertIdImmunizationRepo,
    updateUpdateIdImmunizationRepo,
} from "./immunization.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";
import { text } from "body-parser";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC",
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendImmunizationService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataImmunizationReady: any = await getDataImmunization(limit);

    const resultPush: any = [];
    if (getDataImmunizationReady.length > 0) {
        const promises = getDataImmunizationReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Immunization`;
            const method = "POST";
            const tglLayanan = element.tgl_masuk;

            const payload = {
                "resourceType": "Immunization",
                "status": "completed",
                "vaccineCode": {
                    "coding": [
                        {
                            "system": "http://sys-ids.kemkes.go.id/kfa",
                            "code": `${element.kfa_id}`,
                        }
                    ],
                    text: element.nama_barang
                },
                "patient": {
                    "reference": `Patient/${element.patient_id}`,
                    "display": `${element.nama_pasien}`
                },
                "encounter": {
                    "reference": `Encounter/${element.encounter_id}`
                },
                "occurrenceDateTime": tglLayanan,
                "recorded": tglLayanan,
                "primarySource": true,
                "location": {
                    "reference": `Location/${element.location_id}`,
                    "display": element.nama_bagian
                },
                "lotNumber": "202604100001",
                "expirationDate": '2026-12-31',
                "doseQuantity": {
                    "value": element.jumlah,
                    "unit": "mL",
                    "system": "http://unitsofmeasure.org",
                    "code": "ml"
                },
                "performer": [
                    {
                        "function": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/v2-0443",
                                    "code": "AP",
                                    "display": "Administering Provider"
                                }
                            ]
                        },
                        "actor": {
                            "reference": `Practitioner/${element.practitioner_id}`
                        }
                    }
                ],
                "reasonCode": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.kemkes.go.id/CodeSystem/immunization-reason",
                                "code": "IM-Dasar",
                                "display": "Imunisasi Program Rutin Dasar"
                            },
                            {
                                "system": "http://terminology.kemkes.go.id/CodeSystem/immunization-routine-timing",
                                "code": "IM-Ideal",
                                "display": "Imunisasi Ideal"
                            }
                        ]
                    }
                ],
                "protocolApplied": [
                    {
                        "doseNumberPositiveInt": 1
                    }
                ]
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload,
            );

            if (response.status === 201) {
                const updateInsertIdPatient = updateInsertIdImmunizationRepo(
                    element.bill_kasir_detail_id,
                    payload,
                    response.data,
                    response.data.id,
                    response.data.resourceType,
                );
                resultPush.push({
                    ...element,
                    status: "sukses",
                });
            } else {
                const updateInsertIdPatient = updateInsertIdImmunizationRepo(
                    element.bill_kasir_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Immunization",
                    1,
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

const sendServRequestOrderRadService = async (order_lab_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataImmunizationReady: any = await getDataImmunization(
        "1",
        order_lab_detail_id,
    );

    const resultPush: any = [];
    if (getDataImmunizationReady.length > 0) {
        const promises = getDataImmunizationReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Immunization`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "Immunization",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/specimen/${orgId}`,
                        value: element.order_lab_detail_id,
                    },
                ],
                status: "available",
                type: {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: element.kode_specimen,
                            display: element.txt_specimen,
                        },
                    ],
                },
                subject: { reference: `Patient/${element.patient_id}` },
                receivedTime: tglLayanan,
                request: [
                    {
                        reference: `ServiceRequest/${element.service_request}`,
                    },
                ],
                collection: {
                    collectedDateTime: tglLayanan,
                },
            };

            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload,
            );

            if (response.status === 201) {
                const updateInsertIdPatient = updateInsertIdImmunizationRepo(
                    element.order_lab_detail_id,
                    payload,
                    response.data,
                    response.data.id,
                    response.data.resourceType,
                );
                resultPush.push({
                    ...element,
                    status: "sukses",
                });
            } else {
                const updateInsertIdPatient = updateInsertIdImmunizationRepo(
                    element.order_lab_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Immunization",
                    1,
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

export { sendImmunizationService, sendServRequestOrderRadService };
