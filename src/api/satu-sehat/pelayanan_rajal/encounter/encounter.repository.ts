import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataEncounter = async (limit: string, registrasi_id: string = "") => {
    let queryRegistrasi;
    let queryDate;
    let queryWhereTransaction;
    if (registrasi_id) {
        queryDate = "";
        queryRegistrasi = `AND registrasi.registrasi_id = ${parseInt(
            registrasi_id,
            10
        )}`;

        queryWhereTransaction = "AND (transaction_satu_sehat.transaction_satu_sehat_id is null or transaction_satu_sehat.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk::date = now()::date`;
        queryRegistrasi = "";
        queryWhereTransaction = `AND transaction_satu_sehat.transaction_satu_sehat_id is null`;
    }

    const getDataPasien = `select
            distinct
            registrasi.registrasi_id Registration_ID,
            registrasi_urut.tgl_urut,
            pasien.nama_pasien Patient_Name,
            resources_patient.key_satu_sehat Patient_ID,
            resources_practitioner.key_satu_sehat Practitioner_ID,
            pegawai.nama_pegawai Practitioner_Name,
            resources_location.key_satu_sehat Location_Poli_id,
            bagian.nama_bagian Location_Poli_Name,
            transaction_satu_sehat.transaction_satu_sehat_id
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
            and emr.form_id = 3
        left outer join transaction_satu_sehat on
            registrasi.registrasi_id = transaction_satu_sehat.key_simrs
            and transaction_satu_sehat.transaction_type = 'Encounter'
        where 
            registrasi.status_batal is null
            ${queryWhereTransaction}
            ${queryDate}
            ${queryRegistrasi}
        limit ${parseInt(limit, 10)};`;

    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdEncounterRepo = async (
    registrasi_id: number,
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
        key_simrs: registrasi_id,
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

const updateUpdateIdEncounterRepo = async (
    registrasi_id: number,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null,
    transaction_satu_sehat_id: number | null = null,
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
            transaction_satu_sehat_id: parseInt(data.transaction_satu_sehat_id, 10),
        },
        data,
    });
};

export { getDataEncounter, updateInsertIdEncounterRepo, updateUpdateIdEncounterRepo };
