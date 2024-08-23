import { prismaDb1, prismaDb2, prismaDb3 } from "../../db";

export const loginUser = async (data: any) => {
    const user = await prismaDb1.users.findFirst({
        where: {
            user_name: data.username,
            user_password: data.password
        },
        select: {
            user_id: true,
            user_name: true,
        }
    });
    
    return user;
};
