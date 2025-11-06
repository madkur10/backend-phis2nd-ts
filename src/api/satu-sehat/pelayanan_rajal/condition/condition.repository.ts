import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataCondition = async (limit: string, emr_detail_id: string = "") => {
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
            "AND (transaction_satu_sehat_condition.transaction_satu_sehat_id is null or transaction_satu_sehat_condition.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk::date BETWEEN (now()::date - interval '30 days') AND now()::date`;
        queryEmrDetail = "";
        queryWhereTransaction = `AND transaction_satu_sehat_condition.transaction_satu_sehat_id is null`;
    }
    const getDataPasien = `select
            registrasi.registrasi_id Registration_ID,
            registrasi.tgl_masuk,
            pasien.nama_pasien Patient_Name,
            resources_patient.key_satu_sehat Patient_ID,
            bagian.nama_bagian,
            tss_encounter.key_satu_sehat Encounter_ID,
            emr_detail.emr_detail_id,
            emr_detail.objek_id,
            emr_detail.input_time input_time_emr,
            emr_detail.value,
            icd.kode_diagnosa,
            icd.nama_diagnosa,
            tss_condition.transaction_satu_sehat_id
        from
            registrasi
        inner join registrasi_detail on
            registrasi.registrasi_id = registrasi_detail.registrasi_id
            and registrasi_detail.status_batal is null
        inner join bagian on
            registrasi_detail.bagian_id = bagian.bagian_id
            and bagian.referensi_bagian in (1, 313)
        inner join pasien on
            registrasi.pasien_id = pasien.pasien_id
        inner join resources resources_patient on
            pasien.pasien_id = resources_patient.key_simrs
            and resources_patient.resources_type = 'Patient'
            and resources_patient.key_satu_sehat <> '0'
        inner join emr on
            registrasi.registrasi_id = emr.registrasi_id
            and emr.status_batal is null
            and emr.form_id = 3
        inner join emr_detail on
            emr.emr_id = emr_detail.emr_id
            and emr_detail.variabel = 'primary'
            and emr_detail.objek_id in (42)
            and emr_detail.status_batal is null
        inner join transaction_satu_sehat tss_encounter on
            registrasi.registrasi_id = tss_encounter.key_simrs
            and tss_encounter.transaction_type = 'Encounter'
        inner join icd on
            emr_detail.value::int = icd.icd_id
        left outer join transaction_satu_sehat tss_condition on
            emr_detail.emr_detail_id = tss_condition.key_simrs
            and tss_condition.transaction_type = 'Condition' 
        where 
            registrasi.status_batal is null
            and tss_encounter.key_satu_sehat is not null
            ${queryEmrDetail}
            ${queryDate}
            ${queryWhereTransaction}
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdConditionRepo = async (
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

const updateUpdateIdConditionRepo = async (
    emr_detail_id: bigint,
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
        key_simrs: emr_detail_id,
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
    getDataCondition,
    updateInsertIdConditionRepo,
    updateUpdateIdConditionRepo,
};
