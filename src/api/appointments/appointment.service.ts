import { insertData, getDataApp, getListApp } from "./appointment.repository";
import axios from "axios";

const insertDataAppointment = async (data: any) => {
    const appointment = await insertData(data);

    if (appointment === null) {
        return null;
    }
    return appointment;
};

type AppointmentData = {
    totalAppointment: number;
    totalAppointmentPending: number;
    totalAppointmentDone: number;
    totalDokterPraktek?: number; // Properti totalDokterPraktek bersifat opsional (?)
};
const getDataAppointment = async (patient_id: number) => {
    const appointment: AppointmentData = await getDataApp(patient_id);

    const today = new Date();
    const tanggal = today.toISOString().split("T")[0];
    const url = `http://localhost:8888/api/new-apm/data-poli-jadwal/jumlah-dokter-praktek/${tanggal}`;
    const method = "GET";
    const headersData = {};

    const responseBooking = await requestAxios(headersData, url, method, null);
    if (responseBooking.data) {
        const jumlahJadwalPraktek = responseBooking.data.response;

        appointment.totalDokterPraktek = jumlahJadwalPraktek;
    }

    if (appointment === null) {
        return null;
    }
    return appointment;
};

interface appointmentList {
    appointment_id: number | null;
    created_id: number | null;
    created_time: Date | null;
    modify_id: null | number;
    modify_time: null | Date;
    deleted_id: null | number;
    deleted_time: null | Date;
    patient_id: number | null;
    appointment_date: Date | null;
    doctor_id: number | null;
    doctor_name?: string;
    clinic_id: number | null;
    clinic_name?: string;
    payer_id: number | null;
    verified: number | null;
    appointment_code: string | null;
}
const getListAppointment = async (patient_id: number) => {
    const appointmentList: appointmentList[] = await getListApp(patient_id);

    //list bagian
    const urlBagian = `http://localhost:8888/api/new-apm/data-poli-jadwal/list-bagian`;
    const method = "GET";
    const headersData = {};

    const list_bagian = await requestAxios(
        headersData,
        urlBagian,
        method,
        null
    );
    let list_bagian_response: any;
    if (list_bagian.data) {
        list_bagian_response = list_bagian.data.response;
    }

    //list pegawai
    const urlPegawai = `http://localhost:8888/api/new-apm/data-poli-jadwal/list-pegawai`;
    const list_pegawai = await requestAxios(
        headersData,
        urlPegawai,
        method,
        null
    );
    let list_pegawai_response: any;
    if (list_pegawai.data) {
        list_pegawai_response = list_pegawai.data.response;
    }

    if (appointmentList.length < 1) {
        return null;
    }

    appointmentList.forEach((element) => {
        const pegawai = list_pegawai_response.find(
            (item: any) => item.pegawai_id === element.doctor_id
        );
        const bagian = list_bagian_response.find(
            (item: any) => item.bagian_id === element.clinic_id
        );

        if (pegawai) {
            element.doctor_name = pegawai.nama_pegawai;
        }
        if (bagian) {
            element.clinic_name = bagian.nama_bagian;
        }
    });

    return appointmentList;
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

export { insertDataAppointment, getDataAppointment, getListAppointment };
