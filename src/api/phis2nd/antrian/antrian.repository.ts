import { prismaDb1 } from "./../../../db";
import {
    generateMaxDb1,
    selectFieldDb1,
    timeHandler,
} from "./../../../db/database.handler";
import { dateNow } from "./../../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const panggilAntrian = async (data: any) => {
    const antrian = await prismaDb1.monitoring_antrian_resep.update({
        where: {
            monitoring_antrian_resep_id: parseInt(
                data.monitoring_antrian_resep_id
            ),
        },
        data: {
            time_panggil: dateNow(),
            flag_panggil: 1,
            loket: data.loket,
            user_id_panggil: parseInt(data.input_user_id),
            mod_time: dateNow(),
            mod_user_id: parseInt(data.input_user_id),
        },
    });

    return antrian;
};

const updateAntrian = async (data: any) => {
    const antrian = await prismaDb1.monitoring_antrian_resep.update({
        where: {
            monitoring_antrian_resep_id: parseInt(
                data.monitoring_antrian_resep_id
            ),
        },
        data: {
            flag_panggil: 2,
            mod_time: dateNow(),
            mod_user_id: parseInt(data.input_user_id),
        },
    });

    return antrian;
};

export { panggilAntrian, updateAntrian };
