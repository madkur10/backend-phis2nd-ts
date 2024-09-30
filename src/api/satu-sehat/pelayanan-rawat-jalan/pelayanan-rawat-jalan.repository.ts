import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

const input_time_now: string = dateNow();

const getJobEncounter = async (limit: number) => {
    const getEncounter = `select 
                            registrasi.registrasi_id,
                            registrasi.jenis_rawat,
                            bagian.nama_bagian,
                            bagian.bagian_id,
                            pegawai.pegawai_id,
                            pegawai.nama_pegawai,
                            pegawai.nik,
                            pasien.no_mr,
                            pasien.pasien_id,
                            pasien.nama_pasien,
                            pasien.ktp,
                            pasien.jenis_kelamin,
                            pasien.tgl_lahir,
                            registrasi_urut.tgl_urut,
                            pasien.id_satu_sehat as pasien_ihs_id,
                            bagian.id_satu_sehat as location_id,
                            pegawai.id_satu_sehat as practitioner_ihs_id
                        from
                            registrasi
                        inner join registrasi_detail on
                            registrasi.registrasi_id = registrasi_detail.registrasi_id 
                            and registrasi_detail.status_batal is null
                        inner join registrasi_urut on
                            registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id 
                            and registrasi_urut.status_batal is null
                        inner join bagian on
                            registrasi_detail.bagian_id = bagian.bagian_id 
                            and bagian.referensi_bagian = 1
                            and bagian.id_satu_sehat is not null
                        inner join pegawai on
                            registrasi_urut.pegawai_id = pegawai.pegawai_id
                            and pegawai.id_satu_sehat is not null
                        inner join pasien on
                            registrasi.pasien_id = pasien.pasien_id
                            and pasien.id_satu_sehat is not null
                            and pasien.id_satu_sehat <> ''
                        inner join emr on
                            registrasi.registrasi_id = emr.registrasi_id
                            and emr.status_batal is null
                            and emr.form_id = 3
                        where 
                            registrasi.status_batal is null
                            and registrasi.tgl_masuk::date = now()::date 
                            and registrasi.status_satu_sehat is null
                            and registrasi.id_satu_sehat is null
                        limit ${limit}
                        `;
    const getEncounterData = await prismaDb3.$queryRawUnsafe(getEncounter);

    return getEncounterData;
};

const updateStatusRegistrasi = async (data: any) => {
    const updateStatus = await prismaDb1.registrasi.update({
        where: {
            registrasi_id: data.registrasi_id,
        },
        data: {
            status_satu_sehat: data.status_satu_sehat,
            id_satu_sehat: data.id_satu_sehat,
        },
    });

    return updateStatus;
};

const getEncounterSatSet = async (registrasiId: any) => {
    const pasienSatSet = await prismaDb2.admission.findFirst({
        where: {
            registrasi_id: parseInt(registrasiId, 10),
        },
        select: {
            id: true,
            pasien_id: true,
            dr_id: true,
            created_date: true,
        },
    });

    return pasienSatSet;
};

const updateDataEncounterSatSet = async (responseSatSet: any, data: any) => {
    const updateEncounterSatSet = await prismaDb2.admission.update({
        where: {
            id: data.id,
        },
        data: {
            encounter_ihs_id: responseSatSet.id,
            last_updated_date: input_time_now,
        },
    });
};

const insertDataEncounterSatSet = async (data: any) => {
    const encounterId = await generateMaxDb2("max_admission_idx", "id");

    const insertEncounterSatSet = await prismaDb2.admission.create({
        data: {
            id: encounterId,
            bagian_id: data.bagian_id,
            dr_id: data.dr_id,
            pasien_id: data.pasien_id,
            created_date: input_time_now,
            admission_type: data.admission_type,
            registrasi_id: data.registrasi_id,
        },
    });
};

const getEmrDetailObservationSatSet = async (data: any) => {
    const pasienSatSet = await prismaDb2.admission_observation.findFirst({
        where: {
            observation_ext_id: data.emr_detail_id,
        },
        select: {
            admission_id: true,
            observation_value: true,
            observation_type: true,
            created_date: true,
        },
    });

    return pasienSatSet;
};

const getEmrDetailConditionSatSet = async (data: any) => {
    const pasienSatSet = await prismaDb2.dischargediagnosis.findFirst({
        where: {
            diag_ext_id: data.emr_detail_id,
        },
        select: {
            admission_id: true,
            diag_code: true,
            created_date: true,
        },
    });

    return pasienSatSet;
};

const updateDataEmrDetailObservationSatSet = async (
    responseSatSet: any,
    data: any
) => {
    const updateEmrDetailSatSet =
        await prismaDb2.admission_observation.updateMany({
            where: {
                observation_ext_id: parseInt(data.emr_detail_id, 10),
            },
            data: {
                observation_ihs_id: responseSatSet.id,
                last_updated_date: input_time_now,
            },
        });

    return updateEmrDetailSatSet;
};

const getAdmissionIdByEncounterId = async (encounter_id: any) => {
    const admissionId = await prismaDb2.admission.findFirst({
        where: {
            encounter_ihs_id: encounter_id,
        },
        select: {
            id: true,
        },
    });

    return admissionId;
};

const insertDataEmrDetailObservationSatSet = async (data: any) => {
    const insertEmrDetailSatSet = await prismaDb2.admission_observation.create({
        data: {
            admission_id: data.admission_id,
            observation_value: data.value,
            observation_type: data.type,
            created_date: input_time_now,
            observation_ext_id: data.emr_detail_id,
        },
    });

    return insertEmrDetailSatSet;
};

