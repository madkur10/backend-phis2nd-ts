import { prismaDb1 } from "./../../db";
import {
    generateMaxDb1,
    selectFieldDb1,
    timeHandler,
} from "./../../db/database.handler";
import { dateNow } from "./../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const checkChatIdRepo = async (data: any) => {
    const checkChatId = await prismaDb1.chat.findFirst({
        where: {
            registrasi_detail_id: parseInt(data.registrasi_detail_id, 10),
            peresepan_obat_id: parseInt(data.peresepan_obat_id, 10),
            pasien_id: parseInt(data.pasien_id, 10),
            status_batal: null,
        },
        select: {
            chat_id: true,
            pasien_id: true,
        },
    });

    const getNamaPasien = await prismaDb1.pasien.findFirst({
        where: {
            pasien_id: parseInt(data.pasien_id, 10),
        },
        select: {
            nama_pasien: true,
            no_mr: true,
        },
    });
    
    return {
        ...checkChatId,
        nama_pasien: getNamaPasien?.nama_pasien || "Pasien Tidak Ditemukan",
        no_mr: getNamaPasien?.no_mr || "Pasien Tidak Ditemukan",
    };
};

const saveChat = async (data: any) => {
    let chatId = 0;
    if (!data.chat_id) {
        chatId = await generateMaxDb1("chat", "chat_id");
        const insertChat = await prismaDb1.chat.create({
            data: {
                chat_id: chatId,
                input_time: dateNow(),
                input_user_id: data.user_id,
                registrasi_detail_id: parseInt(data.registrasi_detail_id, 10),
                peresepan_obat_id: parseInt(data.peresepan_obat_id, 10),
                pasien_id: parseInt(data.pasien_id, 10),
            },
        });
    } else {
        chatId = data.chat_id;
    }

    const chatDetailId = await generateMaxDb1("chat_detail", "chat_detail_id");
    const insertChatDetail = await prismaDb1.chat_detail.create({
        data: {
            chat_detail_id: chatDetailId,
            input_time: dateNow(),
            input_user_id: data.user_id,
            chat_id: chatId,
            isi_pesan: data.text,
            status_pesan: 1,
        },
    });

    return insertChatDetail;
};

export { checkChatIdRepo, saveChat };
