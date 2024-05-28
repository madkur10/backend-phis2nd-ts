import { insertData, getPatient, getCheckEmail } from "./patient.repository";

interface dataPatient {
    name: string;
    phone: string;
    email: string;
    address: string;
    identity_number: string;
    date_of_birth: string;
    gender: string;
}

const getDataPatient = async (idPatient: number) => {
    const patient: any = await getPatient(idPatient);

    if (patient === null) {
        return null;
    }
    return patient;
};

const insertDataPatient = async (dataPatient: dataPatient) => {
    const user: any = await insertData(dataPatient);

    if (user === null) {
        return false;
    }
    return user;
};

const findEmail = async (email: string) => {
    const user: any = await getCheckEmail(email);

    if (user === null) {
        return false;
    }
    return user;
}

export { getDataPatient, insertDataPatient, findEmail };