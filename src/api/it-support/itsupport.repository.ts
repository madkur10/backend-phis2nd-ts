import { file } from "googleapis/build/src/apis/file";
import { prismaDb1, prismaDb4 } from "../../db";
import { Prisma } from "@prisma/client";
import {
    generateMaxDb1,
    generateMaxDb4,
    selectFieldDb1,
    timeHandler,
} from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const getDashboardRepo = async (start_date?: string, end_date?: string) => {
    let dateCondition;

    if (start_date && end_date) {
        dateCondition = ` BETWEEN '${start_date}' AND '${end_date}'`;
    } else {
        dateCondition = ` = NOW()::date`;
    }

    const getDashboard = `
        SELECT 
            COUNT(*) as total_ticket,
            COUNT(*) FILTER (WHERE status = 'Open') as total_open,
            COUNT(*) FILTER (WHERE status = 'In Progress') as total_progress,
            COUNT(*) FILTER (WHERE status = 'Resolved') as total_resolved,
            COUNT(*) FILTER (WHERE status = 'Closed') as total_closed,
            COUNT(*) FILTER (
                WHERE status NOT IN ('Resolved', 'Closed') 
                AND created_at < NOW() - INTERVAL '2 hours'
            ) as total_overdue
        FROM 
            tickets
        WHERE 
            created_at::date ${dateCondition};`;
    
    const getDashboardResult: any = await prismaDb4.$queryRawUnsafe(getDashboard);

    return getDashboardResult;
};

const getListTicketsRepo = async (
    bagian_id?: number,
    ticket_id?: number,
    list_dashboard?: boolean,
    start_date?: string,
    end_date?: string,
) => {
    let queryConditionBagian = "";
    let queryConditionTicket = "";
    let queryConditionDashboard = "";
    let queryConditionDate = "";

    if (bagian_id) {
        queryConditionBagian = ` and t.department_id = ${bagian_id}`;
    } else {
        queryConditionBagian = "";
    }

    if (ticket_id) {
        queryConditionTicket = ` and t.id = ${ticket_id}`;
    } else {
        queryConditionTicket = "";
    }

    if (list_dashboard || ticket_id) {
        queryConditionDashboard = "";
    } else {
        queryConditionDashboard = ` and t.status not in ('Closed', 'Resolved')`;
    }

    if (start_date || end_date) {
        queryConditionDate = ` and t.created_at::date between '${start_date}' and '${end_date}'`;
    } else {
        queryConditionDate = " and t.created_at::date = now()::date";
    }

    const getListTickets = `
        select
            t.ticket_number,
            t.department_id ,
            t.user_id ,
            c.category_name,
            t.subject,
            t.priority,
            t.status,
            t.created_at,
            t.id,
            t.description,
            EXTRACT(HOUR FROM (NOW() - t.created_at))::INT as duration,
            json_agg(
                json_build_object(
                'user_id_petugas', tl.admin_id,
                'note', tl.note,
                'status', tl.status_changed_to,
                'created_at', tl.created_at
                )
            ) ticket_log
        from
            tickets t
        join categories c on
            t.category_id = c.id
        left join ticket_logs tl on
	        t.id = tl.ticket_id
        where
            1 = 1
            ${queryConditionDate}
            ${queryConditionBagian}
            ${queryConditionTicket}
            ${queryConditionDashboard}
        group by
            t.ticket_number,
            t.department_id ,
            t.user_id ,
            c.category_name,
            t.subject,
            t.priority,
            t.status,
            t.created_at,
            t.id,
            t.description
        order by
            t.created_at asc
    `;

    const getListTicketsResult: any =
        await prismaDb4.$queryRawUnsafe(getListTickets);
    if (getListTicketsResult.length > 0) {
        for (let i = 0; i < getListTicketsResult.length; i++) {
            getListTicketsResult[i].nama_pegawai = await selectFieldDb1(
                "users",
                "nama_pegawai",
                "WHERE user_id = '" + getListTicketsResult[i].user_id + "'",
            );

            getListTicketsResult[i].nama_bagian = await selectFieldDb1(
                "bagian",
                "nama_bagian",
                "WHERE bagian_id = '" +
                    getListTicketsResult[i].department_id +
                    "'",
            );

            if (getListTicketsResult[i].ticket_log[0].user_id_petugas) {
                for (
                    let j = 0;
                    j < getListTicketsResult[i].ticket_log.length;
                    j++
                ) {
                    getListTicketsResult[i].ticket_log[j].nama_pegawai =
                        await selectFieldDb1(
                            "users",
                            "nama_pegawai",
                            "WHERE user_id = '" +
                                getListTicketsResult[i].ticket_log[j]
                                    .user_id_petugas +
                                "'",
                        );
                }
            }
        }
    }

    return getListTicketsResult;
};

const getListCategoryRepo = async () => {
    const getListCategory = await prismaDb4.categories.findMany({
        select: {
            id: true,
            category_name: true,
        },
    });

    return getListCategory;
};

const insertedTicketRepo = async (payload: any) => {
    const ticketNumberId = await generateMaxDb4(
        "tickets_number_seq",
        "ticket_number",
    );
    const ticketNumber = `TIC-${new Date().getFullYear()}${String(ticketNumberId).padStart(5, "0")}`;
    const newTicketNumber = await prismaDb4.tickets.create({
        data: {
            ticket_number: ticketNumber,
            user_id: parseInt(payload.user_id, 10),
            department_id: parseInt(payload.department_id, 10),
            category_id: parseInt(payload.category_id, 10),
            subject: payload.subject,
            description: payload.description,
            priority: payload.priority,
        },
    });

    return newTicketNumber;
};

