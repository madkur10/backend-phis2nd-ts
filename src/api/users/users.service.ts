import { getUsers, getUser, insertData, getUserName } from "./users.repository";

const getAllUsers = async (data: any) => {
    const users: any = await getUsers(data);
    if (users.length < 1) {
        return false;
    }
    return users;
};

const getDataUser = async (idUser: number) => {
    const user: any = await getUser(idUser);

    if (user === null) {
        return false;
    }
    return user;
};

interface dataUsers {
    input_user_id: number;
    user_name: string;
    user_password: string;
    nama_pegawai: string;
    pegawai_id: number;
}
const insertDataUser = async (dataUser: dataUsers) => {
    const user: any = await insertData(dataUser);

    if (user === null) {
        return false;
    }
    return user;
};

const getDataNameUser = async (nameUser: string) => {
    const user: any = await getUserName(nameUser);

    if (user.length < 1) {
        return false;
    }
    return user;
};

export { getAllUsers, getDataUser, insertDataUser, getDataNameUser };
