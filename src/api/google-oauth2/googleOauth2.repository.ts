import { prisma, prismaRawQuery } from "../../db";
import { generateMax } from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";

const input_time_now: string = dateNow();

const getEmail = async (email: string) => {
    const users = await prisma.patients.findUnique({
        where: {
            email
        },
        select: {
            email: true,
        }
    });

    return users;
};

export { getEmail };