const insertedTicketAttachmentRepo = async (payload: any) => {
    const newTicketAttachment = await prismaDb4.ticket_attachments.create({
        data: {
            ticket_id: payload.ticket_id,
            file_name: payload.file_name,
            file_type: payload.file_type,
            file_size: payload.file_size,
            file_data: payload.file_data,
        },
    });

    return newTicketAttachment;
};

const insertedTicketChatRepo = async (payload: any, awal?: boolean) => {
    let message;
    if (awal) {
        message = `Ticket baru dibuat dengan subject: ${payload.subject} dan deskripsi: ${payload.description}`;
    } else {
        message = payload.message;
    }
    const newTicketChat = await prismaDb4.ticket_chats.create({
        data: {
            ticket_id: parseInt(payload.ticket_id, 10),
            user_id: parseInt(payload.user_id, 10),
            department_id: parseInt(payload.department_id, 10),
            message: message ? message : null,
            file_data: payload.file_data ? payload.file_data : null,
            file_name: payload.file_name ? payload.file_name : null,
            file_type: payload.file_type ? payload.file_type : null,
        },
    });

    return newTicketChat;
};

const updateTicketRepo = async (payload: any) => {
    const { ticket_id, status, priority } = payload;

    const data: any = {
        status: status,
    };

    if (priority !== undefined && priority !== null && priority !== "") {
        data.priority = priority;
    }

    const updateTicket = await prismaDb4.tickets.update({
        where: {
            id: parseInt(ticket_id, 10),
        },
        data: data,
    });

    return updateTicket;
};

const insertedTicketLogRepo = async (payload: any) => {
    const insertedTicketLog = await prismaDb4.ticket_logs.create({
        data: {
            ticket_id: parseInt(payload.ticket_id, 10),
            admin_id: parseInt(payload.user_id, 10),
            status_changed_to: payload.status,
            note: payload.note,
        },
    });
    return insertedTicketLog;
};

const getNamaPegawaiRepo = async (user_id: number) => {
    const getNamaPegawai = await prismaDb1.users.findUnique({
        where: {
            user_id: user_id,
        },
        select: {
            nama_pegawai: true,
        },
    });
    return getNamaPegawai?.nama_pegawai || null;
};

const getNamaBagianRepo = async (department_id: number) => {
    const getNamaBagian = await prismaDb1.bagian.findUnique({
        where: {
            bagian_id: department_id,
        },
        select: {
            nama_bagian: true,
        },
    });
    return getNamaBagian?.nama_bagian || null;
};

const getNamaCategoryRepo = async (category_id: number) => {
    const getNamaCategory = await prismaDb4.categories.findUnique({
        where: {
            id: category_id,
        },
        select: {
            category_name: true,
        },
    });
    return getNamaCategory?.category_name || null;
};

const getTicketAttachmentsRepo = async (ticket_id: number) => {
    const attachments = await prismaDb4.ticket_attachments.findMany({
        where: {
            ticket_id: ticket_id,
        },
        select: {
            id: true,
            file_name: true,
            file_type: true,
            file_size: true,
            file_data: true,
        },
    });

    const formattedAttachments = attachments.map((att) => ({
        ...att,
        file_data: att.file_data.toString("base64"),
    }));

    return formattedAttachments;
};

const getUnreadCountRepo = async (
    bagian_id: number,
    ticket_id?: number,
    bagian_id_ticket?: number,
    it_support?: boolean,
) => {
    let queryConditionTicket = "";
    let queryConditionBagianTicket = "";
    if (ticket_id) {
        queryConditionTicket = ` and t.id = ${ticket_id}`;
    } else {
        queryConditionTicket = "";
    }

    if (it_support) {
        queryConditionBagianTicket = ``;
    } else {
        if (bagian_id_ticket) {
            queryConditionBagianTicket = ` and t.department_id = ${bagian_id_ticket}`;
        } else {
            queryConditionBagianTicket = ` and t.department_id = ${bagian_id}`;
        }
    }

    const getListTickets = `
        SELECT
            COUNT(*)
        FROM
            ticket_chats tc
        INNER JOIN tickets t 
            ON tc.ticket_id = t.id
        WHERE
            tc.is_read = false
            AND t.created_at::date = NOW()::date
            AND t.status NOT IN ('Closed', 'Resolved')
            AND tc.department_id != ${bagian_id}
            ${queryConditionBagianTicket}
            ${queryConditionTicket}
    `;

    const getListTicketsResult: any =
        await prismaDb4.$queryRawUnsafe(getListTickets);

    return getListTicketsResult[0].count;
};

const getTicketChatRepo = async (ticket_id: number) => {
    const getTicketChat = await prismaDb4.ticket_chats.findMany({
        where: {
            ticket_id: ticket_id,
        },
        orderBy: {
            created_at: "asc",
        },
    });
    return getTicketChat;
};

const updateChatReadRepo = async (ticket_id: number, user_id: number) => {
    const updateChatRead = await prismaDb4.ticket_chats.updateMany({
        where: {
            ticket_id: ticket_id,
            user_id: { not: user_id },
        },
        data: {
            is_read: true,
        },
    });
    return updateChatRead;
};

export {
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
};
