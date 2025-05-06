import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../../db/database.handler";
import { dateNow } from "./../../../../middlewares/time";

const getDataMedicationCreate = async (limit: string) => {
    const getDataMedication = await prismaDb1.$queryRaw`
        select
            registrasi.registrasi_id Registration_ID,
            registrasi.tgl_masuk,
            pasien.nama_pasien Patient_Name,
            resources_patient.key_satu_sehat Patient_ID,
            bagian.nama_bagian,
            transaction_encounter.key_satu_sehat Encounter_ID,
            peresepan_obat.peresepan_obat_id,
            resources_kfa.key_satu_sehat kfa_id,
            peresepan_obat_detail.peresepan_obat_detail_id,
            barang.nama_barang,
            peresepan_obat.peresepan_obat_id
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
        inner join transaction_satu_sehat as transaction_encounter on
            registrasi.registrasi_id = transaction_encounter.key_simrs
            and transaction_encounter.transaction_type = 'Encounter'
        inner join peresepan_obat on
            registrasi_detail.registrasi_detail_id = peresepan_obat.registrasi_detail_id
        inner join peresepan_obat_detail on
            peresepan_obat.peresepan_obat_id = peresepan_obat_detail.peresepan_obat_id
        inner join barang on
            peresepan_obat_detail.barang_id = barang.barang_id
        inner join resources resources_kfa on
            peresepan_obat_detail.barang_id = resources_kfa.key_simrs
            and resources_kfa.resources_type = 'KFA'
        left outer join transaction_satu_sehat transaction_medication on
            peresepan_obat_detail.peresepan_obat_detail_id = transaction_medication.key_simrs
            and transaction_medication.transaction_type = 'Medication'
        where 
            registrasi.status_batal is null
            and registrasi.tgl_masuk::date = now()::date
            and transaction_encounter.key_satu_sehat is not null
            and transaction_medication.transaction_satu_sehat_id is null
        limit ${parseInt(limit, 10)};
    `;
    return getDataMedication;
};

const getDataMedicationCreateRequestRepo = async (limit: string) => {
    const getDataMedication = await prismaDb1.$queryRaw`
    select
        peresepan_obat_detail.peresepan_obat_detail_id,
        transaction_medication.key_satu_sehat medication_refference,
        transaction_encounter.key_satu_sehat encounter_id,
        pasien.nama_pasien patient_name,
        resources_patient.key_satu_sehat patient_id,
        pegawai.nama_pegawai practitioner_name,
        resources_practitioner.key_satu_sehat practitioner_id,
        transaction_satu_sehat_condition.key_satu_sehat diagnosis_primer,
        icd.nama_diagnosa,
        peresepan_obat_detail.jumlah jumlah_obat,
        peresepan_obat_detail.satuan_aturan_pakai satuan_obat,
        peresepan_obat_detail.input_time authoredOn,
        peresepan_obat.peresepan_obat_id
    from
        peresepan_obat_detail
    inner join transaction_satu_sehat transaction_medication on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_medication.key_simrs
        and transaction_medication.transaction_type = 'Medication'
    inner join peresepan_obat on
        peresepan_obat_detail.peresepan_obat_id = peresepan_obat.peresepan_obat_id
    inner join registrasi_detail on
        peresepan_obat.registrasi_detail_id = registrasi_detail.registrasi_detail_id
    inner join registrasi on
        registrasi_detail.registrasi_id = registrasi.registrasi_id
    inner join transaction_satu_sehat transaction_encounter on
        registrasi.registrasi_id = transaction_encounter.key_simrs
        and transaction_encounter.transaction_type = 'Encounter'
    inner join pasien on
        registrasi.pasien_id = pasien.pasien_id
    inner join resources resources_patient on
        pasien.pasien_id = resources_patient.key_simrs
        and resources_patient.resources_type = 'Patient'
    inner join registrasi_urut on
        registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
    inner join pegawai on
        registrasi_urut.pegawai_id = pegawai.pegawai_id
    inner join resources resources_practitioner on
        pegawai.pegawai_id = resources_practitioner.key_simrs
        and resources_practitioner.resources_type = 'Practitioner'
    inner join emr on
        registrasi.registrasi_id = emr.registrasi_id
        and emr.status_batal is null
        and emr.form_id = 3
    inner join emr_detail on
        emr.emr_id = emr_detail.emr_id
        and emr_detail.variabel = 'primary'
        and emr_detail.objek_id in (42)
        and emr_detail.status_batal is null
    inner join icd on
        emr_detail.value::int = icd.icd_id
    inner join transaction_satu_sehat transaction_satu_sehat_condition on
        emr_detail.emr_detail_id = transaction_satu_sehat_condition.key_simrs
        and transaction_satu_sehat_condition.transaction_type = 'Condition'
    inner join barang on
        peresepan_obat_detail.barang_id = barang.barang_id
    inner join transaction_satu_sehat transaction_satu_sehat_medication on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_satu_sehat_medication.key_simrs
        and transaction_satu_sehat_medication.transaction_type = 'Medication'
    left join transaction_satu_sehat transaction_satu_sehat_medication_request on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_satu_sehat_medication_request.key_simrs
        and transaction_satu_sehat_medication_request.transaction_type = 'MedicationRequest'
    where
        peresepan_obat_detail.status_batal is null
        and registrasi.tgl_masuk::date = now()::date
        and transaction_satu_sehat_medication_request.transaction_satu_sehat_id is null
    limit ${parseInt(limit, 10)};
    `;

    return getDataMedication;
};

