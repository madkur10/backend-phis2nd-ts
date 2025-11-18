import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataServiceRequest = async (limit: string, hasil_rad_detail_id: string = "") => {
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
            "AND (tss_rad.transaction_satu_sehat_id is null or tss_rad.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk::date BETWEEN (now()::date - interval '30 days') AND now()::date`;
        queryHasilRad = "";
        queryWhereTransaction = `AND tss_rad.transaction_satu_sehat_id is null`;
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
        hasil_rad_detail.hasil_rad_detail_id,
        hasil_rad.tgl_hasil,
        hasil_rad_detail.tindakan_id,
        r_tindakan.key_satu_sehat Tindakan_Satset_ID,
        r_tindakan.resources_type type_terminologi,
        user_rad.nama_pegawai Name_Practitioner_Rad,
        r_practitioner_rad.key_satu_sehat Practitioner_Rad_ID,
        tindakan.nama_tindakan,
        tss_rad.transaction_satu_sehat_id
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
    left outer join transaction_satu_sehat tss_rad on
        hasil_rad_detail.hasil_rad_detail_id = tss_rad.key_simrs
        and tss_rad.transaction_type = 'ServiceRequest'
    where
        registrasi.status_batal is null
        ${queryWhereTransaction}
        ${queryHasilRad}
        ${queryDate}
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);
    
    return getDataPasienNew;
};

const updateInsertIdServiceRequestRepo = async (
    hasil_rad_detail_id: bigint,
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
        key_simrs: hasil_rad_detail_id,
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

const updateUpdateIdServiceRequestRepo = async (
    hasil_rad_detail_id: bigint,
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
        key_simrs: hasil_rad_detail_id,
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
    getDataServiceRequest,
    updateInsertIdServiceRequestRepo,
    updateUpdateIdServiceRequestRepo,
};
