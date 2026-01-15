import { check } from "express-validator";
import { saveChat, checkChatIdRepo } from "./chat.repository";

const chatFarmasiKasir = async (data: any) => {
    const checkChatId: any = await checkChatIdRepo(data);
    if (checkChatId) {
        data.chat_id = checkChatId.chat_id;
    }
    
    const chatData: any = await saveChat(data);
    
    if (chatData) {
        return {
            code: 200,
            message: "OK",
            chat_detail_id: chatData.chat_detail_id,
            nama_pasien: checkChatId.nama_pasien,
            no_mr: checkChatId.no_mr,
        };
    }
};

export { chatFarmasiKasir };