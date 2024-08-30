import {
    statusAntrean,
    checkRegistrasiTerdaftar,
    checkRegistrasiTerdaftarToday,
    checkEmrTerdaftar,
    insertRujukanService,
    checkRujukanService,
    checkDataNasabahBPJS,
    insertDataNasabahBPJS,
    checkDokterReadyService,
    insertPendaftaranService,
    sisaDataAntrean,
    batalDataAntrean,
    checkDataRegistrasi,
    checkInData,
    insertPasienBaru,
    listJadwalOperasi,
    getTindakanBedah,
    getJadwalOperasi,
    checkPasienId,
} from "./jknmobile.repository";
import { requestAxios } from "../../../utils/axiosClient";
import * as dotenv from "dotenv";
import { dateNow } from "./../../../middlewares/time";

dotenv.config();
const input_time_now: string = dateNow();

interface DataWillOutput {
    namapoli: string;
    namadokter: string;
    totalantrean: number;
    sisaantrean: number;
    antreanpanggil: string;
    sisakuotajkn: number;
    kuotajkn: number;
    sisakuotanonjkn: number;
    kuotanonjkn: number;
    keterangan: string;
}
const statusAntreanService = async (data: any) => {
    const resultqueryStatusAntrean: any = await statusAntrean(data);
    if (resultqueryStatusAntrean.length < 1) {
        return false;
    }

    const jumlah_terdaftar = resultqueryStatusAntrean.length;
    let sisa_kuota = resultqueryStatusAntrean[0].kuota - jumlah_terdaftar;

    if (sisa_kuota < 0) {
        sisa_kuota = 0;
    }

    const arr_sudah_soap: Record<string, string> = {};
    const arr_belum_soap: number[] = [];

    resultqueryStatusAntrean.forEach((valresultqueryStatusAntrean: any) => {
        if (valresultqueryStatusAntrean.emr_id) {
            arr_sudah_soap[valresultqueryStatusAntrean.registrasi_id] =
                valresultqueryStatusAntrean.emr_id;
        } else {
            arr_belum_soap.push(valresultqueryStatusAntrean.urutan);
        }
    });

    const terakhir_panggil = Math.min(...arr_belum_soap);
    const jumlah_terlayani = Object.keys(arr_sudah_soap).length;
    const sisa_antrian = jumlah_terdaftar - jumlah_terlayani;

    const dataWillOutput: DataWillOutput = {
        namapoli: resultqueryStatusAntrean[0].nama_bagian,
        namadokter: resultqueryStatusAntrean[0].dpjp_hfis_nama,
        totalantrean: jumlah_terdaftar,
        sisaantrean: sisa_antrian,
        antreanpanggil: terakhir_panggil.toString(),
        sisakuotajkn: sisa_kuota,
        kuotajkn: resultqueryStatusAntrean[0].kuota,
        sisakuotanonjkn: sisa_kuota,
        kuotanonjkn: resultqueryStatusAntrean[0].kuota,
        keterangan: "",
    };

    return dataWillOutput;
};

