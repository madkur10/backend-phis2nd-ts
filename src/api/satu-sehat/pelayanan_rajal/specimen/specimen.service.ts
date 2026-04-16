import { environment } from "../../../../utils/config";
import { checkTokenService } from "../../generate-token/generate-token.service";
import {
    getDataSpecimen,
    updateInsertIdSpecimenRepo,
    updateUpdateIdSpecimenRepo,
} from "./specimen.repository";

import { requestAxios } from "../../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC",
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const sendSpecimenService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataSpecimenReady: any = await getDataSpecimen(limit);

    const resultPush: any = [];
    if (getDataSpecimenReady.length > 0) {
        const promises = getDataSpecimenReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Specimen`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "Specimen",
                identifier: [
                    {
                        system: `http://sys-ids.kemkes.go.id/specimen/${orgId}`,
                        value: `${element.order_lab_detail_id}`,
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
                const updateInsertIdPatient = updateInsertIdSpecimenRepo(
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
                const updateInsertIdPatient = updateInsertIdSpecimenRepo(
                    element.order_lab_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Specimen",
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

    const getDataSpecimenReady: any = await getDataSpecimen(
        "1",
        order_lab_detail_id,
    );

    const resultPush: any = [];
    if (getDataSpecimenReady.length > 0) {
        const promises = getDataSpecimenReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Specimen`;
            const method = "POST";
            const tglLayanan = element.tgl_hasil;

            const payload = {
                resourceType: "Specimen",
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
                const updateInsertIdPatient = updateInsertIdSpecimenRepo(
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
                const updateInsertIdPatient = updateInsertIdSpecimenRepo(
                    element.order_lab_detail_id,
                    payload,
                    response.data,
                    "0",
                    "Specimen",
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

export { sendSpecimenService, sendServRequestOrderRadService };