const getDataMedicationCreateDispenseRepo = async (limit: string) => {
    const getDataMedication = await prismaDb1.$queryRaw`
    select
        registrasi.registrasi_id Registration_ID,
        registrasi.tgl_masuk,
        pasien.nama_pasien Patient_Name,
        resources_patient.key_satu_sehat Patient_ID,
        bagian.nama_bagian,
        transaction_encounter.key_satu_sehat Encounter_ID,
        peresepan_obat.peresepan_obat_id,
        resources_kfa.key_satu_sehat kfa_id,
        peresepan_obat_dispense.peresepan_obat_dispense_id,
        peresepan_obat_dispense.nomor_batch batch_number,
        peresepan_obat_dispense.tgl_expired expiration_date,
        barang.nama_barang kfa_name,
        peresepan_obat.peresepan_obat_id
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
    inner join transaction_satu_sehat as transaction_encounter on
        registrasi.registrasi_id = transaction_encounter.key_simrs
        and transaction_encounter.transaction_type = 'Encounter'
    inner join peresepan_obat on
        registrasi_detail.registrasi_detail_id = peresepan_obat.registrasi_detail_id
    inner join peresepan_obat_detail on
        peresepan_obat.peresepan_obat_id = peresepan_obat_detail.peresepan_obat_id
    inner join transaction_satu_sehat transaction_medication on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_medication.key_simrs
        and transaction_medication.transaction_type = 'MedicationRequest'
    inner join peresepan_obat_dispense on
        peresepan_obat_detail.peresepan_obat_detail_id = peresepan_obat_dispense.peresepan_obat_detail_id
    inner join barang on
        peresepan_obat_dispense.barang_id = barang.barang_id
    inner join resources resources_kfa on
        peresepan_obat_dispense.barang_id = resources_kfa.key_simrs
        and resources_kfa.resources_type = 'KFA'
    left join transaction_satu_sehat transaction_satu_sehat_medication_create_dispense on
        peresepan_obat_dispense.peresepan_obat_dispense_id = transaction_satu_sehat_medication_create_dispense.key_simrs
        and transaction_satu_sehat_medication_create_dispense.transaction_type = 'MedicationCreateDispense'
    where
        registrasi.status_batal is null
        and registrasi.tgl_masuk::date = now()::date
        and transaction_encounter.key_satu_sehat is not null
        and transaction_satu_sehat_medication_create_dispense.transaction_satu_sehat_id is null
    limit ${parseInt(limit, 10)};
    `;

    return getDataMedication;
};

