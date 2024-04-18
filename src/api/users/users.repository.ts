import { prisma, prismaRawQuery } from "./../../db";
import { generateMax } from "./../../db/database.handler";
import { dateNow } from "./../../middlewares/time";

const input_time_now: string = dateNow();

const getUsers = async (data: any) => {
    let { pageNumber, itemsPerPage } = data;

    if (!pageNumber) {
        pageNumber = 1
    }

    if (!itemsPerPage) {
        itemsPerPage = 10
    }

    const offset = (pageNumber - 1) * itemsPerPage;

    const users = await prisma.users.findMany({
        take: itemsPerPage,
        skip: offset,
        orderBy: {
            user_id: "asc",
        },
        select: {
            user_id: true,
            input_time: true,
            input_user_id: true,
            mod_time: true,
            mod_user_id: true,
            status_batal: true,
            user_name: true,
            nama_pegawai: true,
            last_update_pass: true,
            pegawai_id: true,
        },
    });

    return users;
};

const getUser = async (idUser: number) => {
    const user = await prisma.users.findUnique({
        where: {
            user_id: idUser,
        },
        select: {
            user_id: true,
            input_time: true,
            input_user_id: true,
            mod_time: true,
            mod_user_id: true,
            status_batal: true,
            user_name: true,
            nama_pegawai: true,
            last_update_pass: true,
            pegawai_id: true,
        },
    });

    return user;
};

interface dataUsers {
    input_user_id: number;
    user_name: string;
    user_password: string;
    nama_pegawai: string;
    pegawai_id: number;
}
const insertData = async (dataUser: dataUsers) => {
    const userId = await generateMax("users", "user_id");
    const user = await prisma.users.create({
        data: {
            user_id: userId,
            input_time: input_time_now,
            input_user_id: dataUser.input_user_id,
            user_name: dataUser.user_name,
            user_password: dataUser.user_password,
            nama_pegawai: dataUser.nama_pegawai,
            last_update_pass: input_time_now,
            pegawai_id: dataUser.pegawai_id,
        },
    });

    return user;
};

const getUserName = async (nameUser: string) => {
    const rawQuery = prismaRawQuery.sql`
        SELECT 
            users.user_id,
            users.input_time,
            users.input_user_id,
            users.mod_time,
            users.mod_user_id,
            users.status_batal,
            users.user_name,
            users.nama_pegawai,
            users.last_update_pass,
            users.pegawai_id
        FROM 
            users
        WHERE
            users.nama_pegawai ilike ${"%" + nameUser + "%"};`;
    const user = await prisma.$queryRaw(rawQuery);

    return user;
};

export { getUsers, getUser, insertData, getUserName };
