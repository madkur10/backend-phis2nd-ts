import { file } from "googleapis/build/src/apis/file";
import { prismaDb1, prismaDb4 } from "../../db";
import { Prisma } from "@prisma/client";
import {
    generateMaxDb1,
    generateMaxDb4,
    timeHandler,
} from "../../db/database.handler";
import { dateNow } from "../../middlewares/time";
import * as dotenv from "dotenv";
dotenv.config();

const getDashboardRepo = async (start_date?: string, end_date?: string) => {
    let getDashboardResult: any;
    if (start_date && end_date) {
        getDashboardResult = await prismaDb4.$queryRaw`
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
                created_at::date BETWEEN ${start_date}::date AND ${end_date}::date;`;
    } else {
        getDashboardResult = await prismaDb4.$queryRaw`
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
                created_at::date = NOW()::date;`;
    }

    return getDashboardResult;
};

const getListTicketsRepo = async (
    bagian_id?: number,
    ticket_id?: number,
    list_dashboard?: boolean,
    start_date?: string,
    end_date?: string,
) => {
    const queryParams: any[] = [];
    let paramIndex = 1;

    let queryConditionBagian = "";
    if (bagian_id) {
        queryConditionBagian = ` and t.department_id = $${paramIndex++}`;
        queryParams.push(bagian_id);
    }

    let queryConditionTicket = "";
    if (ticket_id) {
        queryConditionTicket = ` and t.id = $${paramIndex++}`;
        queryParams.push(ticket_id);
    }

    // let queryConditionDashboard = "";
    // if (list_dashboard || ticket_id) {
    //     queryConditionDashboard = "";
    // } else {
    //     queryConditionDashboard = ` and t.status not in ('Closed', 'Resolved')`;
    // }

    let queryConditionDate = "";
    if (start_date && end_date) {
        queryConditionDate = ` and t.created_at::date between $${paramIndex++}::date and $${paramIndex++}::date`;
        queryParams.push(start_date);
        queryParams.push(end_date);
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
            t.resolved_by,
            EXTRACT(HOUR FROM (NOW() - t.created_at))::INT as duration,
            json_agg(
                json_build_object(
                'user_id_petugas', tl.admin_id,
                'note', tl.note,
                'status', tl.status_changed_to,
                'created_at', tl.created_at
                ) ORDER BY tl.created_at ASC
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
            t.description,
            t.resolved_by
        order by
            t.created_at asc
    `;
    console.log(getListTickets);

    const getListTicketsResult: any =
        await prismaDb4.$queryRawUnsafe(getListTickets, ...queryParams);
    if (getListTicketsResult.length > 0) {
        for (let i = 0; i < getListTicketsResult.length; i++) {
            const userId = parseInt(getListTicketsResult[i].user_id, 10);
            const deptId = parseInt(getListTicketsResult[i].department_id, 10);
            const resolvedById = parseInt(getListTicketsResult[i].resolved_by, 10);

            getListTicketsResult[i].nama_pegawai = isNaN(userId) ? null : await getNamaPegawaiRepo(userId);
            getListTicketsResult[i].nama_bagian = isNaN(deptId) ? null : await getNamaBagianRepo(deptId);
            getListTicketsResult[i].nama_petugas_resolved = isNaN(resolvedById) ? null : await getNamaPegawaiRepo(resolvedById);

            if (getListTicketsResult[i].ticket_log[0] && getListTicketsResult[i].ticket_log[0].user_id_petugas) {
                for (
                    let j = 0;
                    j < getListTicketsResult[i].ticket_log.length;
                    j++
                ) {
                    const petugasId = parseInt(getListTicketsResult[i].ticket_log[j].user_id_petugas, 10);
                    getListTicketsResult[i].ticket_log[j].nama_pegawai = isNaN(petugasId) ? null :
                        await getNamaPegawaiRepo(petugasId);
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
    const { ticket_id, status, priority, resolved_by } = payload;

    const data: any = {
        status: status,
    };

    if (priority !== undefined && priority !== null && priority !== "") {
        data.priority = priority;
    }

    if (resolved_by !== undefined && resolved_by !== null && resolved_by !== "") {
        data.resolved_by = parseInt(resolved_by, 10);
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
    const queryParams: any[] = [];
    let paramIndex = 1;

    let queryConditionTicket = "";
    if (ticket_id) {
        queryConditionTicket = ` and t.id = $${paramIndex++}`;
        queryParams.push(ticket_id);
    }

    let queryConditionBagianTicket = "";
    if (it_support) {
        queryConditionBagianTicket = ``;
    } else {
        if (bagian_id_ticket) {
            queryConditionBagianTicket = ` and t.department_id = $${paramIndex++}`;
            queryParams.push(bagian_id_ticket);
        } else {
            queryConditionBagianTicket = ` and t.department_id = $${paramIndex++}`;
            queryParams.push(bagian_id);
        }
    }

    const queryBagianIdParam = `$${paramIndex++}`;
    queryParams.push(bagian_id);

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
            AND tc.department_id != ${queryBagianIdParam}
            ${queryConditionBagianTicket}
            ${queryConditionTicket}
    `;

    const getListTicketsResult: any =
        await prismaDb4.$queryRawUnsafe(getListTickets, ...queryParams);

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
    getEmployeesByRefBagianRepo,
};

const getEmployeesByRefBagianRepo = async (refBagianId: number) => {
    console.log("refBagianId", refBagianId);
    const departments = await prismaDb1.bagian.findMany({
        where: {
            referensi_bagian: refBagianId,
            OR: [
                { status_batal: null },
                { status_batal: 0 }
            ]
        },
        select: {
            bagian_id: true
        }
    });

    console.log(departments);

    const bagianIds = departments.map(d => d.bagian_id);
    if (bagianIds.length === 0) return [];

    const employees = await prismaDb1.pegawai.findMany({
        where: {
            bagian_id: { in: bagianIds },
            OR: [
                { status_batal: null },
                { status_batal: 0 }
            ]
        },
        select: {
            pegawai_id: true
        }
    });

    const pegawaiIds = employees.map(e => e.pegawai_id);
    if (pegawaiIds.length === 0) return [];

    const users = await prismaDb1.users.findMany({
        where: {
            pegawai_id: { in: pegawaiIds },
            OR: [
                { status_batal: null },
                { status_batal: 0 }
            ]
        },
        select: {
            user_id: true,
            nama_pegawai: true
        },
        orderBy: {
            nama_pegawai: "asc"
        }
    });

    return users;
};
