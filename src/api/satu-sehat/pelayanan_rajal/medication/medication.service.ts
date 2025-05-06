import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataMedicationCreate,
    updateInsertIdMedicationCreateRepo,
    getDataMedicationCreateRequestRepo,
    getDataMedicationCreateDispenseRepo,
    getDataMedicationDispenseRepo,
} from "./medication.repository";
import mappingData from "./mapping.json";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC"
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendMedicationCreateRequestService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataMedicationCreateReady: any = await getDataMedicationCreate(
        limit
    );

    const resultPush: any = [];
    if (getDataMedicationCreateReady.length > 0) {
        const promises = getDataMedicationCreateReady.map(
            async (element: any) => {
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/Medication`;
                const method = "POST";
                const payload = {
                    resourceType: "Medication",
                    meta: {
                        profile: [
                            "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication",
                        ],
                    },
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/medication/${orgId}`,
                            use: "official",
                            value: `${element.peresepan_obat_id}`,
                        },
                    ],
                    code: {
                        coding: [
                            {
                                system: "http://sys-ids.kemkes.go.id/kfa",
                                code: `${element.kfa_id}`,
                                display: `${element.nama_barang}`,
                            },
                        ],
                    },
                    status: "active",
                    manufacturer: {
                        reference: `Organization/${orgId}`,
                    },
                    extension: [
                        {
                            url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                        code: "NC",
                                        display: "Non-compound",
                                    },
                                ],
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_detail_id,
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_detail_id,
                            payload,
                            response.data,
                            "0",
                            "Medication",
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

const sendMedicationRequestService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataMedicationCreateRequestReady: any =
        await getDataMedicationCreateRequestRepo(limit);

    const resultPush: any = [];
    if (getDataMedicationCreateRequestReady.length > 0) {
        const promises = getDataMedicationCreateRequestReady.map(
            async (element: any) => {
                const tglValidasi = element.authoredon;
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/MedicationRequest`;
                const method = "POST";
                const payload = {
                    resourceType: "MedicationRequest",
                    status: "completed",
                    intent: "order",
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/prescription/${orgId}`,
                            use: "official",
                            value: `${element.peresepan_obat_id}`,
                        },
                    ],
                    category: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
                                    code: "outpatient",
                                    display: "Outpatient",
                                },
                            ],
                        },
                    ],
                    priority: "routine",
                    medicationReference: {
                        reference: `Medication/${element.medication_refference}`,
                        display: `Medication-${element.peresepan_obat_detail_id}`,
                    },
                    subject: {
                        reference: `Patient/${element.patient_id}`,
                        display: `${element.patient_name}`,
                    },
                    encounter: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    authoredOn: `${tglValidasi
                        .toISOString()
                        .replace(".000Z", "+00:00")}`,
                    requester: {
                        reference: `Practitioner/${element.practitioner_id}`,
                        display: `${element.practitioner_name}`,
                    },
                    reasonReference: [
                        {
                            reference: `Condition/${element.diagnosis_primer}`,
                            display: `${element.nama_diagnosa}`,
                        },
                    ],
                    dispenseRequest: {
                        dispenseInterval: {
                            value: 1,
                            unit: "days",
                            system: "http://unitsofmeasure.org",
                            code: "d",
                        },
                        numberOfRepeatsAllowed: 0,
                        quantity: {
                            value: element.jumlah_obat,
                            unit: `${element.satuan_obat}`,
                            system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
                            code: `${mapDrugForm(element.satuan_obat)}`,
                        },
                        performer: {
                            reference: `Organization/${orgId}`,
                        },
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_detail_id,
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_detail_id,
                            payload,
                            response.data,
                            "0",
                            "MedicationRequest",
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

const sendMedicationCreateDispenseService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataMedicationCreateDispenseReady: any =
        await getDataMedicationCreateDispenseRepo(limit);

    const resultPush: any = [];
    if (getDataMedicationCreateDispenseReady.length > 0) {
        const promises = getDataMedicationCreateDispenseReady.map(
            async (element: any) => {
                const tglValidasi = element.authoredon;
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/Medication`;
                const method = "POST";

                const payload = {
                    resourceType: "Medication",
                    meta: {
                        profile: [
                            "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication",
                        ],
                    },
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/medication/${orgId}`,
                            use: "official",
                            value: `${element.peresepan_obat_id}`,
                        },
                    ],
                    code: {
                        coding: [
                            {
                                system: "http://sys-ids.kemkes.go.id/kfa",
                                code: `${element.kfa_id}`,
                                display: `${element.kfa_name}`,
                            },
                        ],
                    },
                    status: "active",
                    manufacturer: {
                        reference: `Organization/${orgId}`,
                    },
                    batch: {
                        lotNumber: `${element.batch_number}`,
                    },
                    extension: [
                        {
                            url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                        code: "NC",
                                        display: "Non-compound",
                                    },
                                ],
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_dispense_id,
                            payload,
                            response.data,
                            response.data.id,
                            response.data.resourceType + "CreateDispense"
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                } else {
                    const updateInsertIdPatient =
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_dispense_id,
                            payload,
                            response.data,
                            "0",
                            "MedicationCreateDispense",
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

const sendMedicationDispenseService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataMedicationCreateDispenseReady: any =
        await getDataMedicationDispenseRepo(limit);

    const resultPush: any = [];
    if (getDataMedicationCreateDispenseReady.length > 0) {
        const promises = getDataMedicationCreateDispenseReady.map(
            async (element: any) => {
                const tglValidasi = element.authoredon;
                const headersData = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                };
                const url = `${baseUrl}/MedicationDispense`;
                const method = "POST";

                let tglPrepared = element.start_tracking;
                let tglOver = element.end_tracking;

                const payload = {
                    resourceType: "MedicationDispense",
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/prescription/${orgId}`,
                            use: "official",
                            value: `${element.peresepan_obat_id}`,
                        },
                    ],
                    status: "completed",
                    category: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category",
                                code: "outpatient",
                                display: "Outpatient",
                            },
                        ],
                    },
                    medicationReference: {
                        reference: `Medication/${element.medication_refference}`,
                        display: `${element.peresepan_obat_dispense_id}`,
                    },
                    subject: {
                        reference: `Patient/${element.patient_id}`,
                        display: `${element.patient_name}`,
                    },
                    context: {
                        reference: `Encounter/${element.encounter_id}`,
                    },
                    performer: [
                        {
                            actor: {
                                reference: `Practitioner/${element.practitioner_id}`,
                                display: `${element.practitioner_name}`,
                            },
                        },
                    ],
                    location: {
                        reference: `Location/${element.location_id}`,
                        display: `${element.location_name}`,
                    },
                    authorizingPrescription: [
                        {
                            reference: `MedicationRequest/${element.medication_request_id}`,
                        },
                    ],
                    quantity: {
                        system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
                        code: `${mapDrugForm(element.satuan_obat)}`,
                        value: element.jumlah_obat,
                    },
                    daysSupply: {
                        value: element.jumlah_supply,
                        unit: "Day",
                        system: "http://unitsofmeasure.org",
                        code: "d",
                    },
                    ...(element.tglPrepared ? { whenPrepared: `${tglPrepared
                        .toISOString()
                        .replace(".000Z", "+00:00")}` } : {}),
                    ...(element.tglOver ? { whenOver: `${tglOver
                        .toISOString()
                        .replace(".000Z", "+00:00")}` } : {}),
                    dosageInstruction: [
                        {
                            sequence: 1,
                            doseAndRate: [
                                {
                                    type: {
                                        coding: [
                                            {
                                                system: "http://terminology.hl7.org/CodeSystem/dose-rate-type",
                                                code: "ordered",
                                                display: "Ordered",
                                            },
                                        ],
                                    },
                                    doseQuantity: {
                                        value: parseInt(element.sigma_1, 10),
                                        unit: `${mapDrugForm(element.satuan_obat)}`,
                                        system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
                                        code: `${mapDrugForm(element.satuan_obat)}`,
                                    },
                                },
                            ],
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_dispense_id,
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
                        updateInsertIdMedicationCreateRepo(
                            element.peresepan_obat_dispense_id,
                            payload,
                            response.data,
                            "0",
                            "MedicationDispense",
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

const mappingDataTyped: Record<string, string> = mappingData;
export function mapDrugForm(value: string): string {
    return mappingDataTyped[value.toUpperCase()] || "";
}

export {
    sendMedicationCreateRequestService,
    sendMedicationRequestService,
    sendMedicationCreateDispenseService,
    sendMedicationDispenseService,
};
