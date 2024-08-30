import { prismaDb1, prismaDb2, prismaDb3 } from "./../../../db";
import {
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";

const input_time_now: string = dateNow();

const checkTokenExist = async () => {
    const check = await prismaDb2.token.findFirst({
        select: {
            access_token: true,
            last_update_date: true,
        },
    });
    return check;
};

const insertToken = async (generateToken: any) => {
    const idToken = await generateMaxDb2("token", "id");
    const insert = await prismaDb2.token.create({
        data: {
            id: idToken,
            access_token: generateToken.access_token,
            last_update_date: input_time_now,
        },
    });

    return insert;
};

const updateToken = async (generateToken: any) => {
    const update = await prismaDb2.token.update({
        where: {
            id: 1,
        },
        data: {
            last_update_date: input_time_now,
            access_token: generateToken.access_token,
        },
    });
    return update;
};

export { checkTokenExist, insertToken, updateToken };
