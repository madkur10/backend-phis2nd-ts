import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "../../../../db/database.handler";
import { dateNow } from "../../../../middlewares/time";

const getDataCompositionDiit = async (
    limit: string,
    emr_detail_id: string = "",
) => {
    let queryCompositionDiit;
    let queryDate;
    let queryWhereTransaction;
    if (emr_detail_id) {
        queryDate = "";
        queryCompositionDiit = `AND emr_detail.emr_detail_id = ${parseInt(
            emr_detail_id,
            10,
        )}`;
        queryWhereTransaction =
            "AND (tss_diit.transaction_satu_sehat_id is null or tss_diit.key_satu_sehat = '0')";
    } else {
        queryDate = `AND registrasi.tgl_masuk >= (now()::date - interval '3 days') AND registrasi.tgl_masuk < now()::date + interval '1 day'`;
        queryCompositionDiit = "";
        queryWhereTransaction = `AND tss_diit.transaction_satu_sehat_id is null`;
    }

    const getDataPasien = `select
            registrasi.registrasi_id,
            registrasi.tgl_masuk,
            pasien.nama_pasien,
            tss_encounter.key_satu_sehat encounter_id,
            r_patient.key_satu_sehat patient_id,
            r_location.key_satu_sehat location_id,
            bagian.nama_bagian,
            r_practitioner.key_satu_sehat practitioner_id,
            pegawai.nama_pegawai,
            emr_detail.value,
            emr_detail.emr_detail_id,
            tss_diit.transaction_satu_sehat_id tss_id_comp_diit
        from 
            registrasi
        inner join registrasi_detail on
            registrasi.registrasi_id = registrasi_detail.registrasi_id
            and registrasi_detail.status_batal is null
        inner join registrasi_urut on
            registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
        inner join pegawai on
            registrasi_urut.pegawai_id = pegawai.pegawai_id
        inner join pasien on
            registrasi.pasien_id = pasien.pasien_id
        inner join bagian on
            registrasi_detail.bagian_id = bagian.bagian_id
            and bagian.bagian_id in (61, 40)
        inner join transaction_satu_sehat tss_encounter on
            registrasi.registrasi_id = tss_encounter.key_simrs
            and tss_encounter.key_satu_sehat <> '0'
            and tss_encounter.transaction_type = 'Encounter'
        inner join resources r_patient on
            pasien.pasien_id = r_patient.key_simrs
            and r_patient.resources_type = 'Patient'
        inner join resources r_location on 
            bagian.bagian_id = r_location.key_simrs
            and r_location.resources_type = 'Location'
        inner join resources r_practitioner on
            registrasi_urut.pegawai_id = r_practitioner.key_simrs
            and r_practitioner.resources_type = 'Practitioner'
        inner join emr on
            registrasi.registrasi_id = emr.registrasi_id
            and emr.form_id = 3
        inner join emr_detail on
            emr.emr_id = emr_detail.emr_id
            and emr_detail.objek_id = 4
        left join transaction_satu_sehat tss_diit on
            emr_detail.emr_detail_id = tss_diit.key_simrs 
            and tss_diit.transaction_type = 'CompositionDiit'
        where
            registrasi.status_batal is null
            ${queryWhereTransaction}
            ${queryCompositionDiit}
            ${queryDate}
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdCompositionRepo = async (
    emr_detail_id: bigint,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null,
) => {
    const transaction_satu_sehatId = await generateMaxDb1(
        "max_transaction_satu_sehat_idx",
        "transaction_satu_sehat_id",
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

const updateUpdateIdCompositionRepo = async (
    emr_detail_id: bigint,
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
                10,
            ),
        },
        data,
    });
};

export {
    getDataCompositionDiit,
    updateInsertIdCompositionRepo,
    updateUpdateIdCompositionRepo,
};
