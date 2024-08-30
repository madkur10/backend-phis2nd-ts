import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

const input_time_now: string = dateNow();

const getPatientSimrs = async (limit: number) => {
    const patientSimrs = await prismaDb1.pasien.findMany({
        where: {
            id_satu_sehat: null,
            ktp: {
                not: null,
            },
            status_satu_sehat: null,
        },
        select: {
            no_mr: true,
            pasien_id: true,
            ktp: true,
            tgl_lahir: true,
            nama_pasien: true,
            jenis_kelamin: true,
        },
        orderBy: {
            no_mr: "asc",
        },
        take: limit,
    });
    return patientSimrs;
};

const getPatientSatSet = async (no_mr: string) => {
    const pasienSatSet = await prismaDb2.patient.findFirst({
        where: {
            no_mr: no_mr,
        },
        select: {
            patient_ihs_id: true,
            patient_name: true,
        },
    });

    return pasienSatSet;
};

const getPractitionerSatSet = async (dataPractitioner: any) => {
    const pegawaiId = dataPractitioner.pegawai_id;
    const practitionerSatSet = await prismaDb2.practitioner.findFirst({
        where: {
            pegawai_id: pegawaiId.toString(),
        },
        select: {
            practitioner_ihs_id: true,
            practitioner_name: true,
        },
    });

    return practitionerSatSet;
};

const insertDataPatientSatSet = async (responseSatSet: any, data: any) => {
    const pasienId = parseInt(data.no_mr, 10);
    const patient = await prismaDb2.patient.create({
        data: {
            pasien_id: pasienId.toString(),
            patient_name: responseSatSet.entry[0].resource.name[0].text,
            patient_ihs_id: responseSatSet.entry[0].resource.id,
            created_date: input_time_now,
            no_mr: data.no_mr,
            ihs_json_data: responseSatSet,
        },
    });

    return patient;
};

const updateDataPatientSatSet = async (responseSatSet: any, data: any) => {
    const pasienId = parseInt(data.no_mr, 10);
    const patient = await prismaDb2.patient.update({
        where: {
            pasien_id: pasienId.toString(),
        },
        data: {
            patient_ihs_id: responseSatSet.entry[0].resource.id,
            last_updated_date: input_time_now,
            ihs_json_data: responseSatSet,
        },
    });

    return patient;
};

const insertDataPractitionerSatSet = async (responseSatSet: any, data: any) => {
    const idPractiitioner = await generateMaxDb2("practitioner", "id");
    const practitioner = await prismaDb2.practitioner.create({
        data: {
            id: idPractiitioner,
            practitioner_name: responseSatSet.entry[0].resource.name[0].text,
            created_date: input_time_now,
            birth_date: responseSatSet.entry[0].resource.birthDate,
            gender: responseSatSet.entry[0].resource.gender,
            practitioner_ihs_id: responseSatSet.entry[0].resource.id,
            ihs_json_data: responseSatSet,
            nik: data.nik,
            pegawai_id: data.pegawai_id,
        },
    });

    return practitioner;
};

const updateDataPractitionerSatSet = async (responseSatSet: any, data: any) => {
    const patient = await prismaDb2.practitioner.updateMany({
        where: {
            nik: data.nik,
        },
        data: {
            practitioner_name: responseSatSet.entry[0].resource.name[0].text,
            created_date: input_time_now,
            birth_date: responseSatSet.entry[0].resource.birthDate,
            gender: responseSatSet.entry[0].resource.gender,
            practitioner_ihs_id: responseSatSet.entry[0].resource.id,
            ihs_json_data: responseSatSet,
            nik: data.nik,
            pegawai_id: data.pegawai_id,
        },
    });

    return patient;
};

const insertJobData = async (data: any) => {
    const idJob = await generateMaxDb2("max_job_idx", "id");
    const job = await prismaDb2.job.create({
        data: {
            id: idJob,
            created_date: input_time_now,
            endpoint_name: data.endpoint_name,
            payload: data.payload,
            status: data.status,
            method: data.method,
            url: data.url,
            key_simrs: data.key_simrs,
        },
    });

    return job;
};

const updateJobData = async (data: any) => {
    const job = await prismaDb2.job.update({
        where: {
            id: data.id,
        },
        data: {
            last_updated_date: input_time_now,
            status: data.status,
            response: data.response,
        },
    });

    return job;
};

const updateStatusPasien = async (data: any) => {
    const updateStatus = await prismaDb1.pasien.updateMany({
        where: {
            no_mr: data.no_mr,
        },
        data: {
            status_satu_sehat: data.status_satu_sehat,
            id_satu_sehat: data.id_satu_sehat,
        },
    });

    return updateStatus;
};

const getJob = async (endpoint_name: string, limit: number) => {
    const job = await prismaDb2.job.findMany({
        where: {
            status: {
                in: [1, 3],
            },
            endpoint_name: endpoint_name,
        },
        select: {
            id: true,
            created_date: true,
            endpoint_name: true,
            payload: true,
            status: true,
            method: true,
            url: true,
            key_simrs: true,
        },
        orderBy: [
            {
                status: "asc",
            },
            {
                created_date: "asc",
            },
        ],
        take: limit,
    });

    return job;
};

export {
    getPatientSatSet,
    insertDataPatientSatSet,
    updateDataPatientSatSet,
    getPractitionerSatSet,
    insertDataPractitionerSatSet,
    updateDataPractitionerSatSet,
    getPatientSimrs,
    insertJobData,
    updateJobData,
    updateStatusPasien,
    getJob,
};
