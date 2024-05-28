import { prisma, prismaRawQuery } from "../../db";
import { generateMax } from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";

const input_time_now: string = dateNow();

const getPasienFisioReadyHitNow = async (limit: number) => {
    const rawQuery = prismaRawQuery.sql`
    SELECT 
        registrasi.registrasi_id,
        registrasi.pasien_id,
        rujukan_sep.sep,
        task_bpjs_log.response,
        task_bpjs_log.task_id
    from
        registrasi
    inner join registrasi_detail on
        registrasi.registrasi_id = registrasi_detail.registrasi_id 
    inner join bagian on
        registrasi_detail.bagian_id = bagian.bagian_id
        and bagian.referensi_bagian = '202'
    inner join rujukan_sep on
        registrasi.registrasi_id = rujukan_sep.registrasi_id
        and rujukan_sep.no_rujukan is not null
        and rujukan_sep.no_rujukan <> ''
    left join task_bpjs_log on
        registrasi.registrasi_id = task_bpjs_log.registrasi_id
        and task_bpjs_log.task_id = '0'
    where 
        registrasi.status_batal is null
        and registrasi.tgl_masuk::date = now()::date
        and rujukan_sep.sep is not null
        and task_bpjs_log.response is null
    limit ${limit};`;
    const readyHitFisio = await prisma.$queryRaw(rawQuery);
    
    return readyHitFisio;
}

export {
    getPasienFisioReadyHitNow
}