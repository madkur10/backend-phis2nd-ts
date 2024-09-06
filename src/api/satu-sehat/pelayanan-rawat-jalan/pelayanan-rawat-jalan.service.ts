import {
    getJobEncounter,
    updateStatusRegistrasi,
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

export { generateJobEncounterService };