const getDataMedicationDispenseRepo = async (limit: string) => {
    const getDataMedication = await prismaDb1.$queryRaw`
    select
        peresepan_obat.peresepan_obat_id,
        transaction_medication.key_satu_sehat medication_refference,
        peresepan_obat_dispense.peresepan_obat_dispense_id,
        resources_patient.key_satu_sehat patient_id,
        pasien.nama_pasien patient_name,
        transaction_encounter.key_satu_sehat encounter_id,
        users.nama_pegawai practitioner_name,
        resources_practitioner.key_satu_sehat practitioner_id,
        resources_location.key_satu_sehat location_id,
        bagian.nama_bagian location_name,
        transaction_satu_sehat_medication_request.key_satu_sehat medication_request_id,
        peresepan_obat_dispense.dispense jumlah_obat,
        peresepan_obat_dispense.satuan_aturan_pakai satuan_obat,
        peresepan_obat_dispense.sigma_1,
        case
            when (peresepan_obat_dispense.sigma_1 is not null
            and peresepan_obat_dispense.sigma_2 is not null) then peresepan_obat_dispense.dispense / (peresepan_obat_dispense.sigma_1::int * peresepan_obat_dispense.sigma_2::int)
            else null
        end
        jumlah_supply,
        peresepan_obat.start_tracking,
        peresepan_obat.end_tracking
    from
        peresepan_obat_detail
    inner join transaction_satu_sehat transaction_medication on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_medication.key_simrs
        and transaction_medication.transaction_type = 'Medication'
    inner join peresepan_obat on
        peresepan_obat_detail.peresepan_obat_id = peresepan_obat.peresepan_obat_id
    inner join registrasi_detail on
        peresepan_obat.registrasi_detail_id = registrasi_detail.registrasi_detail_id
    inner join registrasi on
        registrasi_detail.registrasi_id = registrasi.registrasi_id
    inner join transaction_satu_sehat transaction_encounter on
        registrasi.registrasi_id = transaction_encounter.key_simrs
        and transaction_encounter.transaction_type = 'Encounter'
    inner join pasien on
        registrasi.pasien_id = pasien.pasien_id
    inner join resources resources_patient on
        pasien.pasien_id = resources_patient.key_simrs
        and resources_patient.resources_type = 'Patient'
    inner join registrasi_urut on
        registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
    inner join emr on
        registrasi.registrasi_id = emr.registrasi_id
        and emr.status_batal is null
        and emr.form_id = 3
    inner join emr_detail on
        emr.emr_id = emr_detail.emr_id
        and emr_detail.variabel = 'primary'
        and emr_detail.objek_id in (42)
        and emr_detail.status_batal is null
    inner join icd on
        emr_detail.value::int = icd.icd_id
    inner join transaction_satu_sehat transaction_satu_sehat_condition on
        emr_detail.emr_detail_id = transaction_satu_sehat_condition.key_simrs
        and transaction_satu_sehat_condition.transaction_type = 'Condition'
    inner join barang on
        peresepan_obat_detail.barang_id = barang.barang_id
    inner join transaction_satu_sehat transaction_satu_sehat_medication_request on
        peresepan_obat_detail.peresepan_obat_detail_id = transaction_satu_sehat_medication_request.key_simrs
        and transaction_satu_sehat_medication_request.transaction_type = 'MedicationRequest'
        and transaction_satu_sehat_medication_request.key_satu_sehat <> '0'
        and transaction_satu_sehat_medication_request.key_satu_sehat is not null
    inner join peresepan_obat_dispense on
        peresepan_obat_detail.peresepan_obat_detail_id = peresepan_obat_dispense.peresepan_obat_detail_id
        and peresepan_obat_dispense.dispense > 0
    inner join users on
        peresepan_obat_dispense.input_user_id = users.user_id
    inner join resources resources_practitioner on
        users.user_id = resources_practitioner.key_simrs
        and resources_practitioner.resources_type = 'Practitioner'
    inner join transaction_satu_sehat transaction_satu_sehat_medication on
        peresepan_obat_dispense.peresepan_obat_dispense_id = transaction_satu_sehat_medication.key_simrs
        and transaction_satu_sehat_medication.transaction_type = 'MedicationCreateDispense'
        and transaction_satu_sehat_medication.key_satu_sehat is not null
        and transaction_satu_sehat_medication.key_satu_sehat <> '0'
    inner join bagian on
        peresepan_obat_dispense.bagian_id_dispense = bagian.bagian_id
    inner join resources resources_location on
        bagian.bagian_id = resources_location.key_simrs
        and resources_location.resources_type = 'Location'
    left outer join transaction_satu_sehat transaction_satu_sehat_medication_dispense on
        peresepan_obat_dispense.peresepan_obat_dispense_id = transaction_satu_sehat_medication_dispense.key_simrs
        and transaction_satu_sehat_medication_dispense.transaction_type = 'MedicationDispense'
    where
        peresepan_obat_detail.status_batal is null
        and registrasi.tgl_masuk::date = now()::date
        and transaction_satu_sehat_medication_dispense.transaction_satu_sehat_id is null
    limit ${parseInt(limit, 10)};
    `;

    return getDataMedication;
};

const updateInsertIdMedicationCreateRepo = async (
    peresepan_obat_detail_id: bigint,
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
        key_simrs: peresepan_obat_detail_id,
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

export {
    getDataMedicationCreate,
    updateInsertIdMedicationCreateRepo,
    getDataMedicationCreateRequestRepo,
    getDataMedicationCreateDispenseRepo,
    getDataMedicationDispenseRepo,
};