const daftarPerjanjianService = async (data: any) => {
    if (!data.norm) {
        return {
            message: "Pasien Baru",
            code: 202,
        };
    }

    const checkNasabahBPJS: any = await checkDataNasabahBPJS(data.norm);
    if (!checkNasabahBPJS[0].pasien_nasabah_id) {
        const dataNasabah = {
            pasien_id: checkNasabahBPJS[0].pasien_id,
            nasabah_id: 543,
            no_peserta: data.nomorkartu,
            input_user_id: data.input_user_id,
        };
        const nasabahBPJS: any = await insertDataNasabahBPJS(dataNasabah);

        checkNasabahBPJS[0].pasien_nasabah_id = nasabahBPJS.pasien_nasabah_id;
    }

    let pasien_id = checkNasabahBPJS[0].pasien_id;
    let pasien_nasabah_id = checkNasabahBPJS[0].pasien_nasabah_id;

    const checkPendaftaranTerdaftar: any = await checkRegistrasiTerdaftar(
        pasien_id
    );
    if (checkPendaftaranTerdaftar.length > 0) {
        if (checkPendaftaranTerdaftar[0].kode_poli_bpjs === data.kodepoli) {
            return {
                code: 201,
                message: `Anda sudah terdaftar di Poli ini pada tanggal ${checkPendaftaranTerdaftar[0].tgl_masuk}`,
            };
        } else if (
            checkPendaftaranTerdaftar[0].kode_poli_bpjs !== data.kodepoli &&
            new Date(checkPendaftaranTerdaftar[0].tgl_masuk + " 00:00:00") ===
                new Date(data.tanggalperiksa + " 00:00:00")
        ) {
            return {
                code: 201,
                message: `Anda sudah terdaftar di Poli ${checkPendaftaranTerdaftar[0].nama_bagian} pada tanggal ${checkPendaftaranTerdaftar[0].tgl_masuk}`,
            };
        }
    }

    const dataPendaftaranTerdaftarToday = {
        pasien_id,
        kode_poli_bpjs: data.kodepoli,
    };
    const checkPendaftaranTerdaftarToday: any =
        await checkRegistrasiTerdaftarToday(dataPendaftaranTerdaftarToday);
    if (checkPendaftaranTerdaftarToday.length > 0) {
        const checkEmrPasien: any = await checkEmrTerdaftar(data);
        if (checkEmrPasien.length < 1) {
            return {
                code: 201,
                message: "Hari Ini Ada Pelayanan Yang Belum Diselesaikan.",
            };
        }
    }

    const jeniskunjungan = data.jeniskunjungan;
    let responseRujukan: any = {};
    let responseSKDP: any = {};
    let collectionData: any = {};
    let noRujukan = data.nomorreferensi;
    if (jeniskunjungan === 1 || jeniskunjungan === 4) {
        const checkRujukan: any = await checkRujukanService(
            data.nomorreferensi
        );
        if (!checkRujukan) {
            const urlRujukan = `http://sirs.rspelni.co.id/API/BPJS/SIMRS-VCLAIM/V2/CARIRUJUKAN/NORUJUKAN/${data.nomorreferensi}`;
            const method = "GET";
            const headersData = {};

            responseRujukan = await requestAxios(
                headersData,
                urlRujukan,
                method,
                null
            );

            if (responseRujukan.data.metadata.code == "200") {
                const insertRujukan: any = await insertRujukanService(
                    responseRujukan.data,
                    data.input_user_id
                );
            } else {
                return {
                    code: 201,
                    message: responseRujukan.data.metadata.message,
                };
            }
        }
    } else if (jeniskunjungan === 3) {
        const urlSKDP = `http://sirs.rspelni.co.id/API/BPJS/SIMRS-VCLAIM/V2/SURAT-KONTROL/INTERNAL/CARI/${data.nomorreferensi}`;
        const method = "GET";
        const headersData = {};

        responseSKDP = await requestAxios(headersData, urlSKDP, method, null);

        if (responseSKDP.data.metadata.code == "200") {
            noRujukan = responseSKDP.data.response.sep.provPerujuk.noRujukan;

            const checkRujukan: any = await checkRujukanService(noRujukan);
            if (!checkRujukan) {
                const urlRujukan = `http://sirs.rspelni.co.id/API/BPJS/SIMRS-VCLAIM/V2/CARIRUJUKAN/NORUJUKAN/${noRujukan}`;
                const method = "GET";
                const headersData = {};

                responseRujukan = await requestAxios(
                    headersData,
                    urlRujukan,
                    method,
                    null
                );

                if (responseRujukan.data.metadata.code == "200") {
                    const insertRujukan: any = await insertRujukanService(
                        responseRujukan.data,
                        data.input_user_id
                    );
                } else {
                    return {
                        code: 201,
                        message: responseRujukan.data.metadata.message,
                    };
                }
            }
        } else {
            return {
                code: 201,
                message: responseSKDP.data.metadata.message,
            };
        }
    }

    const checkDokterReady: any = await checkDokterReadyService(data);
    let kuota = 0;
    let jumlah_terdaftar = 0;
    let sisaPasien = 0;
    if (checkDokterReady.length > 0) {
        //kuota
        kuota = parseInt(checkDokterReady[0].kuota, 10);
        jumlah_terdaftar = parseInt(checkDokterReady[0].jumlah_terdaftar, 10);
        if (kuota > 0) {
            sisaPasien = kuota - jumlah_terdaftar;
            if (sisaPasien < 1) {
                return {
                    code: 201,
                    message: "Quota Dokter Tidak Tersedia di SIMRS",
                };
            }
        }

        //cuti
        if (checkDokterReady[0].tgl_akhir_cuti) {
            return {
                code: 201,
                message: "Dokter Sedang Cuti",
            };
        }
    } else {
        return {
            code: 201,
            message: "Dokter Tidak Tersedia di SIMRS",
        };
    }

    collectionData = {
        data,
        pasien_id,
        pasien_nasabah_id,
        noRujukan,
    };

    const insertPendaftaran: any = await insertPendaftaranService(
        collectionData
    );

    return {
        code: 200,
        message: "OK",
        data: {
            nomorantrean: insertPendaftaran.urutan,
            angkaantrean: insertPendaftaran.urutan,
            kodebooking: insertPendaftaran.registrasi_id,
            norm: data.norm,
            namapoli: insertPendaftaran.bagian,
            namadokter: insertPendaftaran.dpjp,
            estimasidilayani: insertPendaftaran.estimasidilayani,
            sisakuotajkn: sisaPasien,
            kuotajkn: kuota,
            sisakuotanonjkn: sisaPasien,
            kuotanonjkn: kuota,
            keterangan:
                "Peserta harap 60 menit lebih awal guna pencatatan administrasi.",
        },
    };
};

