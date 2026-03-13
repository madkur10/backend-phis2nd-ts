import { get } from "http";
import {
    getDashboardRepo,
    getListTicketsRepo,
    getListCategoryRepo,
    insertedTicketRepo,
    insertedTicketAttachmentRepo,
    updateTicketRepo,
    insertedTicketLogRepo,
    getNamaPegawaiRepo,
    getNamaBagianRepo,
    getNamaCategoryRepo,
    getTicketAttachmentsRepo,
    insertedTicketChatRepo,
    getUnreadCountRepo,
    getTicketChatRepo,
    updateChatReadRepo,
} from "./itsupport.repository";

const getDashboardService = async (start_date?: string, end_date?: string) => {
    let getDashboard: any;
    if (start_date && end_date) {
        getDashboard = await getDashboardRepo(start_date, end_date);
    } else {
        getDashboard = await getDashboardRepo();
    }
    return getDashboard;
};

const getListTicketsService = async (
    bagian_id?: number,
    list_dashboard?: boolean,
    it_support?: boolean,
    start_date?: string,
    end_date?: string,
) => {
    let getListTickets: any;
    let getUnreadCount: any;
    if (bagian_id && !it_support) {
        getListTickets = await getListTicketsRepo(bagian_id);
    } else {
        if (list_dashboard) {
            getListTickets = await getListTicketsRepo(
                undefined,
                undefined,
                true,
                start_date,
                end_date,
            );
        } else {
            getListTickets = await getListTicketsRepo();
        }
    }

    if (!list_dashboard) {
        for (let i = 0; i < getListTickets.length; i++) {
            getUnreadCount = await getUnreadCountRepo(
                bagian_id as number,
                getListTickets[i].id,
                getListTickets[i].department_id,
            );
            getListTickets[i].unread_count = getUnreadCount;
        }
    }

    return getListTickets;
};

const getListCategoryService = async () => {
    const getListCategory: any = await getListCategoryRepo();
    return getListCategory;
};

const insertedTicketService = async (payload: any) => {
    const insertedTicket: any = await insertedTicketRepo(payload);
    const insertedTicketChat: any = await insertedTicketChatRepo({
        ...payload,
        ticket_id: insertedTicket.id,
    }, true);
    if (payload.attachments && payload.attachments.length > 0) {
        for (let i = 0; i < payload.attachments.length; i++) {
            const attachmentPayload = {
                ticket_id: insertedTicket.id,
                file_name: payload.attachments[i].name,
                file_type: payload.attachments[i].type,
                file_size: payload.attachments[i].size,
                file_data: bufferBase64(payload.attachments[i].base64),
            };
            await insertedTicketAttachmentRepo(attachmentPayload);
        }
    }

    const getNamaPegawai: any = await getNamaPegawaiRepo(
        insertedTicket.user_id,
    );
    const getNamaBagian: any = await getNamaBagianRepo(
        insertedTicket.department_id,
    );
    const getNamaCategory: any = await getNamaCategoryRepo(
        insertedTicket.category_id,
    );

    insertedTicket.nama_pegawai = getNamaPegawai;
    insertedTicket.nama_bagian = getNamaBagian;
    insertedTicket.duration = 0;
    insertedTicket.category_name = getNamaCategory;

    return {
        metadata: { code: 200, message: "Success Insert Ticket" },
        data: insertedTicket,
    };
};

const updateTicketsService = async (payload: any) => {
    const updateTicket: any = await updateTicketRepo(payload);
    if (updateTicket) {
        await insertedTicketLogRepo(payload);
    }
    return updateTicket;
};

const getTicketDetailService = async (ticket_id: number) => {
    const getTicketDetail: any = await getListTicketsRepo(undefined, ticket_id);
    let ticketAttachments: any = [];
    if (getTicketDetail && getTicketDetail.length > 0) {
        ticketAttachments = await getTicketAttachmentsRepo(ticket_id);
    }
    getTicketDetail[0].attachments = ticketAttachments ?? [];
    return getTicketDetail;
};

const getUnreadCountService = async (bagian_id: number, it_support?: boolean) => {
    const getUnreadCount: any = await getUnreadCountRepo(bagian_id, undefined, undefined, it_support);
    return getUnreadCount;
};

const getTicketChatService = async (ticket_id: number) => {
    const getTicketChat: any = await getTicketChatRepo(ticket_id);
    let getNamaPegawai;
    let getNamaBagian;
    if (getTicketChat.length > 0) {
        for (let i = 0; i < getTicketChat.length; i++) {
            getNamaPegawai = await getNamaPegawaiRepo(getTicketChat[i].user_id);
            getNamaBagian = await getNamaBagianRepo(
                getTicketChat[i].department_id,
            );
            getTicketChat[i].nama_pegawai = getNamaPegawai;
            getTicketChat[i].nama_bagian = getNamaBagian;
            if (getTicketChat[i].file_data) {
                getTicketChat[i].image = getTicketChat[i].file_data.toString('base64');
            }
        }
    }
    return getTicketChat;
};

const chatSupportService = async (payload: any) => {
    let imageResult = null;
    if (payload.file_data) {
        payload.file_data = bufferBase64(payload.file_data);

        imageResult = payload.file_data.toString('base64')
    }
    const chatData = await insertedTicketChatRepo(payload, false);
    let getNamaPegawai = await getNamaPegawaiRepo(parseInt(payload.user_id));
    let getNamaBagian = await getNamaBagianRepo(parseInt(payload.department_id));
    
    let resultChatData = {...chatData, nama_pegawai: getNamaPegawai, nama_bagian: getNamaBagian, image: imageResult};
    
    return {
        code: 200,
        message: "OK",
        data: resultChatData,
    };
};

const updateChatReadService = async (ticket_id: number, user_id: number) => {
    const updateChatRead: any = await updateChatReadRepo(ticket_id, user_id);
    return updateChatRead;
};

const bufferBase64 = (base64String: string) => {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
    return Buffer.from(base64Data, "base64");
};

export {
    getDashboardService,
    getListTicketsService,
    getListCategoryService,
    insertedTicketService,
    updateTicketsService,
    getTicketDetailService,
    getUnreadCountService,
    getTicketChatService,
    chatSupportService,
    updateChatReadService,
};
