import {
    confirmWhatsapp,
    checkConfirmWhatsapp,
    checkDataKunjungan,
} from "./whatsapp.repository";
import * as dotenv from "dotenv";

dotenv.config();

const confirmWhatsappService = async (data: any) => {
    const checkConfirmWhatsappData: any = await checkConfirmWhatsapp(data);
    if (checkConfirmWhatsappData.tgl_jam_wa_konfirmasi) {
        const dataKunjunganPasien: any = await checkDataKunjungan(data);
        return {
            code: 201,
            message: "Data Sudah Terkonfirmasi",
            data: dataKunjunganPasien,
        };
    }

    const resultConfirmWhatsapp: any = await confirmWhatsapp(data);
    const dataKunjunganPasien: any = await checkDataKunjungan(data);
    return {
        code: 200,
        message: "Data Berhasil Checkin",
        data: dataKunjunganPasien,
    };
};

export { confirmWhatsappService };
