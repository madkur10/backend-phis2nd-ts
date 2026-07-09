import { prismaDb1, prismaDb2, prismaDb3 } from "../../db";

export const loginUser = async (data: any) => {
    const username = typeof data === "string" ? data : data.username;
    const user = await prismaDb1.users.findFirst({
        where: {
            user_name: username,
        },
        select: {
            user_id: true,
            user_name: true,
            user_password: true,
        }
    });
    
    return user;
};
