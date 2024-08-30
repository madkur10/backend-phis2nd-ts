import { Router } from "express";
import bodyParser from "body-parser";
import { authenticateToken, loginAuthentication } from "../middlewares/auth";
import { router as loginController } from "./login/login.controller";
import { router as googleController } from "./google-oauth2/googleOauth2.controller";
import { router as authController } from "./auth/auth.controller";

import { router as registerUserController } from "./users/registerUser.controller";
import { router as usersController } from "./users/users.controller";
import { router as patientController } from "./patient/patient.controller";
import { router as appointmentController } from "./appointments/appointment.controller";

import { router as antrolAutoController } from "./antrol-auto/antrolAuto.controller";
import { router as JKNMobileRouter } from "./bpjs/index";

import { router as SatuSehatController } from "./satu-sehat/";

const router = Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use("/login", loginAuthentication, loginController);
router.use("/register-user", loginAuthentication, registerUserController);
router.use("/auth", authController);
router.use("/auth-google", googleController);

router.use("/users", authenticateToken, usersController);
router.use("/patient", authenticateToken, patientController);
router.use("/appointment", authenticateToken, appointmentController);

router.use("/BPJS", JKNMobileRouter);
router.use("/antrol-auto", antrolAutoController);

router.use("/satu-sehat", SatuSehatController);

export { router };
