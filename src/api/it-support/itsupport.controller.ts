import { Router, Request, Response, NextFunction } from "express";
import moment = require("moment-timezone");
import fs from "fs";
import {
    body,
    header,
    param,
    query,
    validationResult,
} from "express-validator";
import {
    getDashboardService,
    getListTicketsService,
    getListCategoryService,
    updateTicketsService,
    getTicketDetailService,
    getUnreadCountService,
    getTicketChatService,
    updateChatReadService,
} from "./itsupport.service";
export const router = Router();

router.get(
    "/get-dashboard",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const start_date = req.query.start_date as string | undefined;
            const end_date = req.query.end_date as string | undefined;
            const getDashboard = await getDashboardService(start_date, end_date);

            res.status(200).json({
                status: 200,
                message: "Success Get IT Support Dashboard",
                data: getDashboard,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/get-today-tickets",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const listDashboard = req.query.list_dashboard as
                | boolean
                | undefined;
            const startDate = req.query.start_date as string | undefined;
            const endDate = req.query.end_date as string | undefined;
            const getListTickets = await getListTicketsService(
                0,
                listDashboard,
                false,
                startDate,
                endDate,
            );
            res.status(200).json({
                status: 200,
                message: "Success Get IT Support List Tickets",
                data: getListTickets,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/get-today-tickets/bagian_id/:bagian_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bagianId = parseInt(req.params.bagian_id, 10);
            const it_support = req.query.it_support as boolean | undefined;
            const getListTickets = await getListTicketsService(
                bagianId,
                false,
                it_support,
            );
            res.status(200).json({
                status: 200,
                message: "Success Get IT Support List Tickets",
                data: getListTickets,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/category",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const getListCategory = await getListCategoryService();
            res.status(200).json({
                status: 200,
                message: "Success Get IT Support List Category",
                data: getListCategory,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.post(
    "/update-ticket-status",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updateListTickets = await updateTicketsService(req.body);
            res.status(200).json({
                status: 200,
                message: "Success Update IT Support Ticket Status",
                data: updateListTickets,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/get-ticket-detail/:ticket_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const getTicketDetail = await getTicketDetailService(
                parseInt(req.params.ticket_id, 10),
            );

            res.status(200).json({
                status: 200,
                message: "Success Get IT Support Ticket Detail",
                data: getTicketDetail,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/get-unread-count/bagian_id/:bagian_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const it_support = req.query.it_support as boolean | undefined;
            const getUnreadCount = await getUnreadCountService(
                parseInt(req.params.bagian_id, 10),
                it_support,
            );

            res.status(200).json({
                status: 200,
                message: "Success Get IT Support Unread Count",
                data: getUnreadCount,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.get(
    "/get-ticket-chat/:ticket_id",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const getTicketChat = await getTicketChatService(
                parseInt(req.params.ticket_id, 10),
            );

            res.status(200).json({
                status: 200,
                message: "Success Get IT Support Ticket Chat",
                data: getTicketChat,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);

router.post(
    "/update-chat-read",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ticket_id = parseInt(req.body.ticket_id, 10);
            const user_id = parseInt(req.body.user_id, 10);
            const updateChatRead = await updateChatReadService(
                ticket_id,
                user_id,
            );
            res.status(200).json({
                status: 200,
                message: "Success Update IT Support Chat Read",
                data: updateChatRead,
            });
        } catch (error: any) {
            next(error.message.replace(/\n/g, " "));
        }
    },
);
