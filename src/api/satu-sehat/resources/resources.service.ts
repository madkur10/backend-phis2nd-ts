import { environment } from "../../../utils/config";
import {
    getDataPractitioner,
    updateInsertIdPractitionerRepo,
    getDataPatient,
    updateInsertIdPatientRepo,
    getDataKfa,
    getDataPasien,
} from "./resources.repository";
import { checkTokenService } from "../generate-token/generate-token.service";

import { requestAxios } from "../../../utils/axiosClient";
import { format } from "date-fns-tz";

const date = new Date();
const timeZone: string = environment.timezone;
const formattedUtcDate = new Date(
    format(date, "yyyy-MM-dd HH:mm:ss", { timeZone }) + " UTC",
);
const baseUrl = environment.satusehat.url_base;
const orgId = environment.satusehat.org_id;

const getPatientNikService = async (nik: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getPractitionerNikService = async (nik: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const createOrganizationService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Organization`;
    const method = "POST";
    const payload = {
        resourceType: "Organization",
        active: true,
        identifier: [
            {
                use: "official",
                system: "http://sys-ids.kemkes.go.id/organization/" + orgId,
                value: data.bagian_id,
            },
        ],
        type: [
            {
                coding: [
                    {
                        system: "http://terminology.hl7.org/CodeSystem/organization-type",
                        code: "dept",
                        display: "Hospital Department",
                    },
                ],
            },
        ],
        name: data.nama_bagian,
        partOf: {
            reference: "Organization/" + orgId,
        },
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getOrganizationPartofService = async (organization_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    organization_id = organization_id ?? orgId;

    const url = `${baseUrl}/Organization?partof=${organization_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getOrganizationIdService = async (organization_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const url = `${baseUrl}/Organization/${organization_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const createLocationService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Location`;
    const method = "POST";
    const payload = {
        resourceType: "Location",
        identifier: [
            {
                system: "http://sys-ids.kemkes.go.id/location/" + orgId,
                value: data.bagian_id,
            },
        ],
        status: "active",
        name: data.nama_bagian,
        description: "This is a location for " + data.nama_bagian,
        mode: "instance",
        physicalType: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
                    code: "ro",
                    display: "Room",
                },
            ],
        },
        managingOrganization: {
            reference: "Organization/" + data.organization_id,
        },
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const createLocationBedService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Location`;
    const method = "POST";
    const payload = {
        resourceType: "Location",
        identifier: [
            {
                system: "http://sys-ids.kemkes.go.id/location/" + orgId,
                value: data.bed_id,
            },
        ],
        status: "active",
        name: data.nama_bed,
        description: "This is a location for " + data.nama_bed,
        mode: "instance",
        physicalType: {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/location-physical-type",
                    code: "ro",
                    display: "Room",
                },
            ],
        },
        managingOrganization: {
            reference: `Organization/${orgId}`,
        },
        partOf: {
            reference: `Location/${data.location_bagian_id}`,
            display: `${data.nama_bed}`,
        },
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getLocationIdService = async (location_id: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const url = `${baseUrl}/Location/${location_id}`;
    const method = "GET";
    const payload = null;
    const response: any = await requestAxios(headersData, url, method, payload);

    return response;
};

const getPractitionerSendAllService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataPractitionerReady: any = await getDataPractitioner(limit);

    const resultPush: any = [];
    if (getDataPractitionerReady.length > 0) {
        const promises = getDataPractitionerReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${element.nik}`;
            const method = "GET";
            const payload = null;
            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload,
            );

            if (response.status === 200) {
                if (response.data.total === 0) {
                    resultPush.push({
                        ...element,
                        status: "gagal",
                    });
                } else {
                    const updateInsertIdPractitioner =
                        updateInsertIdPractitionerRepo(
                            element.pegawai_id,
                            response.data,
                            response.data.entry[0].resource.id,
                            response.data.entry[0].resource.resourceType,
                        );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
                resultPush.push({
                    ...element,
                    status: "gagal",
                });
            }
        });
        await Promise.all(promises);
    }

    return resultPush;
};

