import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "../../../../db/database.handler";
import { dateNow } from "../../../../middlewares/time";

const getDataSpecimen = async (
    limit: string,
    order_lab_detail_id: string = "",
) => {
    let queryOrderLabSpecimen;
    let queryDate;
    let queryWhereTransaction;
    if (order_lab_detail_id) {
        queryDate = "";
        queryOrderLabSpecimen = `AND order_lab_detail.order_lab_detail_id = ${parseInt(
            order_lab_detail_id,
            10,
        )}`;
        queryWhereTransaction =
            "AND (tss_specimen.transaction_satu_sehat_id is null or tss_specimen.key_satu_sehat = '0')";
    } else {
        queryDate = `AND order_lab.tgl_order_lab >= (now()::date - interval '3 days') AND order_lab.tgl_order_lab < now()::date + interval '1 day'`;
        queryOrderLabSpecimen = "";
        queryWhereTransaction = `AND tss_specimen.transaction_satu_sehat_id is null`;
    }
    const getDataPasien = `select
        distinct
        r_patient.key_satu_sehat patient_id,
        order_lab_detail.order_lab_detail_id,
        r_practitioner.key_satu_sehat practitioner_id,
        users.nama_pegawai,
        order_lab.tgl_order_lab,
        lab_hasil.tgl_hasil,
        tindakan.nama_tindakan,
        r_specimen.key_satu_sehat kode_specimen,
        r_specimen.response->>'text_specimen' text_specimen,
        tss_servicerequestlab.key_satu_sehat service_request
    from
        order_lab
    inner join order_lab_detail on
        order_lab.order_lab_id = order_lab_detail.order_lab_id
    inner join resources r_patient on
        order_lab.pasien_id = r_patient.key_simrs
        and r_patient.resources_type = 'Patient'
    inner join users on
        order_lab.kirim_user_id = users.user_id
    inner join resources r_practitioner on
        users.pegawai_id = r_practitioner.key_simrs
        and r_practitioner.resources_type = 'Practitioner'
    inner join tindakan on
        order_lab_detail.tindakan_id = tindakan.tindakan_id
    inner join transaction_satu_sehat tss_servicerequestlab on
        order_lab_detail.order_lab_detail_id = tss_servicerequestlab.key_simrs
        and tss_servicerequestlab.transaction_type = 'ServiceRequestLab'
    inner join lab_hasil on
        order_lab.order_lab_id = lab_hasil.order_lab_id
    inner join resources r_specimen on
        tindakan.tindakan_id = r_specimen.key_simrs 
        and r_specimen.resources_type = 'Specimen'
    left join transaction_satu_sehat tss_specimen on
        order_lab_detail.order_lab_detail_id = tss_specimen.key_simrs
        and tss_specimen.transaction_type = 'Specimen'
    where
        order_lab.status_batal is null
        ${queryWhereTransaction}
        ${queryOrderLabSpecimen}
        ${queryDate}
    limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);

    return getDataPasienNew;
};

const updateInsertIdSpecimenRepo = async (
    order_lab_detail_id: bigint,
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
        key_simrs: order_lab_detail_id,
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

const updateUpdateIdSpecimenRepo = async (
    order_lab_detail_id: bigint,
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
        key_simrs: order_lab_detail_id,
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
    getDataSpecimen,
    updateInsertIdSpecimenRepo,
    updateUpdateIdSpecimenRepo,
};
