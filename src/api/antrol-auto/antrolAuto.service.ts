import {
    getPasienFisioReadyHitNow,
    listReadyHitTaskBpjs,
    listReadyHitTaskBpjsFisio,
    getPasienHitUlangAddAntrol,
    getKodeBagian
} from "./antrolAuto.repository";
import { requestAxios } from "../../utils/axiosClient";
import * as dotenv from "dotenv";

dotenv.config();

const updateTask = async (limit: number, task_id: number) => {
    const task_bpjs: any = await listReadyHitTaskBpjs(limit, task_id);
    if (task_bpjs.length < 1) {
        return false;
    }

    let dataEndResponse: any = [];

    for (let i = 0; i < task_bpjs.length; i++) {
        const registrasi_id = task_bpjs[i].registrasi_id;
        let task_time = task_bpjs[i].task_time;
        let task_time_current = task_bpjs[i].task_time;
        task_time.setHours(task_time.getHours() - 7);
        if (task_id == 2) {
            task_time.setMinutes(task_time.getMinutes() + 1);
        } else if (task_id == 3) {
            task_time.setMinutes(task_time.getMinutes() + 2);
        }

        task_time = Date.parse(task_time) / 1000;

        const url = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/UPDATE/${registrasi_id}-${task_id}-1-${task_time}`;
        const method = "GET";
        const headersData = {};

        const responseBooking: any = await requestAxios(
            headersData,
            url,
            method,
            null
        );

        const dataObj = {
            id: registrasi_id,
            task_time: new Date(task_time_current.setHours(task_time_current.getHours() + 7)),
            url: url,
            response: responseBooking.data.metadata.message,
            description: "Update Task Rajal",
        };
        dataEndResponse.push(dataObj);
    }

    return dataEndResponse;
};

const updateTaskFisio = async (limit: number, task_id: number) => {
    const task_bpjs: any = await listReadyHitTaskBpjsFisio(limit, task_id);
    if (task_bpjs.length < 1) {
        return false;
    }

    let dataEndResponse: any = [];
    let task_time = getDateWithOffset(task_id);
    // task_time.setHours(task_time.getHours() - 7);
    let task_timex = Date.parse(task_time) / 1000;

    for (let i = 0; i < task_bpjs.length; i++) {
        const registrasi_id = task_bpjs[i].registrasi_id;
        const url = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/UPDATE/${registrasi_id}-${task_id}-1-${task_timex}`;
        const method = "GET";
        const headersData = {};

        const responseBooking: any = await requestAxios(
            headersData,
            url,
            method,
            null
        );
        
        const dataObj = {
            id: registrasi_id,
            task_time: task_time,
            url: url,
            response: responseBooking.data.metadata.message,
            description: "Update Task Fisio",
        };
        dataEndResponse.push(dataObj);
    }

    return dataEndResponse;
};

const hitFisioNow = async (limit: number) => {
    const readyHitFisio: any = await getPasienFisioReadyHitNow(limit);
    if (readyHitFisio.length < 1) {
        return false;
    }

    let dataEndResponse: any = [];

    for (let i = 0; i < readyHitFisio.length; i++) {
        const url = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/CHECK-KODEBOOKING/${readyHitFisio[i].registrasi_id}`;
        const method = "GET";
        const headersData = {};

        const responseBooking: any = await requestAxios(
            headersData,
            url,
            method,
            null
        );

        if (responseBooking.data) {
            const xmldata = responseBooking.data.response;
            const code = responseBooking.data.metadata.code;
            const message = responseBooking.data.metadata.message;

            if (code === 204) {
                const xmldataend = {
                    nomorkartu: xmldata.no_peserta,
                    nik: xmldata.nik,
                    nohp: xmldata.no_hp,
                    kodepoli: xmldata.kode_poli,
                    norm: xmldata.no_mr,
                    tanggalperiksa: xmldata.tgl_periksa,
                    namadokter: xmldata.dpjp_hfis_nama,
                    jampraktek: xmldata.jampraktek,
                    kodebooking: xmldata.registrasi_id,
                    jenispasien: "JKN",
                    namapoli: xmldata.nama_bagian,
                    pasienbaru: "0",
                    kodedokter: xmldata.dpjp_hfis_kode,
                    nomorantrean: xmldata.urutan,
                    angkaantrean: xmldata.urutan,
                    estimasidilayani: xmldata.estimasidilayani,
                    sisakuotajkn: xmldata.sisakuota,
                    kuotajkn: xmldata.kuota,
                    sisakuotanonjkn: xmldata.sisakuota,
                    kuotanonjkn: xmldata.kuota,
                    keterangan:
                        "Peserta harap 60 menit lebih awal guna pencatatan administrasi.",
                    jeniskunjungan: "2",
                    nomorreferensi: xmldata.nomorreferensi,
                };
                const urlAdd = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/ADD-KODEBOOKING/1`;
                const methodAdd = "POST";
                const headersDataAdd = {
                    "Content-Type": "application/json",
                };

                const responseAdd: any = await requestAxios(
                    headersDataAdd,
                    urlAdd,
                    methodAdd,
                    xmldataend
                );

                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: responseAdd.data.metadata.message,
                };
                dataEndResponse.push(dataObj);
            } else {
                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: message,
                };
                dataEndResponse.push(dataObj);
            }
        } else {
            const dataObj = {
                id: readyHitFisio[i].registrasi_id,
                response: false,
            };
            dataEndResponse.push(dataObj);
        }
    }

    return dataEndResponse;
};

