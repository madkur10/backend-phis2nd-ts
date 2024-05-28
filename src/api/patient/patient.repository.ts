import { prisma, prismaRawQuery } from "../../db";
import { generateMax } from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";

const input_time_now: string = dateNow();

const getPatient = async (idPatient: number) => {
    const patient = await prisma.patients.findUnique({
        where: {
            patient_id: idPatient,
        },
        select: {
            patient_id: true,
            created_id: true,
            created_time: true,
            modify_id: true,
            modify_time: true,
            deleted_id: true,
            deleted_time: true,
            patient_name: true,
            phone_number: true,
            email: true,
            identity_number: true,
            address: true,
            date_of_birth: true,
            gender: true,
        }
    });

    return patient;
};

interface dataPatient {
    name: string;
    phone: string;
    email: string;
    address: string;
    identity_number: string;
    date_of_birth: string;
    gender: string;
}
const insertData = async (dataPatient: dataPatient) => {
    const patient = await prisma.patients.create({
        data: {
            created_id: 999,
            created_time: input_time_now,
            patient_name: dataPatient.name,
            phone_number: dataPatient.phone,
            email: dataPatient.email,
            identity_number: dataPatient.identity_number,
            address: dataPatient.address,
            date_of_birth: dataPatient.date_of_birth,
            gender: dataPatient.gender,
            users: {
               
            }
        },
    });

    return patient;
};

const getCheckEmail = async (email: string) => {
    const patient = await prisma.patients.findUnique({
        where: {
            email,
        },
        select: {
            patient_id: true,
            created_id: true,
            created_time: true,
            modify_id: true,
            modify_time: true,
            deleted_id: true,
            deleted_time: true,
            patient_name: true,
            phone_number: true,
            email: true,
            identity_number: true,
            address: true,
            date_of_birth: true,
            gender: true,
        }
    });

    return patient;
}

export { getPatient, insertData, getCheckEmail };
