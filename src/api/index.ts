import { Router } from "express";
import bodyParser from "body-parser";
import { authenticateToken, loginAuthentication } from "./../middlewares/auth";
import { router as loginController } from "./login/login.controller";
import { router as usersController } from "./users/users.controller";

const router = Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use("/login", loginAuthentication, loginController);

router.use("/users", authenticateToken, usersController);

export { router };
