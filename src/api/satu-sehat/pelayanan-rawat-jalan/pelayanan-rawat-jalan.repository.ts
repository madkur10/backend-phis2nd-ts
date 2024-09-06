import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

const input_time_now: string = dateNow();

const getJobEncounter = async (limit: number) => {
    const getEncounter = `select 
                            registrasi.registrasi_id,
                            bagian.nama_bagian,
                            bagian.bagian_id,
                            pegawai.pegawai_id,
                            pegawai.nama_pegawai,
                            pegawai.nik,
                            pasien.no_mr,
                            pasien.pasien_id,
                            pasien.nama_pasien,
                            pasien.ktp,
                            pasien.jenis_kelamin,
                            pasien.tgl_lahir,
                            registrasi_urut.tgl_urut,
                            pasien.id_satu_sehat as pasien_ihs_id,
                            bagian.id_satu_sehat as location_id,
                            pegawai.id_satu_sehat as practitioner_ihs_id
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
                            and bagian.id_satu_sehat is not null
                        inner join pegawai on
                            registrasi_urut.pegawai_id = pegawai.pegawai_id
                            and pegawai.id_satu_sehat is not null
                        inner join pasien on
                            registrasi.pasien_id = pasien.pasien_id
                            and pasien.id_satu_sehat is not null
                            and pasien.id_satu_sehat <> ''
                        inner join emr on
                            registrasi.registrasi_id = emr.registrasi_id
                            and emr.status_batal is null
                            and emr.form_id = 3
                        where 
                            registrasi.status_batal is null
                            and registrasi.tgl_masuk::date = now()::date 
                            and registrasi.status_satu_sehat is null
                            and registrasi.id_satu_sehat is null
                        limit ${limit}
                        `;
    const getEncounterData = await prismaDb3.$queryRawUnsafe(getEncounter);

    return getEncounterData;
};

const updateStatusRegistrasi = async (data: any) => {
    const updateStatus = await prismaDb1.registrasi.update({
        where: {
            registrasi_id: data.registrasi_id,
        },
        data: {
            status_satu_sehat: data.status_satu_sehat,
            id_satu_sehat: data.id_satu_sehat,
        },
    });

    return updateStatus;
};

const getEncounterSatSet = async (data: any) => {
    const pasienSatSet = await prismaDb2.admission.findFirst({
        where: {
            registrasi_id: data.registrasi_id,
        },
        select: {
            id: true,
            pasien_id: true,
            dr_id: true,
            created_date: true,
        },
    });

    return pasienSatSet;
};

const updateDataEncounterSatSet = async (responseSatSet: any, data: any) => {
    const updateEncounterSatSet = await prismaDb2.admission.update({
        where: {
            id: data.id,
        },
        data: {
            encounter_ihs_id: responseSatSet.id,
            last_updated_date: input_time_now,
        },
    });
};

const insertDataEncounterSatSet = async (responseSatSet: any, data: any) => {
    const encounterId = await generateMaxDb2("admission", "id");
    const insertEncounterSatSet = await prismaDb2.admission.create({
        data: {
            id: encounterId.toString(),
            created_date: input_time_now,
            encounter_ihs_id: responseSatSet.id,
            registrasi_id: data.registrasi_id,
        },
    });
};

export {
    getJobEncounter,
    updateStatusRegistrasi,
    getEncounterSatSet,
    updateDataEncounterSatSet,
    insertDataEncounterSatSet,
};