const getPatientSendAllService = async (limit: string) => {
    const tokenService = await checkTokenService();
    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }
    let token = tokenService?.data?.access_token;

    const getDataPatientReady: any = await getDataPatient(limit);

    const resultPush: any = [];
    if (getDataPatientReady.length > 0) {
        const promises = getDataPatientReady.map(async (element: any) => {
            const headersData = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };
            const url = `${baseUrl}/Patient?identifier=https://fhir.kemkes.go.id/id/nik|${element.ktp}`;
            const method = "GET";
            const payload = null;
            const response: any = await requestAxios(
                headersData,
                url,
                method,
                payload,
            );

            if (response.status === 200) {
                if (response.data.total === 0) {
                    const updateInsertIdPatient = updateInsertIdPatientRepo(
                        element.pasien_id,
                        payload,
                        response.data,
                        "0",
                        "Patient",
                        1,
                    );
                    resultPush.push({
                        ...element,
                        status: "gagal",
                    });
                } else {
                    const updateInsertIdPatient = updateInsertIdPatientRepo(
                        element.pasien_id,
                        payload,
                        response.data,
                        response.data.entry[0].resource.id,
                        response.data.entry[0].resource.resourceType,
                    );
                    resultPush.push({
                        ...element,
                        status: "sukses",
                    });
                }
            } else {
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

const getResourcesKfaService = async (kfa_name: string) => {
    const getDataKfaReady: any = await getDataKfa(kfa_name);

    let datax;
    let code;
    let data;

    if (getDataKfaReady.length > 0) {
        code = 200;
        data = getDataKfaReady;
    } else {
        code = 201;
        data = "";
    }

    return (datax = {
        status: code,
        data: data,
    });
};

const createPatientService = async (data: any) => {
    const tokenService = await checkTokenService();

    if (tokenService?.code !== 200) {
        throw new Error("Generate Token Failed");
    }

    let token = tokenService?.data?.access_token;
    const responseResult: any = [];
    const getDataPasienReady: any = await getDataPasien(data.pasien_id);
    const headersData = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
    const url = `${baseUrl}/Patient`;
    const method = "POST";
    const payload = {
        resourceType: "Patient",
        meta: {
            profile: [
                "https://fhir.kemkes.go.id/r4/StructureDefinition/Patient",
            ],
        },
        identifier: [
            {
                use: "official",
                system: "https://fhir.kemkes.go.id/id/nik",
                value: getDataPasienReady.ktp,
            },
        ],
        active: true,
        name: [
            {
                use: "official",
                text: getDataPasienReady.nama_pasien,
            },
        ],
        gender:
            getDataPasienReady.jenis_kelamin == "Laki-Laki" ? "male" : "female",
        birthDate: getDataPasienReady.tgl_lahir,
        multipleBirthBoolean: true,
    };

    const response: any = await requestAxios(headersData, url, method, payload);

    if (response.status === 201) {
        const updateInsertIdPatient = updateInsertIdPatientRepo(
            data.pasien_id,
            payload,
            response.data,
            response.data.id,
            response.data.resourceType,
        );
        responseResult.push({
            ...getDataPasienReady,
            status: "sukses",
        });
    } else {
        const updateInsertIdPatient = updateInsertIdPatientRepo(
            data.pasien_id,
            payload,
            response.data,
            "0",
            "Encounter",
            1,
        );

        responseResult.push({
            ...getDataPasienReady,
            status: "gagal",
            response: response.data,
        });
    }

    return responseResult;
};

export {
    getPatientNikService,
    getPractitionerNikService,
    createOrganizationService,
    getOrganizationPartofService,
    getOrganizationIdService,
    createLocationService,
    getLocationIdService,
    getPractitionerSendAllService,
    getPatientSendAllService,
    getResourcesKfaService,
    createLocationBedService,
    createPatientService,
};
