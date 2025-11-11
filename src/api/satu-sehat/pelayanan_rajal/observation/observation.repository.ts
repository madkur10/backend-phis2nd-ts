import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataObservation = async (
    limit: string,
    emr_detail_id: string = ""
) => {
    let queryEmrDetail;
    let queryDate;
    let queryWhereTransaction;
    if (emr_detail_id) {
        queryDate = "";
        queryEmrDetail = `AND emr_detail.emr_detail_id = ${parseInt(
            emr_detail_id,
            10
        )}`;

        queryWhereTransaction =
            "AND (transaction_satu_sehat_observation.transaction_satu_sehat_id is null or transaction_satu_sehat_observation.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk::date = now()::date`;
        queryEmrDetail = "";
        queryWhereTransaction = `AND transaction_satu_sehat_observation.transaction_satu_sehat_id is null`;
    }

    const getDataPasien = `
        select
            distinct
            registrasi.registrasi_id Registration_ID,
            registrasi.tgl_masuk,
            pasien.nama_pasien Patient_Name,
            resources_patient.key_satu_sehat Patient_ID,
            resources_practitioner.key_satu_sehat Practitioner_ID,
            pegawai.nama_pegawai Practitioner_Name,
            resources_location.key_satu_sehat Location_Poli_id,
            bagian.nama_bagian,
            transaction_satu_sehat.key_satu_sehat Encounter_ID,
            emr_detail.emr_detail_id,
            emr_detail.objek_id,
            emr_detail.input_time input_time_emr,
            emr_detail.value,
            transaction_satu_sehat_observation.transaction_satu_sehat_id
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
            and bagian.referensi_bagian in (1, 313)
        inner join pegawai on
            registrasi_urut.pegawai_id = pegawai.pegawai_id
        inner join pasien on
            registrasi.pasien_id = pasien.pasien_id
        inner join resources resources_patient on
            pasien.pasien_id = resources_patient.key_simrs
            and resources_patient.resources_type = 'Patient'
            and resources_patient.key_satu_sehat <> '0'
        inner join resources resources_practitioner on
            pegawai.pegawai_id = resources_practitioner.key_simrs
            and resources_practitioner.resources_type = 'Practitioner'
        inner join resources resources_location on
            bagian.bagian_id = resources_location.key_simrs
            and resources_location.resources_type = 'Location'
        inner join emr on
            registrasi.registrasi_id = emr.registrasi_id
            and emr.status_batal is null
            and emr.form_id in (6, 36)
        inner join emr_detail on
            emr.emr_id = emr_detail.emr_id
            and emr_detail.objek_id in (6, 7, 13, 12, 14)
            and emr_detail.status_batal is null
        inner join transaction_satu_sehat on
            registrasi.registrasi_id = transaction_satu_sehat.key_simrs
            and transaction_satu_sehat.transaction_type = 'Encounter'
        left outer join transaction_satu_sehat transaction_satu_sehat_observation on
            emr_detail.emr_detail_id = transaction_satu_sehat_observation.key_simrs
            and transaction_satu_sehat_observation.transaction_type = 'Observation'
        where 
            registrasi.status_batal is null
            and transaction_satu_sehat.key_satu_sehat is not null
            and transaction_satu_sehat.key_satu_sehat <> '0'
            ${queryEmrDetail}
            ${queryDate}
            ${queryWhereTransaction}
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const getDataObservationRad = async (
    limit: string,
    hasil_rad_detail_id: string = ""
) => {
    let queryHasilRad;
    let queryDate;
    let queryWhereTransaction;
    if (hasil_rad_detail_id) {
        queryDate = "";
        queryHasilRad = `AND hasil_rad_detail.hasil_rad_detail_id = ${parseInt(
            hasil_rad_detail_id,
            10
        )}`;
        queryWhereTransaction =
            "AND (tss_observation_rad.transaction_satu_sehat_id is null or tss_observation_rad.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk::date BETWEEN (now()::date - interval '30 days') AND now()::date`;
        queryHasilRad = "";
        queryWhereTransaction = `AND tss_observation_rad.transaction_satu_sehat_id is null`;
    }
    const getDataPasien = `select
        registrasi.registrasi_id,
        r_patient.key_satu_sehat Patient_ID,
        tss_encounter.key_satu_sehat Encounter_ID,
        r_practitioner.key_satu_sehat Practitioner_Request_ID,
        users.nama_pegawai Request_Name_Practitioner,
        order_rad.order_rad_id,
        order_rad_detail.order_rad_detail_id,
        hasil_rad.hasil_rad_id,
        hasil_rad.tgl_hasil,
        hasil_rad_detail.tindakan_id,
        hasil_rad_detail.hasil_rad_detail_id,
        r_tindakan.key_satu_sehat Tindakan_Satset_ID,
        r_tindakan.resources_type type_terminologi,
        user_rad.nama_pegawai Name_Practitioner_Rad,
        r_practitioner_rad.key_satu_sehat Practitioner_Rad_ID,
        tindakan.nama_tindakan,
        tss_rad.key_satu_sehat service_request_id,
        hasil_rad_detail.deskripsi,
        hasil_rad_detail.kesan,
        hasil_rad_detail.saran,
        tss_observation_rad.transaction_satu_sehat_id
    from
        order_rad
    inner join order_rad_detail on
        order_rad.order_rad_id = order_rad_detail.order_rad_id 
        and order_rad_detail.status_batal is null
    inner join registrasi_detail on
        order_rad.registrasi_detail_id = registrasi_detail.registrasi_detail_id
    inner join registrasi on
        registrasi_detail.registrasi_id = registrasi.registrasi_id
    inner join pasien on
        registrasi.pasien_id = pasien.pasien_id 
    inner join users on
        order_rad.kirim_user_id = users.user_id
    inner join resources as r_patient on
        pasien.pasien_id = r_patient.key_simrs 
        and r_patient.resources_type = 'Patient'
    inner join transaction_satu_sehat as tss_encounter on 
        registrasi.registrasi_id = tss_encounter.key_simrs 
        and tss_encounter.transaction_type = 'Encounter'
        and tss_encounter.key_satu_sehat <> '0'
    inner join resources as r_practitioner on
        users.pegawai_id = r_practitioner.key_simrs
        and r_practitioner.resources_type = 'Practitioner'
    inner join hasil_rad on
        registrasi_detail.registrasi_detail_id = hasil_rad.registrasi_detail_id
        and hasil_rad.status_batal is null
    inner join users user_rad on
        hasil_rad.input_user_id = user_rad.user_id 
    inner join resources r_practitioner_rad on
        user_rad.pegawai_id = r_practitioner_rad.key_simrs 
        and r_practitioner_rad.resources_type = 'Practitioner'
    inner join hasil_rad_detail on
        hasil_rad.hasil_rad_id = hasil_rad_detail.hasil_rad_id
        and hasil_rad_detail.status_batal is null
    inner join tindakan on
        hasil_rad_detail.tindakan_id = tindakan.tindakan_id 
    inner join resources r_tindakan on
        tindakan.tindakan_id = r_tindakan.key_simrs 
        and r_tindakan.resources_type in ('SnomedCT', 'LOINC')
    inner join transaction_satu_sehat tss_rad on
        hasil_rad_detail.hasil_rad_detail_id = tss_rad.key_simrs
        and tss_rad.transaction_type = 'ServiceRequest'
        and tss_rad.key_satu_sehat <> '0'
    left join transaction_satu_sehat tss_observation_rad on
        hasil_rad_detail.hasil_rad_detail_id = tss_observation_rad.key_simrs 
        and tss_observation_rad.transaction_type = 'ObservationRad'
    where
        registrasi.status_batal is null
        ${queryDate}
        ${queryHasilRad}
        ${queryWhereTransaction}
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdObservationRepo = async (
    emr_detail_id: bigint,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null
) => {
    const transaction_satu_sehatId = await generateMaxDb1(
        "max_transaction_satu_sehat_idx",
        "transaction_satu_sehat_id"
    );
    let data: any = {
        transaction_satu_sehat_id: transaction_satu_sehatId,
        input_time: dateNow(),
        input_user_id: 1,
        payload: payload,
        key_simrs: emr_detail_id,
        key_satu_sehat: id,
        transaction_type: type,
        response: response,
    };
    if (gagal === 1) {
        data.status = 1;
    }
    const insertRujukan = await prismaDb1.transaction_satu_sehat.create({
        data,
    });
};

const updateUpdateIdObservationRepo = async (
    registrasi_id: number,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null,
    transaction_satu_sehat_id: number | null = null
) => {
    let data: any = {
        mod_time: dateNow(),
        mod_user_id: 1,
        payload: payload,
        key_simrs: registrasi_id,
        key_satu_sehat: id,
        transaction_type: type,
        response: response,
    };
    if (gagal === 1) {
        data.status = 1;
    }
    if (transaction_satu_sehat_id) {
        data.transaction_satu_sehat_id = transaction_satu_sehat_id;
    }
    const updateRujukan = await prismaDb1.transaction_satu_sehat.update({
        where: {
            transaction_satu_sehat_id: parseInt(
                data.transaction_satu_sehat_id,
                10
            ),
        },
        data,
    });
};

export {
    getDataObservation,
    getDataObservationRad,
    updateInsertIdObservationRepo,
    updateUpdateIdObservationRepo,
};
