import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

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

const getPractitionerSimrs = async (limit: number) => {
    const practitionerSimrs = await prismaDb1.pegawai.findMany({
        where: {
            id_satu_sehat: null,
            status_batal: null,
            nik: {
                not: null,
            },
        },
        select: {
            pegawai_id: true,
            nama_pegawai: true,
            nik: true,
        },
        orderBy: {
            pegawai_id: "asc",
        },
        take: limit,
    });
    return practitionerSimrs;
};

const getPatientSatSet = async (no_mr: string) => {
    const pasienSatSet = await prismaDb2.patient.findFirst({
        where: {
            no_mr,
        },
        select: {
            patient_ihs_id: true,
            patient_name: true,
            pasien_id: true,
        },
    });

    return pasienSatSet;
};

const getPractitionerSatSet = async (pegawaiId: any) => {
    const practitionerSatSet = await prismaDb2.practitioner.findFirst({
        where: {
            pegawai_id: pegawaiId,
        },
        select: {
            practitioner_ihs_id: true,
            practitioner_name: true,
            id: true,
        },
    });

    return practitionerSatSet;
};

const insertDataPatientSatSet = async (data: any) => {
    const patient = await prismaDb2.patient.create({
        data: {
            pasien_id: data.pasien_id,
            patient_name: data.nama_pasien,
            created_date: dateNow(),
            birth_date: new Date(data.tgl_lahir),
            nik: data.nik,
            no_mr: data.no_mr,
        },
    });

    return patient;
};

const getDataKfa = async (kfa_name: string) => {
    const kfa_data = await prismaDb2.kfa_references.findMany({
        where: {
            kfa_name: {
                contains: kfa_name,
                mode: "insensitive",
            },
        },
        select: {
            kfa_code: true,
            kfa_name: true,
        },
    });

    return kfa_data;
};

const updateDataPatientSatSet = async (responseSatSet: any, data: any) => {
    const patient = await prismaDb2.patient.update({
        where: {
            pasien_id: data.pasien_id,
        },
        data: {
            patient_ihs_id: responseSatSet.entry[0].resource.id,
            last_updated_date: dateNow(),
            ihs_json_data: responseSatSet,
        },
    });

    return patient;
};

const insertDataPractitionerSatSet = async (responseSatSet: any, data: any) => {
    const idPractiitioner = await generateMaxDb2("max_practitioner_idx", "id");
    const practitioner = await prismaDb2.practitioner.create({
        data: {
            id: idPractiitioner,
            practitioner_name: responseSatSet.entry[0].resource.name[0].text,
            created_date: dateNow(),
            birth_date: new Date(responseSatSet.entry[0].resource.birthDate),
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
            id: data.id,
        },
        data: {
            practitioner_name: responseSatSet.entry[0].resource.name[0].text,
            created_date: dateNow(),
            birth_date: new Date(responseSatSet.entry[0].resource.birthDate),
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
            created_date: dateNow(),
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
            last_updated_date: dateNow(),
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

const updateStatusPegawai = async (data: any) => {
    const updateStatus = await prismaDb1.pegawai.update({
        where: {
            pegawai_id: data.pegawai_id,
        },
        data: {
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

const getDataPractitioner = async (limit: string) => {
    const getDataPegawai = await prismaDb1.$queryRaw`
        SELECT
            pegawai.pegawai_id,
            pegawai.nik
        FROM
            pegawai
        LEFT JOIN resources ON
            resources.key_simrs = pegawai.pegawai_id
        WHERE
            pegawai.status_batal is null
            AND pegawai.nik IS NOT NULL
            AND resources.resources_id IS NULL
        ORDER BY
            pegawai.pegawai_id ASC
        LIMIT ${parseInt(limit, 10)};
    `;
    return getDataPegawai;
};

const updateInsertIdPractitionerRepo = async (
    pegawai_id: number,
    response: any,
    id: string,
    type: string
) => {
    const resourcesId = await generateMaxDb1(
        "max_resources_idx",
        "resources_id"
    );
    const insertRujukan = await prismaDb1.resources.create({
        data: {
            resources_id: resourcesId,
            input_time: dateNow(),
            input_user_id: 1,
            key_simrs: pegawai_id,
            key_satu_sehat: id,
            resources_type: type,
            response: response,
        },
    });
};

const getDataPatient = async (limit: string) => {
    const getDataPasien = await prismaDb1.$queryRaw`
        SELECT
            pasien.pasien_id,
            TRIM(pasien.ktp) ktp
        FROM
            pasien
        LEFT JOIN resources ON
            resources.key_simrs = pasien.pasien_id
        WHERE
            pasien.status_batal is null
            AND pasien.ktp IS NOT NULL
            AND LENGTH(TRIM(pasien.ktp)) = 16
            AND resources.resources_id IS NULL
        ORDER BY
            pasien.pasien_id DESC
        LIMIT ${parseInt(limit, 10)};
    `;
    return getDataPasien;
};

const updateInsertIdPatientRepo = async (
    pasien_id: number,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null
) => {
    const resourcesId = await generateMaxDb1(
        "max_resources_idx",
        "resources_id"
    );
    let data: any = {
        resources_id: resourcesId,
        input_time: dateNow(),
        input_user_id: 1,
        key_simrs: pasien_id,
        key_satu_sehat: id,
        resources_type: type,
        response: response,
    };
    if (gagal === 1) {
        data.status = 1;
    }
    const insertRujukan = await prismaDb1.resources.create({
        data,
    });
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
    getPractitionerSimrs,
    updateStatusPegawai,
    getDataPractitioner,
    updateInsertIdPractitionerRepo,
    getDataPatient,
    updateInsertIdPatientRepo,
    getDataKfa,
};