const hitUlangAddAntrol = async (limit: number) => {
    const readyHitFisio: any = await getPasienHitUlangAddAntrol(limit);
    if (readyHitFisio.length < 1) {
        return false;
    }

    let dataEndResponse: any = [];

    for (let i = 0; i < readyHitFisio.length; i++) {
        const url = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/CHECK-KODEBOOKING/${readyHitFisio[i].registrasi_id}`;
        const method = "GET";
        const headersData = {};
        let regId = readyHitFisio[i].registrasi_id;
        let regIdStr = regId.toString();
        let regEnd;
        if (regIdStr.length > 6) {
            regEnd = regIdStr.slice(-6);
        } else {
            regEnd = regIdStr.padStart(6, "0");
        }
        const bulan = ("0" + (new Date().getMonth() + 1)).slice(-2);
        const tahun = new Date().getFullYear().toString().slice(-2);

        const nomorreferensinew = `0904005R${bulan}${tahun}A${regEnd}`;

        const responseBooking: any = await requestAxios(
            headersData,
            url,
            method,
            null
        );

        if (responseBooking.data) {
            const xmldata = responseBooking.data.response;
            const code = responseBooking.data.metadata.code;
            const message = responseBooking.data.metadata.message;

            if (code === 204) {
                const xmldataend = {
                    nomorkartu: xmldata.no_peserta,
                    nik: xmldata.nik,
                    nohp: xmldata.no_hp,
                    kodepoli: xmldata.kode_poli,
                    norm: xmldata.no_mr,
                    tanggalperiksa: xmldata.tgl_periksa,
                    namadokter: xmldata.dpjp_hfis_nama,
                    jampraktek: xmldata.jampraktek,
                    kodebooking: xmldata.registrasi_id,
                    jenispasien: "JKN",
                    namapoli: xmldata.nama_bagian,
                    pasienbaru: "0",
                    kodedokter: xmldata.dpjp_hfis_kode,
                    nomorantrean: xmldata.urutan,
                    angkaantrean: xmldata.urutan,
                    estimasidilayani: xmldata.estimasidilayani,
                    sisakuotajkn: xmldata.sisakuota,
                    kuotajkn: xmldata.kuota,
                    sisakuotanonjkn: xmldata.sisakuota,
                    kuotanonjkn: xmldata.kuota,
                    keterangan:
                        "Peserta harap 60 menit lebih awal guna pencatatan administrasi.",
                    jeniskunjungan: "2",
                    nomorreferensi: nomorreferensinew,
                };
                const urlAdd = `${process.env.urlPHIS}API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/ADD-KODEBOOKING/1`;
                const methodAdd = "POST";
                const headersDataAdd = {
                    "Content-Type": "application/json",
                };

                const responseAdd: any = await requestAxios(
                    headersDataAdd,
                    urlAdd,
                    methodAdd,
                    xmldataend
                );

                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: responseAdd.data.metadata.message,
                    payload: xmldataend,
                };
                dataEndResponse.push(dataObj);
            } else {
                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: message,
                };
                dataEndResponse.push(dataObj);
            }
        } else {
            const dataObj = {
                id: readyHitFisio[i].registrasi_id,
                response: false,
            };
            dataEndResponse.push(dataObj);
        }
    }

    return dataEndResponse;
};

function getDateWithOffset(param: number) {
    if (param < 1 || param > 7) {
        throw new Error("Parameter harus antara 1 dan 7");
    }

    const now = new Date();
    
    // Menambahkan 7 jam untuk menyesuaikan dengan zona waktu Asia/Jakarta
    // now.setHours(now.getHours() + 7);

    if (param === 1) {
        // Tidak ada penambahan waktu
    } else if (param === 2) {
        now.setMinutes(now.getMinutes() + 10);
    } else if (param === 3) {
        now.setMinutes(now.getMinutes() + 20);
    } else if (param === 4) {
        now.setMinutes(now.getMinutes() + 30);
    } else if (param === 5) {
        now.setMinutes(now.getMinutes() + 40);
    } else if (param === 6) {
        now.setMinutes(now.getMinutes() + 50);
    } else if (param === 7) {
        now.setMinutes(now.getMinutes() + 60);
    }

    // Format tanggal menjadi 'YYYY-MM-DD HH:mm:ss.SSS'
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export { hitFisioNow, updateTask, updateTaskFisio, hitUlangAddAntrol };
