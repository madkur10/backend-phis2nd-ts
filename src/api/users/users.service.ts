import { getUser, insertData, getUsername, insertUserPatient } from "./users.repository";

const getDataUser = async (idUser: number) => {
    const user: any = await getUser(idUser);

    if (user === null) {
        return null;
    }
    return user;
};

interface dataUsers {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
}
const insertDataUser = async (dataUser: dataUsers) => {
    const user: any = await insertData(dataUser);

    if (user === null) {
        return false;
    }
    return user;
};

const getDataUsername = async (username: string) => {
    const user: any = await getUsername(username);

    if (user === null) {
        return null;
    }
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

const insertDataUserPatient = async (dataUserPatient: dataUserPatient) => {
    const user: any = await insertUserPatient(dataUserPatient);

    if (user === null) {
        return false;
    }
    return user;
}

export { getDataUser, insertDataUser, getDataUsername, insertDataUserPatient };
