import { Router } from "express";
import { router as whatsappController } from "./whatsapp/whatsapp.controller";
import { router as registrasiController } from "./registrasi/registrasi.controller";

const router = Router();

router.use("/Whatsapp", whatsappController);
router.use("/registrasi", registrasiController);

export { router };
