import { prisma, prismaRawQuery } from "../../db";
import { generateMax } from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";

const input_time_now: string = dateNow();

interface dataAppointments {
    patient_id: number;
    doctor_id: number;
    appointment_date: string;
    clinic_id: number;
    payer_id: number;
}
const insertData = async (dataAppointment: dataAppointments) => {
    const sequenceNumber = await generateMax("appointment_code");
    let today = new Date();
    let year = today.getFullYear().toString().slice(-2);
    let month = (today.getMonth() + 1).toString().padStart(2, "0");
    let date = today.getDate().toString().padStart(2, "0");
    let sequenceNumberString = sequenceNumber.toString().padStart(4, "0");

    let appointment_code = `R${date}${month}${year}-${sequenceNumberString}`;

    const appointment = await prisma.appointment.create({
        data: {
            created_id: 999,
            created_time: input_time_now,
            patient_id: dataAppointment.patient_id,
            doctor_id: dataAppointment.doctor_id,
            appointment_date: dataAppointment.appointment_date,
            clinic_id: dataAppointment.clinic_id,
            payer_id: dataAppointment.payer_id,
            appointment_code: appointment_code,
        },
    });

    return appointment;
};

const getDataApp = async (patient_id: number) => {
    const totalAppointment = await prisma.appointment.count({
        where: {
            patient_id: patient_id,
            deleted_id: null,
            deleted_time: null,
        },
    });

    const totalAppointmentPending = await prisma.appointment.count({
        where: {
            patient_id: patient_id,
            deleted_id: null,
            deleted_time: null,
            verified: null,
        },
    });

    const totalAppointmentDone = await prisma.appointment.count({
        where: {
            patient_id: patient_id,
            deleted_id: null,
            deleted_time: null,
            verified: 1,
        },
    });

    const dataAppointment = {
        totalAppointment: totalAppointment,
        totalAppointmentPending: totalAppointmentPending,
        totalAppointmentDone: totalAppointmentDone,
    };

    return dataAppointment;
};

const getListApp = async (patient_id: number) => {
    const appointment = await prisma.appointment.findMany({
        where: {
            patient_id: patient_id,
            deleted_id: null,
            deleted_time: null,
        },
    });

    return appointment;
};

export { insertData, getDataApp, getListApp };