const sisaAntreanService = async (data: any) => {
    const sisaAntrean: any = await sisaDataAntrean(data);

    if (sisaAntrean) {
        let SPM: any = process.env.SPM;
        let sisa_antrean = parseInt(sisaAntrean.sisaantrean, 10);
        let waktuTunggu = SPM * (sisa_antrean - 1);

        return {
            code: 200,
            message: "OK",
            data: {
                nomorantrean: sisaAntrean.urutan,
                namapoli: sisaAntrean.nama_bagian,
                namadokter: sisaAntrean.nama_pegawai,
                sisaantrean: sisa_antrean,
                antreanpanggil: sisaAntrean.antreanpanggil
                    ? sisaAntrean.antreanpanggil
                    : "",
                waktutunggu: waktuTunggu,
                keterangan: "",
            },
        };
    } else {
        return {
            code: 201,
            message: "Data Tidak Ditemukan atau sudah dibatalkan",
        };
    }
};

const batalAntreanService = async (data: any) => {
    const checkRegistrasi: any = await checkDataRegistrasi(data);
    if (!checkRegistrasi) {
        return {
            code: 201,
            message: "Data Tidak Ditemukan atau sudah dibatalkan",
        };
    }

    const batalAntrean: any = await batalDataAntrean(data);
    if (batalAntrean) {
        return {
            code: 200,
            message: "OK",
        };
    }
};

const checkInService = async (data: any) => {
    const checkRegistrasi: any = await checkDataRegistrasi(data);
    if (!checkRegistrasi) {
        return {
            code: 201,
            message: "Data Tidak Ditemukan atau sudah dibatalkan",
        };
    }

    const checkIn: any = await checkInData(data);
    if (checkIn) {
        return {
            code: 200,
            message: "OK",
        };
    }
};

const pasienBaruService = async (data: any) => {
    const checkPasienIdData: any = await checkPasienId(data.nik);
    if (checkPasienIdData) {
        return {
            code: 200,
            message: "Harap datang ke admisi untuk melengkapi data rekam medis",
            norm: checkPasienIdData.no_mr,
        };
    }

    const pasienBaru: any = await insertPasienBaru(data);
    if (pasienBaru) {
        return {
            code: 200,
            message: "Harap datang ke admisi untuk melengkapi data rekam medis",
            norm: pasienBaru.no_mr,
        };
    } else {
        return {
            code: 201,
            message: "Pasien Baru Gagal",
        };
    }
};

const listJadwalOperasiService = async (data: any) => {
    const listOperasi: any = await listJadwalOperasi(data);

    if (listOperasi.length > 0) {
        let new_result_end: any = [];
        await Promise.all(
            listOperasi.map(async (element: any) => {
                let jenisTindakan: any = [];
                if (element.jenistindakan) {
                    let matches = element.jenistindakan.match(/\d+/g);
                    await Promise.all(
                        matches.map(async (value: any) => {
                            const getNamaTindakanBedah = await getTindakanBedah(
                                value
                            );
                            jenisTindakan.push(getNamaTindakanBedah);
                        })
                    );

                    jenisTindakan = jenisTindakan.join(", ");
                } else {
                    jenisTindakan = "-";
                }

                let new_result = {
                    kodebooking: element.kodebooking,
                    tanggaloperasi: element.tanggaloperasi,
                    jenistindakan: jenisTindakan,
                    kodepoli: element.kodepoli ? element.kodepoli : "",
                    namapoli: element.namapoli ? element.namapoli : "",
                    terlaksana: element.terlaksana,
                    nopeserta: element.nopeserta,
                    lastupdate: new Date(input_time_now).getTime(),
                };

                new_result_end.push(new_result);
            })
        );

        return {
            code: 200,
            message: "OK",
            data: new_result_end,
        };
    } else {
        return {
            code: 201,
            message: "Jadwal Operasi Tidak Ditemukan",
        };
    }
};

const jadwalOperasiService = async (data: any) => {
    const jadwalOperasi: any = await getJadwalOperasi(data);
    if (jadwalOperasi.length > 0) {
        let new_result_end: any = [];
        await Promise.all(
            jadwalOperasi.map(async (element: any) => {
                let jenisTindakan: any = [];
                if (element.jenistindakan) {
                    let matches = element.jenistindakan.match(/\d+/g);
                    await Promise.all(
                        matches.map(async (value: any) => {
                            const getNamaTindakanBedah = await getTindakanBedah(
                                value
                            );
                            jenisTindakan.push(getNamaTindakanBedah);
                        })
                    );

                    jenisTindakan = jenisTindakan.join(", ");
                } else {
                    jenisTindakan = "-";
                }

                let new_result = {
                    kodebooking: element.kodebooking,
                    tanggaloperasi: element.tanggaloperasi,
                    jenistindakan: jenisTindakan,
                    kodepoli: element.kodepoli ? element.kodepoli : "",
                    namapoli: element.namapoli ? element.namapoli : "",
                    terlaksana: element.terlaksana,
                };

                new_result_end.push(new_result);
            })
        );

        return {
            code: 200,
            message: "OK",
            data: new_result_end,
        };
    } else {
        return {
            code: 201,
            message: "Jadwal Operasi Tidak Ditemukan",
        };
    }
};

export {
    statusAntreanService,
    daftarPerjanjianService,
    sisaAntreanService,
    batalAntreanService,
    checkInService,
    pasienBaruService,
    listJadwalOperasiService,
    jadwalOperasiService,
};
