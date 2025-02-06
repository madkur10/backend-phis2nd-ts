import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataObservation = async (limit: string) => {
    const getDataPasien = await prismaDb1.$queryRaw`
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
            emr_detail.value
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
            and emr.form_id = 6
        inner join emr_detail on
            emr.emr_id = emr_detail.emr_id
            and emr_detail.objek_id in (6, 7, 13, 12, 14)
            and emr_detail.status_batal is null
        inner join transaction_satu_sehat on
            registrasi.registrasi_id = transaction_satu_sehat.key_simrs
            and transaction_satu_sehat.transaction_type = 'Encounter'
        left outer join transaction_satu_sehat transaction_satu_sehat_observation on
	    emr_detail.emr_detail_id = transaction_satu_sehat_observation.key_simrs 
        where 
            registrasi.status_batal is null
            and registrasi.tgl_masuk::date = now()::date
            and transaction_satu_sehat.key_satu_sehat is not null
            and transaction_satu_sehat.key_satu_sehat <> '0'
            and transaction_satu_sehat_observation.transaction_satu_sehat_id is null
        limit ${parseInt(limit, 10)};
    `;
    return getDataPasien;
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

export { getDataObservation, updateInsertIdObservationRepo };
