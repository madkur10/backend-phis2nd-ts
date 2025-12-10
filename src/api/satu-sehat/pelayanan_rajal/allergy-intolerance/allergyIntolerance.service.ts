import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getAllergyIntoleranceRequest,
    updateInsertIdAllergyIntoleranceRepo,
    updateUpdateIdAllergyIntoleranceRepo,
} from "./allergyIntolerance.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendAllergyIntoleranceService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getAllergyIntoleranceRequestReady: any =
        await getAllergyIntoleranceRequest(limit);

    const resultPush: any = [];
    if (getAllergyIntoleranceRequestReady.length > 0) {
        const promises = getAllergyIntoleranceRequestReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/AllergyIntolerance`;
                const method = "POST";
                const tglLayanan = element.tgl_urut;

                const payload = {
                    resourceType: "AllergyIntolerance",
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
                                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                code: "active",
                                display: "Active",
                            },
                        ],
                    },
                    verificationStatus: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
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
                    const updateInsertIdPatient =
                        updateInsertIdAllergyIntoleranceRepo(
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
                    const updateInsertIdPatient =
                        updateInsertIdAllergyIntoleranceRepo(
                            element.registration_id,
                            payload,
                            response.data,
                            "0",
                            "AllergyIntolerance",
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

const sendAllergyIntoleranceRegistrasiService = async (
    registrasi_id: string
) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataServiceReady: any = await getAllergyIntoleranceRequest(
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
            const url = `${baseUrl}/AllergyIntolerance`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "AllergyIntolerance",
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
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                            code: "active",
                            display: "Active",
                        },
                    ],
                },
                verificationStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
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
                        updateUpdateIdAllergyIntoleranceRepo(
                            element.registrasi_id,
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
                        updateInsertIdAllergyIntoleranceRepo(
                            element.registrasi_id,
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
                        updateUpdateIdAllergyIntoleranceRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            "0",
                            "AllergyIntolerance",
                            1,
                            element.transaction_satu_sehat_id
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdAllergyIntoleranceRepo(
                            element.registrasi_id,
                            payload,
                            response.data,
                            "0",
                            "AllergyIntolerance",
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

export {
    sendAllergyIntoleranceService,
    sendAllergyIntoleranceRegistrasiService,
};
