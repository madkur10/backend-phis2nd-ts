import { getJobEncounter, insertJob } from "./pelayanan-rawat-jalan.repository";
import { getPatientSatSet } from "../resources/resources.repository";
import {
    patientService,
    practitionerService,
} from "../resources/resources.service";

import { requestAxios } from "./../../../utils/axiosClient";
import * as dotenv from "dotenv";
import { environment } from "./../../../utils/config";
import { checkTokenService } from "../generate-token/generate-token.service";
dotenv.config();

const generateJobEncounterService = async () => {
    const jobEncounter: any = await getJobEncounter();
    if (jobEncounter.length < 1) {
        return {
            message: "Tidak ada data",
            code: 200,
        };
    } else {
        jobEncounter.forEach(async (item: any) => {
            const dataPatient = {
                no_mr: item.no_mr,
                pasien_id: item.pasien_id,
                ktp: item.ktp,
                birthdate: item.tgl_lahir,
                gender: item.jenis_kelamin,
            };
            let patientSatuSehat = await patientService(dataPatient);

            const dataPractitioner = {
                pegawai_id: item.pegawai_id,
                nik: item.nik,
            };
            let practitionerSatuSehat = await practitionerService(
                dataPractitioner
            );

            const payloadSatSet = {
                resourceType: "Encounter",
                identifier: [
                    {
                        system:
                            "http://sys-ids.kemkes.go.id/encounter/" +
                            environment.satusehat.org_id,
                        value: item.registrasi_id,
                    },
                ],
                status: "arrived",
                class: {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "AMB",
                    display: "ambulatory",
                },
                subject: {
                    reference: `"Patient/${patientSatuSehat.patient_ihs_id}"`,
                    display: `"${patientSatuSehat.patient_name}"`,
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
                            reference: `Practitioner/${practitionerSatuSehat.practitioner_ihs_id}`,
                            display: `"${practitionerSatuSehat.practitioner_name}"`,
                        },
                    },
                ],
                period: {
                    start: "2023-08-31T00:00:00+00:00",
                },
                location: [
                    {
                        location: {
                            reference: "Location/{{Location_Poli_id}}",
                            display: "{{Location_Poli_Name}}",
                        },
                        period: {
                            start: "2023-08-31T00:00:00+00:00",
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
                            start: "2023-08-31T00:00:00+00:00",
                        },
                    },
                ],
                serviceProvider: {
                    reference: "Organization/" + environment.satusehat.org_id,
                },
            };

            console.log(payloadSatSet);
            
        });
    }
    
    return {
        message: "Job Generate Success",
        code: 200,
    };
};

export { generateJobEncounterService };
