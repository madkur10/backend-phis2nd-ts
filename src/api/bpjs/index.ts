import { Router } from "express";
import { router as JKNMobileController } from "./jknmobile/jknmobile.controller";

const router = Router();

router.use("/JKN-MOBILE", JKNMobileController);

export { router };