import { getPasienFisioReadyHitNow } from "./antrolAuto.repository";
import axios from "axios";

const hitFisioNow = async (limit: number) => {
    const readyHitFisio: any = await getPasienFisioReadyHitNow(limit);
    if (readyHitFisio.length < 1) {
        return false;
    }

    let dataEndResponse: any = [];

    for (let i = 0; i < readyHitFisio.length; i++) {
        const url = `http://localhost:8888/API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/CHECK-KODEBOOKING/${readyHitFisio[i].registrasi_id}`;
        const method = "GET";
        const headersData = {};

        const responseBooking = await requestAxios(
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
                const urlAdd = `http://localhost:8888/API/BPJS/SIMRS-VCLAIM/V2/ANTROL/ANTREAN/ADD-KODEBOOKING/1`;
                const methodAdd = "POST";
                const headersDataAdd = {
                    "Content-Type": "application/json",
                };
                
                const responseAdd = await requestAxios(
                    headersDataAdd,
                    urlAdd,
                    methodAdd,
                    xmldataend
                );
                    
                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: responseAdd.data.metadata.message,
                }
                dataEndResponse.push(dataObj);
            } else {
                const dataObj = {
                    id: readyHitFisio[i].registrasi_id,
                    response: message,
                }
                dataEndResponse.push(dataObj);
            }
        } else {
            const dataObj = {
                id: readyHitFisio[i].registrasi_id,
                response: false,
            }
            dataEndResponse.push(dataObj);
        }
    }

    return dataEndResponse;
};

const requestAxios = async (
    headersData: any,
    url: string,
    method: string,
    xmldata: any
) => {
    let headersList = headersData;
    let reqOptions = {};
    if (method === "POST") {
        headersList = {
            "Content-Type": "application/json",
        };

        let bodyContent = JSON.stringify(xmldata);
        reqOptions = {
            url: url,
            method: method,
            headers: headersList,
            data: bodyContent,
        };
    } else {
        reqOptions = {
            url: url,
            method: method,
            headers: headersList,
        };
    }

    let response = await axios.request(reqOptions);
    return response;
};

export { hitFisioNow };
