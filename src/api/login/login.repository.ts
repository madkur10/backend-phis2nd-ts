import { prisma, prismaRawQuery } from "./../../db";

export const loginUser = async (userData: any) => {
    const username: String = userData.username;
    const password: String = userData.password;

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
            users.user_name = ${username}
            AND users.user_password = ${password}`;
    const users = await prisma.$queryRaw(rawQuery);
    
    return users;
};
