import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

const input_time_now: string = dateNow();

const getJobEncounter = async () => {
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
                                registrasi_urut.tgl_urut
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
                            inner join emr on
                                registrasi.registrasi_id = emr.registrasi_id
                                and emr.status_batal is null
                                and emr.form_id = 3
                            where 
                                registrasi.status_batal is null
                                and registrasi.tgl_masuk::date = now()::date
                                and registrasi.pasien_id = 375745
                            limit 1  
                        `;
    const getEncounterData = await prismaDb3.$queryRawUnsafe(getEncounter);

    return getEncounterData;
};

const insertJob = async () => {};

export { getJobEncounter, insertJob };
