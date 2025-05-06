import { prismaDb1, prismaDb2, prismaDb3 } from "./../../db";
import { generateMaxDb1 } from "./../../db/database.handler";
import { dateNow } from "./../../middlewares/time";

const listReadyHitTaskBpjs = async (limit: number, task_id: number, backdate = false) => {
    let filter, selectTaskTime, kondisiTask;
    let valueBackDate = "";
    if (backdate === true) {
        valueBackDate = ` = now()::date - interval '1 day'`
    } else {
        valueBackDate = ` = now()::date`;
    }

    if (new Date().getHours() < 19) {
        if (task_id === 1) {
            filter = `and last_task = '0' and (assess = '3' or soap = '6')`;
            selectTaskTime = `,(case 
                                when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                    case
                                        when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                    else rujukan_sep.input_time
                                end
                                else 
                                    case
                                        when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.mod_time
                                    end
                            end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 2) {
            filter = `and last_task = '1' and (assess = '3' or soap = '6')`;
            selectTaskTime = `,(case 
                                when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                    case
                                        when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                    else rujukan_sep.input_time
                                end
                                else 
                                    case
                                        when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.mod_time
                                    end
                            end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 3) {
            filter = `and last_task = '2' and (assess = '3' or soap = '6')`;
            selectTaskTime = `,(case 
                                when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                    case
                                        when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                    else rujukan_sep.input_time
                                end
                                else 
                                    case
                                        when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.mod_time
                                    end
                            end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 4) {
            filter = `and last_task = '3' and (assess = '3' or soap = '6')`;
            selectTaskTime = `,(emr.input_time) task_time`;
            kondisiTask = ` inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 5) {
            filter = `and last_task = '4' and soap = '6' `;
            selectTaskTime = `,(emr.input_time) task_time`;
            kondisiTask = ` inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 3 
                                and emr.status_batal is null`;
        }
        if (task_id === 6) {
            filter = `and last_task = '5' and status_obat is not null `;
            selectTaskTime = `,(peresepan_obat.start_tracking) task_time`;
            kondisiTask = `  inner join peresepan_obat on 
                                data_task.registrasi_detail_id = peresepan_obat.registrasi_detail_id 
                                and peresepan_obat.status_batal is null`;
        }
        if (task_id === 7) {
            filter = `and last_task = '6' and status_obat in ('2','3') `;
            selectTaskTime = `,(peresepan_obat.end_tracking) task_time`;
            kondisiTask = `  inner join peresepan_obat on 
                                data_task.registrasi_detail_id = peresepan_obat.registrasi_detail_id 
                                and peresepan_obat.status_batal is null`;
        }
    } else {
        if (task_id === 1) {
            filter = `and last_task = '0'`;
            selectTaskTime = `,(case 
                                    when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                        case
                                            when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.input_time
                                    end
                                    else 
                                        case
                                            when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                            else rujukan_sep.mod_time
                                        end
                                end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 2) {
            filter = `and last_task = '1'`;
            selectTaskTime = `,(case 
                                    when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                        case
                                            when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.input_time
                                    end
                                    else 
                                        case
                                            when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                            else rujukan_sep.mod_time
                                        end
                                end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 3) {
            filter = `and last_task = '2'`;
            selectTaskTime = `,(case 
                                    when rujukan_sep.input_time::date = data_task.tgl_masuk then 
                                        case
                                            when rujukan_sep.input_time > emr.input_time then emr.input_time - interval '10 minutes'
                                        else rujukan_sep.input_time
                                    end
                                    else 
                                        case
                                            when rujukan_sep.mod_time > emr.input_time then emr.input_time - interval '10 minutes'
                                            else rujukan_sep.mod_time
                                        end
                                end) task_time`;
            kondisiTask = ` inner join rujukan_sep on 
                                data_task.registrasi_id = rujukan_sep.registrasi_id 
                            inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 4) {
            filter = `and last_task = '3'`;
            selectTaskTime = `,(emr.input_time) task_time`;
            kondisiTask = ` inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 6 
                                and emr.status_batal is null`;
        }
        if (task_id === 5) {
            filter = `and last_task = '4'`;
            selectTaskTime = `,(emr.input_time) task_time`;
            kondisiTask = ` inner join emr on 
                                data_task.registrasi_id = emr.registrasi_id 
                                and emr.form_id = 3 
                                and emr.status_batal is null`;
        }
        if (task_id === 6) {
            filter = `and last_task = '5'`;
            selectTaskTime = `,(peresepan_obat.start_tracking) task_time`;
            kondisiTask = `  inner join peresepan_obat on data_task.registrasi_detail_id = peresepan_obat.registrasi_detail_id and peresepan_obat.status_batal is null`;
        }
        if (task_id === 7) {
            filter = `and last_task = '6'`;
            selectTaskTime = `,(peresepan_obat.end_tracking) task_time`;
            kondisiTask = `  inner join peresepan_obat on 
                                data_task.registrasi_detail_id = peresepan_obat.registrasi_detail_id 
                                and peresepan_obat.status_batal is null`;
        }
    }

    const today = new Date();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const formattedToday = today.toISOString().slice(0, 10);
    const formattedOneMonthAgo = oneMonthAgo.toISOString().slice(0, 10);

    const startDate = formattedOneMonthAgo;
    const endDate = formattedToday;

    const queryTask = `WITH data_task as (
        select
            registrasi.registrasi_id,
            pasien.no_mr,
            pasien.nama_pasien,
            bagian.nama_bagian,
            registrasi_detail.registrasi_detail_id,
            max(task_bpjs_log.task_id) last_task,
            max(emr1.form_id) assess,
            max(emr.form_id) soap ,
            max(peresepan_obat.status_selesai) status_obat,
            registrasi.tgl_masuk::date
        from
            registrasi
        inner join pasien on
            registrasi.pasien_id = pasien.pasien_id
        inner join registrasi_detail on
            registrasi.registrasi_id = registrasi_detail.registrasi_id
            and registrasi_detail.status_batal is null
        inner join registrasi_urut on
            registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
            and registrasi_urut.status_batal is null
        inner join bagian on
            registrasi_urut.bagian_id = bagian.bagian_id
            and bagian.referensi_bagian in (1)
            and bagian.bagian_id not in (23,46,221) 
        left join task_bpjs_log on
            registrasi.registrasi_id = task_bpjs_log.registrasi_id
            and task_bpjs_log.status_batal is null
        left join emr emr1 on
            registrasi_detail.registrasi_detail_id = emr1.registrasi_detail_id
            and emr1.status_batal is null
            and emr1.form_id in ('3')
        left join emr on
            registrasi_detail.registrasi_detail_id = emr.registrasi_detail_id
            and emr.status_batal is null
            and emr.form_id in ('6')
        left join peresepan_obat on
            registrasi_detail.registrasi_detail_id = peresepan_obat.registrasi_detail_id
            and peresepan_obat.status_batal is null
        left join rujukan_sep on
            registrasi.registrasi_id = rujukan_Sep.registrasi_id
        where
            1 = 1
            and registrasi.tgl_masuk::date ${valueBackDate}
            and response is not null
            and (
                (response->>'metadata')::json->>'code' = '200'
                or (response->>'metadata')::json->>'message' ilike '%Terdapat duplikasi%'
                )
            and rujukan_sep.sep is not null
        group by
            registrasi.registrasi_id,
            pasien.no_mr,
            pasien.nama_pasien,
            bagian.nama_bagian,
            registrasi_detail.registrasi_detail_id)
        select
            data_log.*
        from
            (select
                data_task.*
                ${selectTaskTime}
            from
                data_task
                ${kondisiTask}
            where
                1 = 1
                ${filter}
            ) as data_log
        where 
            data_log.task_time is not null
        order by random()
        limit ${limit};`;

    const readyHitTaskNow = await prismaDb3.$queryRawUnsafe(queryTask);

    return readyHitTaskNow;
};

const listReadyHitTaskBpjsFisio = async (limit: number, task_id: number) => {
    let filter = "";

    if (task_id === 1) {
        filter = "and last_task = '0'";
    } else if (task_id === 2) {
        filter = "and last_task = '1'";
    } else if (task_id === 3) {
        filter = "and last_task = '2'";
    } else if (task_id === 4) {
        filter = "and last_task = '3'";
    } else if (task_id === 5) {
        filter = "and last_task = '4'";
    } else if (task_id === 6) {
        filter = "and last_task = '5'";
    } else if (task_id === 7) {
        filter = "and last_task = '6'";
    }

    const queryTask = `with data_task as (
        select
            registrasi.registrasi_id,
            registrasi.tgl_masuk::date,
            pasien.no_mr,
            pasien.nama_pasien,
            rujukan_sep.sep,
            bagian.nama_bagian,
            max(task_bpjs_log.task_id) last_task,
            max(emr1.form_id) assess,
            max(emr.form_id) soap ,
            max(peresepan_obat.status_selesai) status_obat
        from
            registrasi
        inner join pasien on
            registrasi.pasien_id = pasien.pasien_id
        inner join registrasi_detail on
            registrasi.registrasi_id = registrasi_detail.registrasi_id
            and registrasi_detail.status_batal is null
        inner join registrasi_urut on
            registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
            and registrasi_urut.status_batal is null
        inner join bagian on
            registrasi_urut.bagian_id = bagian.bagian_id
            and bagian.referensi_bagian in (202)
        left join rujukan_sep on
            registrasi.registrasi_id = rujukan_Sep.registrasi_id
        left join task_bpjs_log on
            registrasi.registrasi_id = task_bpjs_log.registrasi_id
            and task_bpjs_log.status_batal is null
        left join emr emr1 on
            registrasi_detail.registrasi_detail_id = emr1.registrasi_detail_id
            and emr1.status_batal is null
            and emr1.form_id in ('3')
        left join emr on
            registrasi_detail.registrasi_detail_id = emr.registrasi_detail_id
            and emr.status_batal is null
            and emr.form_id in ('6')
        left join peresepan_obat on
            registrasi_detail.registrasi_detail_id = peresepan_obat.registrasi_detail_id
            and peresepan_obat.status_batal is null
        where
            1 = 1
            and (registrasi.tgl_masuk::date = now()::date )
            and response is not null
        group by
            registrasi.registrasi_id,
            pasien.no_mr,
            pasien.nama_pasien,
            rujukan_sep.sep,
            bagian.nama_bagian)
        select
            *
        from
            data_task
        where
            1 = 1
            and sep is not null
            ${filter}
            and nama_bagian not in ('KLINIK ITER', 'LABORATORIUM   ', 'ONE DAY CARE (UMUM)')
        order by
            random()
        limit ${limit};`;

    const readyHitTaskNow = await prismaDb3.$queryRawUnsafe(queryTask);
        
    return readyHitTaskNow;
};

const getPasienFisioReadyHitNow = async (limit: number) => {
    const readyHitFisio = await prismaDb3.$queryRaw`
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
    left join task_bpjs_log on
        registrasi.registrasi_id = task_bpjs_log.registrasi_id
        and task_bpjs_log.task_id = '0'
    where 
        registrasi.status_batal is null
        and registrasi.tgl_masuk::date = now()::date
        and rujukan_sep.sep is not null
        and task_bpjs_log.response is null
    limit ${limit};`;

    return readyHitFisio;
};

const getPasienHitUlangAddAntrol = async (limit: number) => {
    const rawQuery = await prismaDb3.$queryRaw`
    select
        task_bpjs_log.task_id,
        rujukan_sep.sep,
        pasien.pasien_id,
        registrasi.registrasi_id,
        task_bpjs_log.response,
        task_bpjs_log.mod_time,
        pasien.no_hp
    from
        task_bpjs_log
    inner join rujukan_sep on
        task_bpjs_log.registrasi_id = rujukan_sep.registrasi_id
        and rujukan_sep.sep is not null
    inner join registrasi on
        task_bpjs_log.registrasi_id = registrasi.registrasi_id 
    inner join pasien on
        registrasi.pasien_id = pasien.pasien_id
    inner join emr on
        registrasi.registrasi_id = emr.registrasi_id 
        and emr.form_id = 6
    where
        registrasi.tgl_masuk::date = now()::date
        and (task_bpjs_log.response->'metadata'->>'message' = 'data nohp  belum sesuai.' 
        or task_bpjs_log.response->'metadata'->>'message' like '%masa berlaku habis%'
        or task_bpjs_log.response->'metadata'->>'message' = 'Undefined Error.'
        or task_bpjs_log.response->'metadata'->>'message' = 'Rujukan tidak valid')
        and task_id = '0'
    limit ${limit};`;

    return rawQuery;
};

const getKodeBagian = async (registrasi_id: number) => {
    const rawQuery = await prismaDb3.$queryRaw`
    SELECT
        mapping_poli_bpjs.kode_poli_bpjs
    FROM
        registrasi_detail
    INNER JOIN bagian ON
        registrasi_detail.bagian_id = bagian.bagian_id
    INNER JOIN mapping_poli_bpjs ON 
        mapping_poli_bpjs.bagian_id = bagian.bagian_id
    WHERE 
        registrasi_detail.registrasi_id = ${registrasi_id};`;

    return rawQuery;
};

export {
    getPasienFisioReadyHitNow,
    listReadyHitTaskBpjs,
    listReadyHitTaskBpjsFisio,
    getPasienHitUlangAddAntrol,
    getKodeBagian,
};
