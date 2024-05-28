import { prisma, prismaRawQuery } from "../../db";

export const loginUser = async (username: string) => {
    const user = await prisma.users.findUnique({
        where: {
            username,
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
            password: true,
            first_name: true,
            last_name: true,
            last_update_password: true,
            patients: true,
        }
    });
    
    return user;
};
