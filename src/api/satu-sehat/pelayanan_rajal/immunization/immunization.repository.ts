import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "../../../../db/database.handler";
import { dateNow } from "../../../../middlewares/time";

const getDataImmunization = async (
    limit: string,
    bill_kasir_detail_id: string = "",
) => {
    // let queryOrderLabSpecimen;
    // let queryDate;
    // let queryWhereTransaction;
    // if (bill_kasir_detail_id) {
    //     queryDate = "";
    //     queryOrderLabSpecimen = `AND order_lab_detail.bill_kasir_detail_id = ${parseInt(
    //         bill_kasir_detail_id,
    //         10,
    //     )}`;
    //     queryWhereTransaction =
    //         "AND (tss_specimen.transaction_satu_sehat_id is null or tss_specimen.key_satu_sehat = '0')";
    // } else {
    //     queryDate = `AND order_lab.tgl_order_lab::date BETWEEN (now()::date - interval '30 days') AND now()::date`;
    //     queryOrderLabSpecimen = "";
    //     queryWhereTransaction = `AND tss_specimen.transaction_satu_sehat_id is null`;
    // }

    // ${queryWhereTransaction}
    //     ${queryOrderLabSpecimen}
    //     ${queryDate}
    const getDataPasien = `select
            registrasi.registrasi_id,
            registrasi.tgl_masuk,
            pasien.nama_pasien,
            pasien.pasien_id,
            tss_encounter.key_satu_sehat encounter_id,
            r_patient.key_satu_sehat patient_id,
            r_location.key_satu_sehat location_id,
            bagian.nama_bagian,
            barang.nama_barang,
            bill_detail_bmhp.bill_kasir_detail_id,
            r_kfa.key_satu_sehat kfa_id,
            r_practitioner.key_satu_sehat practitioner_id,
            pegawai.nama_pegawai
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
        inner join bill_kasir on 
            registrasi_detail.registrasi_detail_id = bill_kasir.registrasi_detail_id
            and bill_kasir.status_batal is null
        inner join bill_kasir_detail on
            bill_kasir.bill_kasir_id = bill_kasir_detail.bill_kasir_id
            and bill_kasir_detail.status_batal is null
        left join transaction_satu_sehat tss_encounter on
            registrasi.registrasi_id = tss_encounter.key_simrs
            and tss_encounter.key_satu_sehat <> '0'
            and tss_encounter.transaction_type = 'Encounter'
        left join resources r_patient on
            pasien.pasien_id = r_patient.key_simrs
            and r_patient.resources_type = 'Patient'
        left join resources r_location on 
            bagian.bagian_id = r_location.key_simrs
            and r_location.resources_type = 'Location'
        left join bill_kasir_detail bill_detail_bmhp on
            bill_kasir.bill_kasir_id = bill_detail_bmhp.bill_kasir_id
        left join barang on
            bill_detail_bmhp.tindakan_id = barang.barang_id
        left join resources r_kfa on
            barang.barang_id = r_kfa.key_simrs
            and r_kfa.resources_type = 'KFA'
        left join resources r_practitioner on
            registrasi_urut.pegawai_id = r_practitioner.key_simrs
            and r_practitioner.resources_type = 'Practitioner'
        where
            registrasi.status_batal is null
            and registrasi.registrasi_id =1763733
            and bill_detail_bmhp.tindakan_id in (28396, 82077, 61890, 61889, 75138, 75403, 32357, 61892)
        group by
            registrasi.registrasi_id,
            registrasi.tgl_masuk,
            pasien.nama_pasien,
            tss_encounter.key_satu_sehat,
            r_patient.key_satu_sehat,
            r_location.key_satu_sehat,
            bagian.nama_bagian,
            barang.nama_barang,
            bill_detail_bmhp.bill_kasir_detail_id,
            r_kfa.key_satu_sehat,
            r_practitioner.key_satu_sehat,
            pegawai.nama_pegawai,
            pasien.pasien_id
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdImmunizationRepo = async (
    bill_kasir_detail_id: bigint,
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
        key_simrs: bill_kasir_detail_id,
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

const updateUpdateIdImmunizationRepo = async (
    bill_kasir_detail_id: bigint,
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
        key_simrs: bill_kasir_detail_id,
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
    getDataImmunization,
    updateInsertIdImmunizationRepo,
    updateUpdateIdImmunizationRepo,
};
