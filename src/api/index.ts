import { Router } from "express";
import bodyParser from "body-parser";
import { authenticateToken, loginAuthentication } from "../middlewares/auth";
import { router as loginController } from "./login/login.controller";
import { router as authController } from "./auth/auth.controller";

import { router as antrolAutoController } from "./antrol-auto/antrolAuto.controller";
import { router as JKNMobileRouter } from "./bpjs/index";
import { router as phis2ndController } from "./phis2nd/index";

import { router as SatuSehatController } from "./satu-sehat/";

const router = Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use("/login", loginAuthentication, loginController);
router.use("/auth", authController);

router.use("/BPJS", JKNMobileRouter);
router.use("/antrol-auto", antrolAutoController);
router.use("/phis2nd", phis2ndController);

router.use("/satu-sehat", SatuSehatController);

export { router };