const updateDataEmrDetailConditionSatSet = async (
    responseSatSet: any,
    data: any
) => {
    const updateEmrDetailSatSet = await prismaDb2.dischargediagnosis.updateMany(
        {
            where: {
                diag_ext_id: parseInt(data.emr_detail_id, 10),
            },
            data: {
                condition_ihs_id: responseSatSet.id,
                last_updated_date: input_time_now,
            },
        }
    );

    return updateEmrDetailSatSet;
};

const insertDataEmrDetailConditionSatSet = async (data: any) => {
    const insertEmrDetailSatSet = await prismaDb2.dischargediagnosis.create({
        data: {
            admission_id: data.admission_id,
            diag_code: data.diag_code,
            diag_status: data.diag_status,
            created_date: input_time_now,
            diag_label: data.diag_label,
            diag_ext_id: data.emr_detail_id,
        },
    });

    return insertEmrDetailSatSet;
};

const getJobObservation = async (limit: number, objekId: number) => {
    const getObservation = `select 
                                emr_detail.emr_detail_id,
                                emr_detail.objek_id,
                                emr_detail.variabel,
                                emr_detail.value,
                                registrasi.id_satu_sehat as encounter_id,
                                pasien.id_satu_sehat as patient_ihs_id,
                                pasien.nama_pasien,
                                pegawai.id_satu_sehat as practitioner_ihs_id,
                                pegawai.nama_pegawai,
                                emr_detail.input_time
                            from
                                registrasi
                            inner join pasien on
                                registrasi.pasien_id = pasien.pasien_id
                                and pasien.id_satu_sehat is not null
                            inner join emr on
                                registrasi.registrasi_id = emr.registrasi_id 
                                and emr.status_batal is null
                                and emr.form_id = 10
                            inner join users on
                                emr.input_user_id = users.user_id 
                            inner join pegawai on
                                users.pegawai_id = pegawai.pegawai_id
                                and pegawai.id_satu_sehat is not null
                            inner join emr_detail on
                                emr.emr_id = emr_detail.emr_id
                                and emr_detail.status_batal is null
                                and emr_detail.objek_id = ${objekId}
                                and emr_detail.status_satu_sehat is NULL
                            where 
                                registrasi.status_batal is null
                                and registrasi.id_satu_sehat is not null
                                and registrasi.tgl_masuk::date = now()::date
                            limit ${limit}`;
    const getObservationData: any = await prismaDb3.$queryRawUnsafe(
        getObservation
    );

    const formattedData = getObservationData.map((item: any) => ({
        ...item,
        emr_detail_id: item.emr_detail_id.toString(),
    }));

    return formattedData;
};

const updateStatusEmrDetail = async (data: any) => {
    const updateStatus = await prismaDb1.emr_detail.update({
        where: {
            emr_detail_id: data.emr_detail_id,
        },
        data: {
            status_satu_sehat: data.status_satu_sehat,
            id_satu_sehat: data.id_satu_sehat,
        },
    });

    return updateStatus;
};

const getJobCondition = async (limit: number) => {
    const getCondition = `select 
                                emr_detail.emr_detail_id,
                                emr_detail.objek_id,
                                emr_detail.variabel,
                                emr_detail.value,
                                registrasi.id_satu_sehat as encounter_id,
                                pasien.id_satu_sehat as patient_ihs_id,
                                pasien.nama_pasien,
                                pegawai.id_satu_sehat as practitioner_ihs_id,
                                pegawai.nama_pegawai,
                                emr_detail.input_time,
                                icd.kode_diagnosa,
                                icd.nama_diagnosa 
                            from
                                registrasi
                            inner join pasien on
                                registrasi.pasien_id = pasien.pasien_id
                                and pasien.id_satu_sehat is not null
                            inner join emr on
                                registrasi.registrasi_id = emr.registrasi_id 
                                and emr.status_batal is null
                                and emr.form_id = 3
                            inner join users on
                                emr.input_user_id = users.user_id 
                            inner join pegawai on
                                users.pegawai_id = pegawai.pegawai_id
                                and pegawai.id_satu_sehat is not null
                            inner join emr_detail on
                                emr.emr_id = emr_detail.emr_id
                                and emr_detail.status_batal is null
                                and emr_detail.objek_id = 42
                                and emr_detail.variabel in ('primary', 'secondary')
                                and emr_detail.value is not null
                                and emr_detail.status_satu_sehat is null
                            inner join icd on
                                emr_detail.value::int = icd.icd_id
                            where 
                                registrasi.status_batal is null
                                and registrasi.id_satu_sehat is not null
                                and registrasi.tgl_masuk::date = now()::date
                            limit ${limit}`;
    const getConditionData: any = await prismaDb3.$queryRawUnsafe(getCondition);
    const formattedData = getConditionData.map((item: any) => ({
        ...item,
        emr_detail_id: item.emr_detail_id.toString(),
    }));

    return formattedData;
};

export {
    getJobEncounter,
    updateStatusRegistrasi,
    getEncounterSatSet,
    updateDataEncounterSatSet,
    insertDataEncounterSatSet,
    getJobObservation,
    updateStatusEmrDetail,
    getEmrDetailObservationSatSet,
    getEmrDetailConditionSatSet,
    insertDataEmrDetailObservationSatSet,
    insertDataEmrDetailConditionSatSet,
    updateDataEmrDetailObservationSatSet,
    updateDataEmrDetailConditionSatSet,
    getJobCondition,
    getAdmissionIdByEncounterId,
};
