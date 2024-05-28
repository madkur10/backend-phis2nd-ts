import { prisma, prismaRawQuery } from "../../db";
import { generateMax } from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";

const input_time_now: string = dateNow();

const getUser = async (idUser: number) => {
    const user = await prisma.users.findUnique({
        where: {
            user_id: idUser,
        },
        select: {
            user_id: true,
            created_id: true,
            created_time: true,
            modify_id: true,
            modify_time: true,
            deleted_id: true,
            deleted_time: true,
            username: true,
            first_name: true,
            last_name: true,
            last_update_password: true,
            patients: true,
        }
    });

    return user;
};

interface dataUsers {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
}
const insertData = async (dataUser: dataUsers) => {
    const user = await prisma.users.create({
        data: {
            created_id: 999,
            created_time: input_time_now,
            username: dataUser.username,
            password: dataUser.password,
            first_name: dataUser.first_name,
            last_name: dataUser.last_name,
            last_update_password: input_time_now,
        },
    });

    const userData = {
        user_id: user.user_id,
        created_id: user.created_id,
        created_time: user.created_time,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
    };

    return userData;
};

const getUsername = async (username: string) => {
    const user = await prisma.users.findUnique({
        where: {
            username: username
        },
        select: {
            user_id: true,
        }
    });

    return user;
}

interface dataUserPatient {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    patient_name: string;
    patient_phone: string;
    patient_email: string;
    patient_address: string;
    identity_number: string;
    date_of_birth: string;
    gender: string;
}

const insertUserPatient = async (dataUserPatient: dataUserPatient) => {
    const user = await prisma.users.create({
        data: {
            created_id: 999,
            created_time: input_time_now,
            username: dataUserPatient.username,
            password: dataUserPatient.password,
            first_name: dataUserPatient.first_name,
            last_name: dataUserPatient.last_name,
            last_update_password: input_time_now,
            patients: {
                create: {
                    patient_name: dataUserPatient.patient_name,
                    phone_number: dataUserPatient.patient_phone,
                    email: dataUserPatient.patient_email,
                    address: dataUserPatient.patient_address,
                    identity_number: dataUserPatient.identity_number,
                    date_of_birth: dataUserPatient.date_of_birth,
                    gender: dataUserPatient.gender,
                    created_id: 999,
                    created_time: input_time_now,
                }
            }
        },
    });

    const userData = {
        user_id: user.user_id,
        created_id: user.created_id,
        created_time: user.created_time,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
    };

    return userData;
}

export { getUser, insertData, getUsername, insertUserPatient };
