import { prismaDb1 } from "./../../../db";
import {
    generateMaxDb1,
    selectFieldDb1,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const confirmWhatsapp = async (registrasi_urut_id: number) => {
    const confirm = await prismaDb1.registrasi_urut.update({
        where: {
            registrasi_urut_id: registrasi_urut_id,
        },
        data: {
            tgl_jam_wa_konfirmasi: dateNow(),
        },
    });

    return confirm;
};

const checkConfirmWhatsapp = async (registrasi_urut_id: number) => {
    const checkConfirm = await prismaDb1.registrasi_urut.findUnique({
        where: {
            registrasi_urut_id: registrasi_urut_id,
        },
        select: {
            tgl_jam_wa_konfirmasi: true,
        },
    });

    return checkConfirm;
};

const checkDataKunjungan = async (data: string) => {
    const checkData = `SELECT
                            pasien.nama_pasien,
                            pegawai.nama_pegawai,
                            bagian.nama_bagian,
                            registrasi.tgl_masuk::date
                        FROM
                            registrasi
                        INNER JOIN registrasi_detail ON
                            registrasi.registrasi_id = registrasi_detail.registrasi_id
                            and registrasi_detail.status_batal is null
                        INNER JOIN registrasi_urut ON
                            registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
                            and registrasi_urut.status_batal is null
                        INNER JOIN bagian ON
                            registrasi_detail.bagian_id = bagian.bagian_id
                        INNER JOIN pasien ON
                            registrasi.pasien_id = pasien.pasien_id
                        LEFT JOIN pegawai ON
                            registrasi_urut.pegawai_id = pegawai.pegawai_id
                        WHERE
                            registrasi_urut.registrasi_urut_id = '${data}'
                            AND registrasi.status_batal is null
                            `;
    const dataKunjungan: any = await prismaDb1.$queryRawUnsafe(checkData);

    return dataKunjungan[0];
};

export { confirmWhatsapp, checkConfirmWhatsapp, checkDataKunjungan };
