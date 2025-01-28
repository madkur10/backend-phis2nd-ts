import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataCondition = async (limit: string) => {
    const getDataPasien = await prismaDb1.$queryRaw`
        select
            registrasi.registrasi_id Registration_ID,
            registrasi.tgl_masuk,
            pasien.nama_pasien Patient_Name,
            resources_patient.key_satu_sehat Patient_ID,
            bagian.nama_bagian,
            transaction_satu_sehat.key_satu_sehat Encounter_ID,
            emr_detail.emr_detail_id,
            emr_detail.objek_id,
            emr_detail.input_time input_time_emr,
            emr_detail.value,
            icd.kode_diagnosa,
            icd.nama_diagnosa
        from
            registrasi
        inner join registrasi_detail on
            registrasi.registrasi_id = registrasi_detail.registrasi_id
            and registrasi_detail.status_batal is null
        inner join bagian on
            registrasi_detail.bagian_id = bagian.bagian_id
            and bagian.referensi_bagian = 1
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
            and emr_detail.objek_id in (42)
            and emr_detail.status_batal is null
            and emr_detail.value ~ '^\d+$'
        inner join transaction_satu_sehat on
            registrasi.registrasi_id = transaction_satu_sehat.key_simrs
        inner join icd on
            emr_detail.value::int = icd.icd_id
        left outer join transaction_satu_sehat transaction_satu_sehat_condition on
            emr_detail.emr_detail_id = transaction_satu_sehat_condition.key_simrs 
        where 
            registrasi.status_batal is null
            and registrasi.tgl_masuk::date = now()::date
            and transaction_satu_sehat.key_satu_sehat is not null
            and transaction_satu_sehat_condition.transaction_satu_sehat_id is null
        limit ${parseInt(limit, 10)};
    `;
    return getDataPasien;
};

const updateInsertIdConditionRepo = async (
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

export { getDataCondition, updateInsertIdConditionRepo };
