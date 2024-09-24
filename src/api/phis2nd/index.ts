import { Router } from "express";
import { router as whatsappController } from "./whatsapp/whatsapp.controller";

const router = Router();

router.use("/Whatsapp", whatsappController);

export { router };
