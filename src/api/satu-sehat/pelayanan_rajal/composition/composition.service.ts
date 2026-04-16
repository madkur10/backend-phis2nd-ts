import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataCompositionDiit,
    updateInsertIdCompositionRepo,
    updateUpdateIdCompositionRepo,
} from "./composition.repository";

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

const sendCompositionDiitService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataCompositionReady: any = await getDataCompositionDiit(limit);

    const resultPush: any = [];
    if (getDataCompositionReady.length > 0) {
        const promises = getDataCompositionReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Composition`;
            const method = "POST";
            const tglLayanan = element.tgl_masuk;

            const payload = {
                "resourceType": "Composition",
                "identifier": {
                    "system": `http://sys-ids.kemkes.go.id/composition/${orgId}`,
                    "value": element.emr_detail_id
                },
                "status": "final",
                "type": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "18842-5",
                            "display": "Discharge summary"
                        }
                    ]
                },
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "LP173421-1",
                                "display": "Report"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": `Patient/${element.patient_id}`,
                    "display": element.nama_pasien
                },
                "encounter": {
                    "reference": `Encounter/${element.encounter_id}`,
                },
                "date": tglLayanan,
                "author": [
                    {
                        "reference": `Practitioner/${element.practitioner_id}`,
                        "display": element.nama_pegawai
                    }
                ],
                "title": "Resume Medis Rawat Jalan",
                "custodian": {
                    "reference": `Organization/${orgId}`
                },
                "section": [
                    {
                        "code": {
                            "coding": [
                                {
                                    "system": "http://loinc.org",
                                    "code": "42344-2",
                                    "display": "Discharge diet (narrative)"
                                }
                            ]
                        },
                        "text": {
                            "status": "additional",
                            "div": element.value
                        }
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
                const updateInsertIdPatient = updateInsertIdCompositionRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    response.data.id,
                    response.data.resourceType + 'Diit',
                );
                resultPush.push({
                    ...element,
                    status: "sukses",
                });
            } else {
                const updateInsertIdPatient = updateInsertIdCompositionRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    "0",
                    "CompositionDiit",
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

const sendCompositionDiitByIdService = async (emr_detail_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataCompositionReady: any = await getDataCompositionDiit(
        "1",
        emr_detail_id,
    );

    const resultPush: any = [];
    if (getDataCompositionReady.length > 0) {
        const promises = getDataCompositionReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Composition`;
            const method = "POST";
            const tglLayanan = element.tgl_masuk;

            const payload = {
                "resourceType": "Composition",
                "identifier": {
                    "system": `http://sys-ids.kemkes.go.id/composition/${orgId}`,
                    "value": element.emr_detail_id
                },
                "status": "final",
                "type": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "18842-5",
                            "display": "Discharge summary"
                        }
                    ]
                },
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://loinc.org",
                                "code": "LP173421-1",
                                "display": "Report"
                            }
                        ]
                    }
                ],
                "subject": {
                    "reference": `Patient/${element.patient_id}`,
                    "display": element.nama_pasien
                },
                "encounter": {
                    "reference": `Encounter/${element.encounter_id}`,
                },
                "date": tglLayanan,
                "author": [
                    {
                        "reference": `Practitioner/${element.practitioner_id}`,
                        "display": element.nama_pegawai
                    }
                ],
                "title": "Resume Medis Rawat Jalan",
                "custodian": {
                    "reference": `Organization/${orgId}`
                },
                "section": [
                    {
                        "code": {
                            "coding": [
                                {
                                    "system": "http://loinc.org",
                                    "code": "42344-2",
                                    "display": "Discharge diet (narrative)"
                                }
                            ]
                        },
                        "text": {
                            "status": "additional",
                            "div": element.value
                        }
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
                const updateInsertIdPatient = updateInsertIdCompositionRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    response.data.id,
                    response.data.resourceType + 'Diit',
                );
                resultPush.push({
                    ...element,
                    status: "sukses",
                });
            } else {
                const updateInsertIdPatient = updateInsertIdCompositionRepo(
                    element.emr_detail_id,
                    payload,
                    response.data,
                    "0",
                    "CompositionDiit",
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

export { sendCompositionDiitService, sendCompositionDiitByIdService };
