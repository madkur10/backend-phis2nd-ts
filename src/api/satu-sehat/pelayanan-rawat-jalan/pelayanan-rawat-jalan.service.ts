import {
    getJobEncounter,
    updateStatusRegistrasi,
    getJobObservation,
    updateStatusEmrDetail,
} from "./pelayanan-rawat-jalan.repository";
import { insertJobData } from "../resources/resources.repository";

import * as dotenv from "dotenv";
import { environment } from "./../../../utils/config";
dotenv.config();

const generateJobEncounterService = async (limit: number) => {
    const jobEncounter: any = await getJobEncounter(limit);
    if (jobEncounter.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    } else {
        jobEncounter.forEach(async (item: any) => {
            const registrasiId = item.registrasi_id;
            const tglLayanan = item.tgl_urut;
            const payload = {
                resourceType: "Encounter",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/encounter/${environment.satusehat.org_id}`,
                        value: `${item.registrasi_id}`,
                    },
                ],
                status: "arrived",
                class: {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "AMB",
                    display: "ambulatory",
                },
                subject: {
                    reference: `Patient/${item.pasien_ihs_id}`,
                    display: `${item.nama_pasien}`,
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
                            reference: `Practitioner/${item.practitioner_ihs_id}`,
                            display: `${item.nama_pegawai}`,
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
                            reference: `Location/${item.location_id}`,
                            display: `${item.nama_bagian}`,
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
                    reference: `Organization/${environment.satusehat.org_id}`,
                },
            };

            const dataJob = {
                endpoint_name: "encounter",
                status: 1,
                method: "POST",
                url: `/Encounter`,
                key_simrs: registrasiId.toString(),
                payload: payload,
            };

            const checkPatientSatSet: any = await insertJobData(dataJob);
            if (!checkPatientSatSet) {
                return {
                    no_mr: item.no_mr,
                    registrasi_id: registrasiId,
                    status: "failed",
                };
            } else {
                const updateStatus = await updateStatusRegistrasi({
                    registrasi_id: parseInt(registrasiId, 10),
                    status_satu_sehat: 1,
                });
                return {
                    no_mr: item.no_mr,
                    registrasi_id: registrasiId,
                    status: "success",
                };
            }
        });
    }

    return {
        message: "Job Generate Success",
        code: 200,
        data: jobEncounter,
    };
};

const generateJobObservationService = async (
    limit: number,
    type_observation: string
) => {
    let objekId: number = 0;
    let category_code = "";
    let category_display = "";
    let code = "";
    let code_display = "";
    let valueQuantityUnit = "";
    let valueQuantityCode = "";
    if (type_observation === "sistolik") {
        objekId = 6;
        category_code = `vital-signs`;
        category_display = `Vital Signs`;
        code = `8480-6`;
        code_display = `Systolic Blood Pressure`;
        valueQuantityUnit = `mm[Hg]`;
        valueQuantityCode = `mm[Hg]`;
    } else if (type_observation === "diastolik") {
        objekId = 7;
        category_code = `vital-signs`;
        category_display = `Vital Signs`;
        code = `8462-4`;
        code_display = `Diastolic blood pressure`;
        valueQuantityUnit = `mm[Hg]`;
        valueQuantityCode = `mm[Hg]`;
    } else if (type_observation === "suhu_tubuh") {
        objekId = 13;
        category_code = `vital-signs`;
        category_display = `Vital Signs`;
        code = `8310-5`;
        code_display = `Body temperature`;
        valueQuantityUnit = `Cel`;
        valueQuantityCode = `Cel`;
    } else if (type_observation === "nadi") {
        objekId = 12;
        category_code = `vital-signs`;
        category_display = `Vital Signs`;
        code = `8867-4`;
        code_display = `Heart rate`;
        valueQuantityUnit = `{beats}/min`;
        valueQuantityCode = `{beats}/min`;
    } else if (type_observation === "pernapasan") {
        objekId = 14;
        category_code = `vital-signs`;
        category_display = `Vital Signs`;
        code = `9279-1`;
        code_display = `Respiratory rate`;
        valueQuantityUnit = `breaths/min`;
        valueQuantityCode = `/min`;
    }

    const jobObservation: any = await getJobObservation(limit, objekId);
    let dataObservation: any = [];
    if (jobObservation.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    } else {
        dataObservation = await Promise.all(
            jobObservation.map(async (item: any) => {
                const emrDetailId = item.emr_detail_id;
                const tglEmr = item.input_time;
                const payload = {
                    resourceType: "Observation",
                    status: "final",
                    category: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                    code: `${category_code}`,
                                    display: `${category_display}`,
                                },
                            ],
                        },
                    ],
                    code: {
                        coding: [
                            {
                                system: "http://loinc.org",
                                code: `${code}`,
                                display: `${code_display}`,
                            },
                        ],
                    },
                    subject: {
                        reference: `Patient/${item.patient_ihs_id}`,
                        display: `${item.nama_pasien}`,
                    },
                    encounter: {
                        reference: `Encounter/${item.encounter_id}`,
                    },
                    effectiveDateTime: `${tglEmr
                        .toISOString()
                        .replace(".000Z", "+00:00")}`,
                    issued: `${tglEmr
                        .toISOString()
                        .replace(".000Z", "+00:00")}`,
                    performer: [
                        {
                            reference: `Practitioner/${item.practitioner_ihs_id}`,
                            display: `${item.nama_pegawai}`,
                        },
                    ],
                    valueQuantity: {
                        value: parseInt(item.value, 10),
                        unit: `${valueQuantityUnit}`,
                        system: "http://unitsofmeasure.org",
                        code: `${valueQuantityCode}`,
                    },
                };

                const dataJob = {
                    endpoint_name: "observation",
                    status: 1,
                    method: "POST",
                    url: "/Observation",
                    key_simrs: emrDetailId.toString(),
                    payload: payload,
                };

                const checkObservationSatSet: any = await insertJobData(
                    dataJob
                );
                if (!checkObservationSatSet) {
                    return {
                        payload: payload,
                        emr_detail_id: emrDetailId.toString(),
                        status: "failed",
                    };
                } else {
                    const updateStatus = await updateStatusEmrDetail({
                        emr_detail_id: parseInt(emrDetailId, 10),
                        status_satu_sehat: 1,
                    });
                    return {
                        payload: payload,
                        emr_detail_id: emrDetailId.toString(),
                        status: "success",
                    };
                }
            })
        );
    }

    return {
        message: "OK",
        code: 200,
        data: dataObservation,
    };
};

export { generateJobEncounterService, generateJobObservationService };
