import express, { Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import cors from "cors";

import { router as welcomeRouter } from "./welcome";
import { router as notFoundRouter } from "./404";
import { router as apiRouter } from "./api/index";
import { logger, credentials, errLogger } from "./middlewares";
import { corsOptions } from "./config/corsOption";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));

app.use("/", welcomeRouter);
app.use("/api", apiRouter);

app.use(notFoundRouter);
app.use(errLogger);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT} at ${new Date()}`);
});
