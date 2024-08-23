import { prismaDb1 } from "./../../../db";
import {
    generateMaxDb1,
    selectFieldDb1,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const input_time_now: string = dateNow();

const checkDpjpHfis = async (kodeDpjp: string) => {
    const dpjp_hfis = await prismaDb1.dpjp_hfis.findFirst({
        where: {
            dpjp_hfis_kode: kodeDpjp,
        },
        select: {
            user_id: true,
        },
    });

    return dpjp_hfis;
};

const checkPoliHfis = async (kodePoli: string) => {
    const checkpoli_hfis = `SELECT
                                bagian.bagian_id
                            FROM
                                bagian
                            INNER JOIN mapping_poli_bpjs ON
                                bagian.bagian_id = mapping_poli_bpjs.bagian_id
                            WHERE
                                mapping_poli_bpjs.kode_poli_bpjs = '${kodePoli}'
                                AND bagian.flag_eksekutif IS NULL
                            Limit 1
                        `;
    const poli_hfis = await prismaDb1.$queryRawUnsafe(checkpoli_hfis);

    return poli_hfis;
};

const statusAntrean = async (data: any) => {
    let referensi_bagian_id_rajal = 1;
    let kode_poli_bpjs = data.kodepoli;
    let dpjp_hfis_kode = data.kodedokter;
    let tgl_periksa = data.tanggalperiksa;
    let jam_praktek = data.jampraktek;
    let hari = new Date(tgl_periksa).getDay();

    const rawQuery = `SELECT
        bagian.nama_bagian,
        registrasi.registrasi_id,
        users.nama_pegawai,
        users.user_id,
        dpjp_hfis.dpjp_hfis_nama,
        jadwal_dokter.kuota,
        jadwal_dokter.hari,
        registrasi_urut.pegawai_id,
        emr.emr_id,
        registrasi_urut.urutan
    from
        registrasi
    inner join registrasi_detail on
        registrasi.registrasi_id = registrasi_detail.registrasi_id
        and registrasi_detail.status_batal is NULL
    inner join registrasi_urut on
        registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
        and registrasi_urut.status_batal is NULL
    inner join bagian on
        registrasi_detail.bagian_id = bagian.bagian_id
        and bagian.referensi_bagian = ${referensi_bagian_id_rajal}
    inner join mapping_poli_bpjs on
        bagian.bagian_id = mapping_poli_bpjs.bagian_id
        and mapping_poli_bpjs.kode_poli_bpjs = '${kode_poli_bpjs}'
        and mapping_poli_bpjs.status_batal is NULL
    inner join penanggung_rawat on
        registrasi.registrasi_id = penanggung_rawat.registrasi_id
    inner join users on
        penanggung_rawat.rawat_user_id = users.user_id
    inner join dpjp_hfis on
        users.user_id = dpjp_hfis.user_id
        and dpjp_hfis.dpjp_hfis_kode = '${dpjp_hfis_kode.toString()}'
        and dpjp_hfis.status_batal is NULL
    inner join jadwal_dokter on
        bagian.bagian_id = jadwal_dokter.bagian_id
        and registrasi_urut.pegawai_id = jadwal_dokter.pegawai_id
        and jadwal_dokter.hari = ${hari}
    left outer join emr on
        registrasi.registrasi_id = emr.registrasi_id
        and emr.form_id = 3
    where
        registrasi.status_batal is null
        and registrasi.tgl_masuk::date = '${tgl_periksa}'`;
    const status_antrean = await prismaDb1.$queryRawUnsafe(rawQuery);

    return status_antrean;
};

const checkRegistrasiTerdaftar = async (pasien_id: any) => {
    const checkRegistrasiPasien = `SELECT
        registrasi.registrasi_id,
        pegawai.nama_pegawai,
        registrasi.tgl_masuk::date,
        bagian.nama_bagian,
        bagian.bagian_id,
        mapping_poli_bpjs.kode_poli_bpjs
    from
        registrasi
    inner join registrasi_detail on
        registrasi.registrasi_id = registrasi_detail.registrasi_id
        and registrasi_detail.status_batal is NULL
    inner join penanggung_rawat on
        penanggung_rawat.registrasi_id = registrasi.registrasi_id
        and penanggung_rawat.status_batal is NULL
    inner join pasien_nasabah on
        pasien_nasabah.pasien_nasabah_id = registrasi.pasien_nasabah_id
        and pasien_nasabah.status_batal is NULL
    inner join registrasi_urut on
        registrasi_detail.registrasi_detail_id = registrasi_urut.registrasi_detail_id
        and registrasi_urut.status_batal is NULL
    inner join pegawai on
        registrasi_urut.pegawai_id = pegawai.pegawai_id
    inner join bagian on
        registrasi_detail.bagian_id = bagian.bagian_id 
    inner join mapping_poli_bpjs on
        bagian.bagian_id = mapping_poli_bpjs.bagian_id
        and mapping_poli_bpjs.status_batal is NULL
    where
        registrasi.pasien_id = ${pasien_id}
        and registrasi.tgl_masuk::DATE > now()::date
        and pasien_nasabah.nasabah_id = '543'
        and registrasi.status_batal is null
    order by tgl_masuk::date ASC`;
    const checkRegistrasi = await prismaDb1.$queryRawUnsafe(checkRegistrasiPasien);

    return checkRegistrasi;
};

const checkRegistrasiTerdaftarToday = async (data: any) => {
    const checkRegistrasiPasien = `SELECT
        registrasi.registrasi_id
    from
        registrasi
    inner join registrasi_detail on
        registrasi.registrasi_id = registrasi_detail.registrasi_id
        and registrasi_detail.status_batal is NULL
    inner join pasien_nasabah on
        pasien_nasabah.pasien_nasabah_id = registrasi.pasien_nasabah_id
        and pasien_nasabah.status_batal is NULL
    inner join bagian on
        registrasi_detail.bagian_id = bagian.bagian_id
        and bagian.flag_eksekutif is null
    inner join mapping_poli_bpjs on
        bagian.bagian_id = mapping_poli_bpjs.bagian_id
        and mapping_poli_bpjs.status_batal is NULL
    where
        registrasi.pasien_id = ${data.pasien_id}
        and mapping_poli_bpjs.kode_poli_bpjs = '${data.kode_poli_bpjs}'
        and registrasi.tgl_masuk::DATE = now()::date
        and pasien_nasabah.nasabah_id = '543'
        and registrasi.status_batal is null
    order by tgl_masuk::date ASC 
    Limit 1`;
    const checkRegistrasi = await prismaDb1.$queryRawUnsafe(checkRegistrasiPasien);

    return checkRegistrasi;
};

const checkEmrTerdaftar = async (data: any) => {
    const checkEmrPasien = `SELECT
        registrasi.registrasi_id
    from
        registrasi
    inner join registrasi_detail on
        registrasi.registrasi_id = registrasi_detail.registrasi_id
        and registrasi_detail.status_batal is NULL
    inner join bagian on
        registrasi_detail.bagian_id = bagian.bagian_id
        and bagian.flag_eksekutif is null
    inner join mapping_poli_bpjs on
        bagian.bagian_id = mapping_poli_bpjs.bagian_id
        and mapping_poli_bpjs.status_batal is NULL
    inner join pasien_nasabah on
        pasien_nasabah.pasien_nasabah_id = registrasi.pasien_nasabah_id
        and pasien_nasabah.status_batal is NULL
    inner join emr on
        registrasi.registrasi_id = emr.registrasi_id
        and emr.status_batal is NULL
    where
        registrasi.pasien_id = ${data.norm}
        and mapping_poli_bpjs.kode_poli_bpjs = '${data.kodepoli}'
        and registrasi.tgl_masuk::DATE = now()::date
        and pasien_nasabah.nasabah_id = '543'
        and registrasi.status_batal is null
        and emr.form_id = '3'
    order by tgl_masuk::date ASC 
    Limit 1`;
    const checkRegistrasi = await prismaDb1.$queryRawUnsafe(checkEmrPasien);

    return checkRegistrasi;
};

const checkRujukanService = async (noRujukan: any) => {
    const rujukan_pasien = await prismaDb1.rujukan_pasien.findFirst({
        where: {
            no_rujukan: noRujukan,
        },
        select: {
            rujukan_pasien_id: true,
        },
    });

    return rujukan_pasien;
};

const insertRujukanService = async (data: any, inputUserId: any) => {
    const rujukanPasienId = await generateMaxDb1(
        "max_rujukan_sep_idx",
        "rujukan_pasien_id"
    );
    const insertRujukan = await prismaDb1.rujukan_pasien.create({
        data: {
            rujukan_pasien_id: rujukanPasienId,
            input_time: input_time_now,
            input_user_id: inputUserId,
            pasien_id: parseInt(data.response.rujukan.peserta.mr.noMR, 10),
            no_peserta: data.response.rujukan.peserta.noKartu,
            no_rujukan: data.response.rujukan.noKunjungan,
            tgl_rujukan: new Date(data.response.rujukan.tglKunjungan),
            kode_provider: data.response.rujukan.provPerujuk.kode,
            nama_provider: data.response.rujukan.provPerujuk.nama,
            kode_diagnosa: data.response.rujukan.diagnosa.kode,
            nama_diagnosa: data.response.rujukan.diagnosa.nama,
            faskes: data.response.asalFaskes,
            jenis_peserta:
                data.response.rujukan.peserta.jenisPeserta.keterangan,
            prolanis_prb: data.response.rujukan.peserta.informasi.prolanisPRB,
            json_data: data,
            kode_poli_bpjs: data.response.rujukan.poliRujukan.kode,
        },
    });
};

const insertSKDPService = async (data: any, inputUserId: any) => {};

const checkDataNasabahBPJS = async (norm: any) => {
    const noMr = norm.toString().padStart(8, "0")
    const checkDataBPJS = `SELECT
                                pasien_nasabah.pasien_nasabah_id,
                                pasien.pasien_id
                            FROM
                                pasien
                            LEFT JOIN pasien_nasabah ON
                                pasien.pasien_id = pasien_nasabah.pasien_id
                                AND pasien_nasabah.nasabah_id = '543'
                                AND pasien_nasabah.status_batal is null
                            WHERE
                                pasien.no_mr = '${noMr}'
                            Limit 1
                                `;
    const checkData = await prismaDb1.$queryRawUnsafe(checkDataBPJS);

    return checkData;
};

const insertDataNasabahBPJS = async (data: any) => {
    const insertDataNasabah = await prismaDb1.pasien_nasabah.create({
        data: {
            pasien_nasabah_id: await generateMaxDb1(
                "max_pasien_nasabah_idx",
                "pasien_nasabah_id"
            ),
            input_time: input_time_now,
            input_user_id: data.input_user_id,
            pasien_id: data.pasien_id,
            nasabah_id: data.nasabah_id,
            no_peserta: data.no_peserta,
        },
    });

    return insertDataNasabah;
};

const checkDokterReadyService = async (data: any) => {
    const hari = new Date(data.tanggalperiksa).getDay();
    const checkDataDokterReady = `select
                                pegawai.nama_pegawai,
                                pegawai.pegawai_id,
                                dpjp_hfis.dpjp_hfis_kode,
                                cuti_dokter.keterangan,
                                cuti_dokter.tanggal_awal::date tgl_awal_cuti,
                                cuti_dokter.tanggal_akhir::date tgl_akhir_cuti,
                                jadwal_dokter.kuota,
                                jadwal_dokter.waktu_mulai,
                                jadwal_dokter.waktu_selesai,
                                users.user_id,
                                bagian.nama_bagian,
                                (
                                select
                                    count(registrasi_urut.registrasi_urut_id) as jumlah_terdaftar
                                from
                                    registrasi_urut
                                where
                                    registrasi_urut.bagian_id = ${data.bagian_id}
                                    and registrasi_urut.pegawai_id = pegawai.pegawai_id
                                    and registrasi_urut.status_batal is null
                                    and tgl_urut::DATE = '${data.tanggalperiksa}'
                                ) jumlah_terdaftar
                            from
                                jadwal_dokter
                            inner join bagian on
                                jadwal_dokter.bagian_id = bagian.bagian_id
                            inner join pegawai on
                                jadwal_dokter.pegawai_id = pegawai.pegawai_id
                            inner join users on
                                pegawai.pegawai_id = users.pegawai_id
                            left outer join dpjp_hfis on
                                users.user_id = dpjp_hfis.user_id
                                and dpjp_hfis.status_batal is null
                            left outer join cuti_dokter on
                                cuti_dokter.cuti_user_id = users.user_id
                                and cuti_dokter.tanggal_awal::date <= '${data.tanggalperiksa}'
                                and cuti_dokter.tanggal_akhir::date >= '${data.tanggalperiksa}'
                            where
                                jadwal_dokter.bagian_id = ${data.bagian_id}
                                and users.user_id = ${data.dokter_id}
                                and jadwal_dokter.status_batal is null
                                and jadwal_dokter.hari = ${hari}
                                and pegawai.status_batal is null
                                `;
    const checkData = await prismaDb1.$queryRawUnsafe(checkDataDokterReady);

    return checkData;
};

const insertPendaftaranService = async (data: any) => {
    const registrasiId = await generateMaxDb1(
        "max_registrasi_idx",
        "registrasi_id"
    );
    const insertRegistrasi = await prismaDb1.registrasi.create({
        data: {
            registrasi_id: registrasiId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            pasien_id: data.pasien_id,
            pasien_nasabah_id: data.pasien_nasabah_id,
            tgl_masuk: new Date(data.data.tanggalperiksa),
            jenis_rawat: "RJ",
            prioritas: "Berjalan Sendiri",
            flag_online: 1,
        },
    });

    const registrasiDetailId = await generateMaxDb1(
        "max_registrasi_detail_idx",
        "registrasi_detail_id"
    );
    const insertRegistrasiDetail = await prismaDb1.registrasi_detail.create({
        data: {
            registrasi_detail_id: registrasiDetailId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_id: registrasiId,
            tgl_daftar: new Date(data.data.tanggalperiksa),
            bagian_id: data.data.bagian_id,
            kelas_id: 23,
            hak_kelas_id: 23,
        },
    });

    const registrasiUrutId = await generateMaxDb1(
        "max_registrasi_urut_idx",
        "registrasi_urut_id"
    );
    const pegawaiId = await selectFieldDb1(
        "users",
        "pegawai_id",
        `where 
            status_batal is null 
            and user_id = ${data.data.dokter_id}`
    );
    let antrian_rj, addminute;

    const rangeAntrianRJ: any = process.env.rangeAntrianRJ;
    const antrianMax = await urutanMaxRajal(
        data.data.bagian_id,
        pegawaiId,
        data.data.tanggalperiksa
    );

    if (!antrianMax || antrianMax === "") {
        antrian_rj = 1;
        addminute = 0;
    } else {
        antrian_rj = antrianMax + 1;
        addminute = antrian_rj * rangeAntrianRJ - rangeAntrianRJ;
    }

    const hari = new Date(data.data.tanggalperiksa).getDay();
    let jam_mulai = await selectFieldDb1(
        "jadwal_dokter",
        "waktu_mulai",
        `where 
            bagian_id = ${data.data.bagian_id} 
            and pegawai_id = ${pegawaiId}
            and hari = ${hari}
            and status_batal is null`
    );
    let jam_selesai = await selectFieldDb1(
        "jadwal_dokter",
        "waktu_selesai",
        `where 
            bagian_id = ${data.data.bagian_id} 
            and pegawai_id = ${pegawaiId}
            and hari = ${hari}
            and status_batal is null`
    );
    jam_mulai = await timeHandler(jam_mulai);
    jam_selesai = await timeHandler(jam_selesai);

    const kontrol = `${data.data.tanggalperiksa} ${jam_mulai}`;
    const bataskontrol = `${data.data.tanggalperiksa} ${jam_selesai}`;

    const minutesToAdd = addminute;
    let time = new Date(kontrol + " UTC");
    time.setMinutes(time.getMinutes() + minutesToAdd);

    let jamkontrol;
    if (new Date(time) >= new Date(bataskontrol + " UTC")) {
        jamkontrol = new Date(
            new Date(bataskontrol + " UTC").getTime() - 3600000
        ); // Mengurangi 1 jam dari batas kontrol
    } else {
        jamkontrol = time;
    }
    const jampelayanan = jamkontrol;

    const insertRegistrasiUrut = await prismaDb1.registrasi_urut.create({
        data: {
            registrasi_urut_id: registrasiUrutId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_detail_id: registrasiDetailId,
            pegawai_id: pegawaiId,
            bagian_id: data.data.bagian_id,
            urutan: antrian_rj,
            tgl_urut: jampelayanan,
        },
    });

    const penanggungRawatId = await generateMaxDb1(
        "max_penanggung_rawat_idx",
        "penanggung_rawat_id"
    );
    const insertPenanggungRawat = await prismaDb1.penanggung_rawat.create({
        data: {
            penanggung_rawat_id: penanggungRawatId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_id: registrasiId,
            rawat_user_id: data.data.dokter_id,
        },
    });

    const diagnosaRawatId = await generateMaxDb1(
        "max_diagnosa_rawat_idx",
        "diagnosa_rawat_id"
    );
    const insertDiagnosaRawat = await prismaDb1.diagnosa_rawat.create({
        data: {
            diagnosa_rawat_id: diagnosaRawatId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_id: registrasiId,
            icd_id: 9985,
            jenis_diagnosa: 1,
        },
    });

    const rujukanSepId = await generateMaxDb1(
        "max_rujukan_sep_idx",
        "rujukan_sep_id"
    );
    const insertRujukanSep = await prismaDb1.rujukan_sep.create({
        data: {
            rujukan_sep_id: rujukanSepId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_id: registrasiId,
            no_rujukan: data.noRujukan,
        },
    });

    const billTempId = await generateMaxDb1("max_bill_temp_idx", "bill_temp_id");
    const insertBillTemp = await prismaDb1.bill_temp.create({
        data: {
            bill_temp_id: billTempId,
            input_time: input_time_now,
            input_user_id: data.data.input_user_id,
            registrasi_detail_id: registrasiDetailId,
            pasien_id: data.pasien_id,
            bagian_id: data.data.bagian_id,
            nasabah_id: 543,
            kelas_ruang_id: 23,
            hak_kelas_ruang_id: 23,
            tgl_bill: new Date(data.data.tanggalperiksa),
        },
    });

    if (data.data.jeniskunjungan === 3) {
        const suratKontrolId = await generateMaxDb1(
            "surat_kontrol",
            "surat_kontrol_id"
        );
        const insertSuratKontrol = await prismaDb1.surat_kontrol.create({
            data: {
                surat_kontrol_id: suratKontrolId,
                input_time: input_time_now,
                input_user_id: data.data.input_user_id,
                no_surat_kontrol: data.data.nomorreferensi,
                registrasi_id_kontrol: registrasiId,
                jenis_kontrol: "KONTROL",
            },
        });
    }

    const namaDPJP = await selectFieldDb1(
        "users",
        "nama_pegawai",
        `where user_id = ${data.data.dokter_id}`
    );

    const namaBagian = await selectFieldDb1(
        "bagian",
        "nama_bagian",
        `where bagian_id = ${data.data.bagian_id}`
    );

    return {
        registrasi_id: registrasiId,
        registrasi_detail_id: registrasiDetailId,
        registrasi_urut_id: registrasiUrutId,
        urutan: antrian_rj,
        jampelayanan: jampelayanan,
        dpjp: namaDPJP,
        bagian: namaBagian,
        estimasidilayani: Math.floor(jampelayanan.getTime()),
    };
};

const sisaDataAntrean = async (data: any) => {
    const registrasiId = parseInt(data.kodebooking, 10);
    const sisaAntrean = `select
                            registrasi_urut.urutan,
                            bagian.nama_bagian,
                            pegawai.nama_pegawai,
                            (
                            select 
                                count(registrasi_urut.*)
                            from
                                registrasi_urut
                            where 
                                registrasi_urut.bagian_id = bagian.bagian_id
                                and registrasi_urut.pegawai_id = pegawai.pegawai_id
                                and registrasi_urut.tgl_urut::date = registrasi.tgl_masuk::date
                                and registrasi_urut.status_panggil is null
                                and registrasi_urut.status_batal is null
                            ) sisaantrean,
                            (
                            select 
                                registrasi_urut.urutan
                            from
                                registrasi_urut
                            where 
                                registrasi_urut.bagian_id = bagian.bagian_id
                                and registrasi_urut.pegawai_id = pegawai.pegawai_id
                                and registrasi_urut.tgl_urut::date = registrasi.tgl_masuk::date
                                and registrasi_urut.status_panggil is not null
                                and registrasi_urut.status_batal is null
                            limit 1
                            ) antreanpanggil
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
                            and bagian.referensi_bagian = '1'
                        inner join pegawai on
                            registrasi_urut.pegawai_id = pegawai.pegawai_id
                        where 
                            registrasi.registrasi_id = ${registrasiId}
                            and registrasi.status_batal is null`;
    const checkData: any = await prismaDb1.$queryRawUnsafe(sisaAntrean);

    return checkData[0];
};

const batalDataAntrean = async (data: any) => {
    const registrasiId = parseInt(data.kodebooking, 10);
    const batalRegistrasi: any = await prismaDb1.registrasi.update({
        where: {
            registrasi_id: registrasiId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    const registrasiDetailId = await selectFieldDb1(
        "registrasi_detail",
        "registrasi_detail_id",
        `where registrasi_id = ${registrasiId} and status_batal is null`
    );
    const batalRegistrasiDetail: any =
        await prismaDb1.registrasi_detail.updateMany({
            where: {
                registrasi_id: registrasiId,
            },
            data: {
                status_batal: 1,
                mod_time: input_time_now,
                mod_user_id: data.input_user_id,
            },
        });

    const batalRegistrasiUrut: any = await prismaDb1.registrasi_urut.updateMany({
        where: {
            registrasi_detail_id: registrasiDetailId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    const batalPenanggungRawat: any = await prismaDb1.penanggung_rawat.updateMany({
        where: {
            registrasi_id: registrasiId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    const batalDiagnosaRawat: any = await prismaDb1.diagnosa_rawat.updateMany({
        where: {
            registrasi_id: registrasiId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    const batalRujukanSep = await prismaDb1.rujukan_sep.updateMany({
        where: {
            registrasi_id: registrasiId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    const batalBillTemp: any = await prismaDb1.bill_temp.updateMany({
        where: {
            registrasi_detail_id: registrasiDetailId,
        },
        data: {
            status_batal: 1,
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
        },
    });

    return true;
};

const checkDataRegistrasi = async (data: any) => {
    const registrasiId = parseInt(data.kodebooking, 10);
    const checkRegistrasi: any = await prismaDb1.registrasi.findFirst({
        where: {
            registrasi_id: registrasiId,
            status_batal: null,
        },
    });

    return checkRegistrasi;
};

const checkInData = async (data: any) => {
    const registrasiId = parseInt(data.kodebooking, 10);
    const registrasiDetailId = await selectFieldDb1(
        "registrasi_detail",
        "registrasi_detail_id",
        `where registrasi_id = ${registrasiId} and status_batal is null`
    );
    const checkIn = await prismaDb1.registrasi_urut.updateMany({
        where: {
            registrasi_detail_id: registrasiDetailId,
        },
        data: {
            mod_time: input_time_now,
            mod_user_id: data.input_user_id,
            status_check_in: 1,
            tgl_check_in: input_time_now,
        },
    });

    return checkIn;
};

const insertPasienBaru = async (data: any) => {
    const pasienId = await generateMaxDb1("max_pasien_idx", "pasien_id");
    const noMr = pasienId.toString().padStart(8, "0");
    let jenisKelamin;
    if (data.jeniskelamin === "L") {
        jenisKelamin = "Laki-Laki";
    } else if (data.jeniskelamin === "P") {
        jenisKelamin = "Perempuan";
    }

    const pasienBaru = await prismaDb1.pasien.create({
        data: {
            pasien_id: pasienId,
            input_time: input_time_now,
            input_user_id: data.input_user_id,
            no_mr: noMr,
            tgl_lahir: new Date(data.tanggallahir + "UTC"),
            no_hp: data.nohp,
            alamat: data.alamat,
            ktp: data.nik,
            nama_pasien: data.nama,
            jenis_kelamin: jenisKelamin,
        },
    });

    return pasienBaru;
};

const listJadwalOperasi = async (data: any) => {
    const listOperasi = `SELECT
                            kodebooking,
                            jenistindakan,
                            namapoli,
                            kodepoli,
                            tanggaloperasi,
                            nopeserta,
                            (
                            case
                                when laporan_operasi is not null then 1
                                else 0
                            end ) as terlaksana
                        from
                            (
                            select
                                pesan_slot_bedah.pesan_slot_bedah_id as kodebooking,
                                pesan_slot_bedah.jenis_tindakan_bedah as jenistindakan,
                                (
                                    case 
                                        when bagian.nama_bagian is not null then bagian.nama_bagian
                                        else bagian_ranap.nama_bagian
                                    end 
                                ) as namapoli,
                                (
                                    case 
                                        when mapping_poli_bpjs.kode_poli_bpjs is not null then mapping_poli_bpjs.kode_poli_bpjs
                                        else mapping_poli_bpjs_ranap.kode_poli_bpjs
                                    end 
                                ) as kodepoli,
                                pesan_slot_bedah.tgl_rencana_operasi as tanggaloperasi,
                                pasien_nasabah.no_peserta as nopeserta,
                                (
                                select
                                    emr.emr_id
                                from
                                    emr
                                where
                                    emr.form_id = 27
                                    and emr.status_batal is null
                                    and emr.registrasi_id = registrasi_detail.registrasi_id
                                limit 1 ) as laporan_operasi
                            from
                                pesan_slot_bedah
                            left outer join registrasi_detail on
                                pesan_slot_bedah.registrasi_detail_id = registrasi_detail.registrasi_detail_id
                            left outer join bagian on
                                registrasi_detail.bagian_asal_id = bagian.bagian_id
                                AND bagian.referensi_bagian = 1 
                            left outer join mapping_poli_bpjs on
                                mapping_poli_bpjs.bagian_id = bagian.bagian_id
                            left outer join registrasi on
                                registrasi.registrasi_id = registrasi_detail.registrasi_id
                            left outer join pasien_nasabah on
                                registrasi.pasien_nasabah_id = pasien_nasabah.pasien_nasabah_id
                                and pasien_nasabah.nasabah_id = '543'
                            left outer join penanggung_rawat on
                                registrasi.registrasi_id = penanggung_rawat.registrasi_id
                            left outer join users on
                                penanggung_rawat.rawat_user_id = users.user_id 
                            left outer join pegawai on 
                                users.pegawai_id = pegawai.pegawai_id
                            left outer join bagian as bagian_ranap on 
                                pegawai.bagian_id = bagian_ranap.bagian_id
                            left outer join mapping_poli_bpjs as mapping_poli_bpjs_ranap on 
                                bagian_ranap.bagian_id = mapping_poli_bpjs_ranap.bagian_id
                            where
                                registrasi.status_batal is null
                                and registrasi_detail.status_batal is null
                                and mapping_poli_bpjs.status_batal is null
                                and pesan_slot_bedah.status_batal is null
                                and cast(pesan_slot_bedah.tgl_rencana_operasi as date) between '${data.tanggalawal}' AND '${data.tanggalakhir}' ) as data_operasi`;
    const listOperasiResult: any = await prismaDb1.$queryRawUnsafe(listOperasi);

    return listOperasiResult;
};

const getTindakanBedah = async (jenistindakan: any) => {
    const tindakanBedah = `SELECT 
                                detail_tindakan_bedah.nama_tindakan_bedah
                            FROM
                                detail_tindakan_bedah
                            WHERE
                                detail_tindakan_bedah.detail_tindakan_bedah_id = ${jenistindakan}`;
    const tindakanBedahResult: any = await prismaDb1.$queryRawUnsafe(
        tindakanBedah
    );

    return tindakanBedahResult[0].nama_tindakan_bedah;
};

const getJadwalOperasi = async (data: any) => {
    const jadwalOperasi = `SELECT
                                kodebooking,
                                jenistindakan,
                                namapoli,
                                kodepoli,
                                tanggaloperasi,
                                nopeserta,
                                (
                                case
                                    when laporan_operasi is not null then 1
                                    else 0
                                end ) as terlaksana
                            from
                                (
                                select
                                    pesan_slot_bedah.pesan_slot_bedah_id as kodebooking,
                                    pesan_slot_bedah.jenis_tindakan_bedah as jenistindakan,
                                    (
                                        case 
                                            when bagian.nama_bagian is not null then bagian.nama_bagian
                                            else bagian_ranap.nama_bagian
                                        end 
                                    ) as namapoli,
                                    (
                                        case 
                                            when mapping_poli_bpjs.kode_poli_bpjs is not null then mapping_poli_bpjs.kode_poli_bpjs
                                            else mapping_poli_bpjs_ranap.kode_poli_bpjs
                                        end 
                                    ) as kodepoli,
                                    pesan_slot_bedah.tgl_rencana_operasi as tanggaloperasi,
                                    pasien_nasabah.no_peserta as nopeserta,
                                    (
                                    select
                                        emr.emr_id
                                    from
                                        emr
                                    where
                                        emr.form_id = 27
                                        and emr.status_batal is null
                                        and emr.registrasi_id = registrasi_detail.registrasi_id
                                    limit 1 ) as laporan_operasi
                                from
                                    pesan_slot_bedah
                                left outer join registrasi_detail on
                                    pesan_slot_bedah.registrasi_detail_id = registrasi_detail.registrasi_detail_id
                                left outer join bagian on
                                    registrasi_detail.bagian_asal_id = bagian.bagian_id
                                    AND bagian.referensi_bagian = 1 
                                left outer join mapping_poli_bpjs on
                                    mapping_poli_bpjs.bagian_id = bagian.bagian_id
                                left outer join registrasi on
                                    registrasi.registrasi_id = registrasi_detail.registrasi_id
                                left outer join pasien_nasabah on
                                    registrasi.pasien_nasabah_id = pasien_nasabah.pasien_nasabah_id
                                    and pasien_nasabah.nasabah_id = '543'
                                left outer join penanggung_rawat on
                                    registrasi.registrasi_id = penanggung_rawat.registrasi_id
                                left outer join users on
                                    penanggung_rawat.rawat_user_id = users.user_id 
                                left outer join pegawai on 
                                    users.pegawai_id = pegawai.pegawai_id
                                left outer join bagian as bagian_ranap on 
                                    pegawai.bagian_id = bagian_ranap.bagian_id
                                left outer join mapping_poli_bpjs as mapping_poli_bpjs_ranap on 
                                    bagian_ranap.bagian_id = mapping_poli_bpjs_ranap.bagian_id
                                where
                                    registrasi.status_batal is null
                                    and registrasi_detail.status_batal is null
                                    and mapping_poli_bpjs.status_batal is null
                                    and pesan_slot_bedah.status_batal is null
                                    and pasien_nasabah.no_peserta = '${data.nopeserta}' ) as data_operasi`;
    const jadwalOperasiResult: any = await prismaDb1.$queryRawUnsafe(
        jadwalOperasi
    );

    return jadwalOperasiResult;
};

const checkPasienId = async (nik: any) => {
    const checkPasienIdData = await prismaDb1.pasien.findFirst({
        where: {
            ktp: nik,
        },
        select: {
            pasien_id: true,
            no_mr: true,
        },
    });

    return checkPasienIdData;
};

const urutanMaxRajal = async (
    bagianId: any,
    pegawaiId: any,
    tglKunjungan: any
) => {
    const urutanRajal = `SELECT 
                            MAX(urutan) as antrian_max
                        FROM 
                            registrasi_urut 
                        WHERE 
                            status_batal IS NULL
                            AND bagian_id = ${bagianId}
                            AND pegawai_id = ${pegawaiId}
                            AND tgl_urut::date = '${tglKunjungan}'`;
    const checkData: any = await prismaDb1.$queryRawUnsafe(urutanRajal);

    if (checkData[0].antrian_max > 0) {
        return checkData[0].antrian_max;
    } else {
        return 0;
    }
};

export {
    checkDpjpHfis,
    checkPoliHfis,
    statusAntrean,
    checkRegistrasiTerdaftar,
    checkRegistrasiTerdaftarToday,
    checkEmrTerdaftar,
    insertRujukanService,
    checkRujukanService,
    insertSKDPService,
    checkDataNasabahBPJS,
    insertDataNasabahBPJS,
    checkDokterReadyService,
    insertPendaftaranService,
    urutanMaxRajal,
    sisaDataAntrean,
    batalDataAntrean,
    checkDataRegistrasi,
    checkInData,
    insertPasienBaru,
    listJadwalOperasi,
    getTindakanBedah,
    getJadwalOperasi,
    checkPasienId,
};
