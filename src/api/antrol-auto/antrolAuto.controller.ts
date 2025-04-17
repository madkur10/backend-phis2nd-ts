import { Router, Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import {
    hitFisioNow,
    updateTask,
    updateTaskFisio,
    hitUlangAddAntrol
} from "./antrolAuto.service";

export const router = Router();

router.get("/fisio-now/:limit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number= parseInt(req.params.limit, 10);
        const dataFisio = await hitFisioNow(limit);
        if (dataFisio.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataFisio,
                },
            });
            console.log(dataFisio);
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})

router.get("/update-task/:limit/task/:task_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number     = parseInt(req.params.limit, 10);
        const task_id: number   = parseInt(req.params.task_id, 10);
        const dataUpdateTaskNow: any = await updateTask(limit, task_id);

        if (dataUpdateTaskNow.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataUpdateTaskNow,
                },
            });
            console.log(dataUpdateTaskNow);
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})


router.get("/update-task-backdate/:limit/task/:task_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number     = parseInt(req.params.limit, 10);
        const task_id: number   = parseInt(req.params.task_id, 10);
        const dataUpdateTaskNow: any = await updateTask(limit, task_id, true);

        if (dataUpdateTaskNow.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataUpdateTaskNow,
                },
            });
            console.log(dataUpdateTaskNow);
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})

router.get("/update-task-fisio/:limit/task/:task_id", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number     = parseInt(req.params.limit, 10);
        const task_id: number   = parseInt(req.params.task_id, 10);
        const dataUpdateTaskNow: any = await updateTaskFisio(limit, task_id);

        if (dataUpdateTaskNow.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataUpdateTaskNow,
                },
            });
            console.log(dataUpdateTaskNow);
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})

router.get("/hit-ulang-add/:limit", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit: number     = parseInt(req.params.limit, 10);
        const dataUpdateTaskNow: any = await hitUlangAddAntrol(limit);

        if (dataUpdateTaskNow.length > 0) {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Operation completed successfully!",
                },
                response: {
                    dataUpdateTaskNow,
                },
            });
            console.log(dataUpdateTaskNow);
        } else {
            res.status(200).json({
                metadata: {
                    code: 200,
                    msg: "Data tidak tersedia!",
                },
            });
        }
    } catch (error: any) {
        next(error.message.replace(/\n/g, " "));
    }
})